import axios from "axios";
import { useAppStore } from "../store/useAppStore";

const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://risto-ai.vercel.app";

const apiClient = axios.create({
  baseURL: apiUrl,
});

let isRefreshing = false;
let failedQueue: any[] = [];

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
    const tokens = useAppStore.getState().tokens;
    if (tokens?.access_token) {
      config.headers.Authorization = `Bearer ${tokens.access_token}`;
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
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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

      const refresh_token = useAppStore.getState().tokens?.refresh_token; 

      if (!refresh_token) {
        useAppStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${apiUrl}/api/v1/auth/refresh`, {
          refresh_token: refresh_token,
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

    return Promise.reject(error);
  }
);

export default apiClient;
