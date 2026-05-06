import axios from "axios";
import { router } from "expo-router";
import { useAppStore } from "../store/useAppStore";
import { API_REQUEST_TIMEOUT_MS, getApiBaseUrl, getApiErrorMessage, isNetworkLikeApiError } from "../utils/api";
import { showErrorMessage } from "../utils/feedback";

const apiUrl = getApiBaseUrl();

console.log("[apiClient] resolved baseURL:", apiUrl);

const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: API_REQUEST_TIMEOUT_MS,
});

let isRefreshing = false;
let failedQueue: any[] = [];
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
  showErrorMessage(
    getApiErrorMessage(
      { code: "ERR_NETWORK" },
      "Please check your internet connection and try again.",
      apiUrl
    ),
    "Connection error"
  );
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const getApiErrorCode = (error: any): string => {
  return String(error?.response?.data?.error?.code || error?.response?.data?.code || "").toLowerCase();
};

const getApiErrorResponseMessage = (error: any): string => {
  return String(
    error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error?.message ||
      ""
  );
};

const isStalePersistedSessionError = (error: any): boolean => {
  return (
    error?.response?.status === 401 &&
    getApiErrorCode(error) === "unauthorized" &&
    getApiErrorResponseMessage(error).toLowerCase().includes("user not found")
  );
};

const clearStaleSession = () => {
  useAppStore.getState().logout();
  router.replace("/(auth)" as any);
};

const redirectToSubscriptionSelection = () => {
  if (isRedirectingToSubscription) {
    return;
  }
  isRedirectingToSubscription = true;
  router.replace("/(auth)/subscription" as any);
  setTimeout(() => {
    isRedirectingToSubscription = false;
  }, 1500);
};

const markLocalSubscriptionRequired = () => {
  const { user, tokens, setUser, clearHomeScreenCache, clearAnalyticsScreenCache } = useAppStore.getState();
  if (!user) {
    return;
  }

  setUser(
    {
      ...user,
      subscription_status: "canceled",
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
  async (error) => {
    if (isNetworkLikeApiError(error)) {
      showConnectionError();
    }

    const subscriptionErrorCode = error.response?.data?.error?.code;
    if (
      error.response?.status === 403 &&
      subscriptionErrorCode === "subscription_required"
    ) {
      markLocalSubscriptionRequired();
      redirectToSubscriptionSelection();
    }
    if (error.response?.status === 403 && subscriptionErrorCode === "onboarding_required") {
      redirectToOnboarding();
    }

    const originalRequest = error.config;
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
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isRefreshRequest &&
      !!accessToken;

    if (shouldAttemptRefresh) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
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
        useAppStore.getState().logout();
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
        originalRequest.headers["Authorization"] = `Bearer ${newTokens.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        console.log("[apiClient] Refresh failed:", refreshError.response?.data || refreshError.message);
        processQueue(refreshError, null);
        useAppStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && !accessToken) {
      useAppStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
