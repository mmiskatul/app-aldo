import axios from "axios";
import { router } from "expo-router";
import { useAppStore } from "../store/useAppStore";
import { API_REQUEST_TIMEOUT_MS, getApiBaseUrl, getApiErrorMessage, isNetworkLikeApiError } from "../utils/api";
import { showModalErrorMessage } from "../utils/feedback";

type ApiErrorRecord = {
  response?: {
    status?: number;
    data?: {
      error?: {
        code?: string;
        message?: string;
        details?: Record<string, unknown>;
      };
      code?: string;
      message?: string;
      detail?: string;
    };
  };
  message?: string;
  config?: {
    url?: string;
    headers?: Record<string, string>;
    _retry?: boolean;
  };
};

const apiUrl = getApiBaseUrl();

console.log("[apiClient] resolved baseURL:", apiUrl);

const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: API_REQUEST_TIMEOUT_MS,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];
let lastConnectionErrorShownAt = 0;
let isRedirectingToSubscription = false;
let isRedirectingToOnboarding = false;

const CONNECTION_ERROR_THROTTLE_MS = 4000;

const showConnectionError = () => {
  const now = Date.now();
  if (now - lastConnectionErrorShownAt < CONNECTION_ERROR_THROTTLE_MS) {
    return;
  }
  lastConnectionErrorShownAt = now;
  showModalErrorMessage(
    "Please check the internet.",
    "Connection error"
  );
};

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const asOptionalString = (value: unknown): string | null => {
  if (typeof value === "string") {
    return value;
  }
  return value == null ? null : String(value);
};

const getApiErrorCode = (error: unknown): string => {
  const normalizedError = error as ApiErrorRecord;
  return String(normalizedError?.response?.data?.error?.code || normalizedError?.response?.data?.code || "").toLowerCase();
};

const getApiErrorResponseMessage = (error: unknown): string => {
  const normalizedError = error as ApiErrorRecord;
  return String(
    normalizedError?.response?.data?.error?.message ||
      normalizedError?.response?.data?.message ||
      normalizedError?.response?.data?.detail ||
      normalizedError?.message ||
      ""
  );
};

const isStalePersistedSessionError = (error: unknown): boolean => {
  const normalizedError = error as ApiErrorRecord;
  return (
    normalizedError?.response?.status === 401 &&
    getApiErrorCode(error) === "unauthorized" &&
    getApiErrorResponseMessage(error).toLowerCase().includes("user not found")
  );
};

const clearStaleSession = () => {
  useAppStore.getState().logout();
  router.replace("/(auth)" as any);
};

const redirectToSubscriptionStatus = () => {
  if (isRedirectingToSubscription) {
    return;
  }
  isRedirectingToSubscription = true;
  router.replace("/(auth)/subscription-status" as any);
  setTimeout(() => {
    isRedirectingToSubscription = false;
  }, 1500);
};

const markLocalSubscriptionRequired = (error: unknown) => {
  const normalizedError = error as ApiErrorRecord;
  const { user, tokens, setUser, clearHomeScreenCache, clearAnalyticsScreenCache } = useAppStore.getState();
  if (!user) {
    return;
  }
  const details = normalizedError?.response?.data?.error?.details || {};

  setUser(
    {
      ...user,
      subscription_plan_name: asOptionalString(details.subscription_plan_name) ?? user.subscription_plan_name ?? null,
      subscription_plan: asOptionalString(details.subscription_plan) ?? user.subscription_plan ?? null,
      subscription_status: asOptionalString(details.subscription_status) ?? user.subscription_status ?? "canceled",
      subscription_selection_required: true,
    },
    tokens
  );
  clearHomeScreenCache();
  clearAnalyticsScreenCache();
};

const redirectToOnboarding = () => {
  if (isRedirectingToOnboarding) {
    return;
  }
  isRedirectingToOnboarding = true;
  router.replace("/(auth)/setup" as any);
  setTimeout(() => {
    isRedirectingToOnboarding = false;
  }, 1500);
};

// Request interceptor: Attach token
apiClient.interceptors.request.use(
  (config) => {
    const { tokens, appLanguage } = useAppStore.getState();
    if (tokens?.access_token) {
      config.headers.Authorization = `Bearer ${tokens.access_token}`;
    }
    if (appLanguage) {
      config.headers['Accept-Language'] = appLanguage;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const normalizedError = error as ApiErrorRecord;
    if (isNetworkLikeApiError(error)) {
      showConnectionError();
    }

    const subscriptionErrorCode = normalizedError.response?.data?.error?.code;
    if (
      normalizedError.response?.status === 403 &&
      subscriptionErrorCode === "subscription_required"
    ) {
      markLocalSubscriptionRequired(error);
      redirectToSubscriptionStatus();
    }
    if (normalizedError.response?.status === 403 && subscriptionErrorCode === "onboarding_required") {
      redirectToOnboarding();
    }

    const originalRequest = normalizedError.config;
    const accessToken = useAppStore.getState().tokens?.access_token;
    const refreshToken = useAppStore.getState().tokens?.refresh_token;
    const requestUrl = String(originalRequest?.url || "");
    const isRefreshRequest = requestUrl.includes("/api/v1/auth/refresh");

    if (accessToken && isStalePersistedSessionError(error)) {
      console.log("[apiClient] Stored session no longer exists on this backend; logging out.");
      clearStaleSession();
      return Promise.reject(error);
    }

    const shouldAttemptRefresh =
      normalizedError.response?.status === 401 &&
      !originalRequest?._retry &&
      !isRefreshRequest &&
      !!accessToken;

    if (shouldAttemptRefresh) {
      if (!originalRequest) {
        return Promise.reject(error);
      }

      const retryHeaders = originalRequest.headers ?? {};
      originalRequest.headers = retryHeaders;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            retryHeaders.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      console.log("[apiClient] Token expired, attempting refresh...");

      if (!refreshToken) {
        processQueue(error, null);
        clearStaleSession();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${apiUrl}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newTokens = res.data; // Expecting { access_token, refresh_token, token_type }
        console.log("[apiClient] Refresh successful.");
        useAppStore.getState().setTokens(newTokens);

        processQueue(null, newTokens.access_token);
        retryHeaders.Authorization = `Bearer ${newTokens.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        const normalizedRefreshError = refreshError as ApiErrorRecord;
        console.log("[apiClient] Refresh failed:", normalizedRefreshError.response?.data || normalizedRefreshError.message);
        processQueue(refreshError, null);
        clearStaleSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (normalizedError.response?.status === 401 && !accessToken) {
      useAppStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
