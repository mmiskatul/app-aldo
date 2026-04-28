import axios from "axios";
import { useAppStore } from "../store/useAppStore";
import { getApiBaseUrl } from "../utils/api";
import { showErrorMessage } from "../utils/feedback";

const apiUrl = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: apiUrl,
});

let isRefreshing = false;
let failedQueue: any[] = [];
let lastConnectionErrorShownAt = 0;

const CONNECTION_ERROR_THROTTLE_MS = 4000;

const isConnectionError = (error: any) => {
  return (
    !error?.response &&
    (error?.code === "ERR_NETWORK" ||
      error?.code === "ECONNABORTED" ||
      error?.message === "Network Error" ||
      String(error?.message || "").toLowerCase().includes("network"))
  );
};

const showConnectionError = () => {
  const now = Date.now();
  if (now - lastConnectionErrorShownAt < CONNECTION_ERROR_THROTTLE_MS) {
    return;
  }
  lastConnectionErrorShownAt = now;
  showErrorMessage("Please check your internet connection and try again.", "Connection error");
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
    if (isConnectionError(error)) {
      showConnectionError();
    }

    const originalRequest = error.config;
    const accessToken = useAppStore.getState().tokens?.access_token;
    const refreshToken = useAppStore.getState().tokens?.refresh_token;
    const requestUrl = String(originalRequest?.url || "");
    const isRefreshRequest = requestUrl.includes("/api/v1/auth/refresh");
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
