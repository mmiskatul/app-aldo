import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_API_URL = "http://127.0.0.1:8000";
export const API_REQUEST_TIMEOUT_MS = 15_000;

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost"]);

type ParsedUrl = {
  protocol: string;
  hostname: string;
  port: string;
};

const parseUrl = (value: string): ParsedUrl | null => {
  const match = value.trim().match(/^([a-z][a-z0-9+\-.]*:)?\/\/([^/:?#]+)(?::(\d+))?/i);
  if (!match) {
    return null;
  }

  return {
    protocol: match[1] || "http:",
    hostname: match[2],
    port: match[3] || "",
  };
};

const resolveExpoHost = (): string | null => {
  const debuggerHost = String(
    (Constants as any)?.expoGoConfig?.debuggerHost ||
      (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
      ""
  ).trim();

  if (!debuggerHost) {
    return null;
  }

  const normalized = debuggerHost.includes("://") ? debuggerHost : `http://${debuggerHost}`;
  const parsed = parseUrl(normalized);
  return parsed?.hostname || null;
};

const getConfiguredApiUrl = (): string => {
  const configured = (process.env.EXPO_PUBLIC_API_URL || "").trim();
  if (configured) {
    return configured;
  }

  const expoExtraApiUrl = String(
    (Constants as any)?.expoConfig?.extra?.apiUrl ||
      (Constants as any)?.manifest2?.extra?.expoClient?.extra?.apiUrl ||
      ""
  ).trim();

  return expoExtraApiUrl || DEFAULT_API_URL;
};

export const getApiBaseUrl = (): string => {
  const configured = getConfiguredApiUrl();
  const parsedConfigured = parseUrl(configured);
  if (!parsedConfigured) {
    return configured;
  }

  if (!LOCAL_HOSTS.has(parsedConfigured.hostname)) {
    return configured;
  }

  const protocol = parsedConfigured.protocol || "http:";
  const port = parsedConfigured.port ? `:${parsedConfigured.port}` : "";

  if (Platform.OS === "android") {
    // Android emulator should always use the host bridge for local backend access.
    return `${protocol}//10.0.2.2${port}`;
  }

  if ((Platform.OS === "ios" || Platform.OS === "web") && !process.env.EXPO_PUBLIC_API_URL?.trim()) {
    const expoHost = resolveExpoHost();
    if (expoHost && !LOCAL_HOSTS.has(expoHost)) {
      return `${protocol}//${expoHost}${port}`;
    }
  }

  return configured;
};

export const isNetworkLikeApiError = (error: any): boolean => {
  return (
    !error?.response &&
    (error?.code === "ERR_NETWORK" ||
      error?.code === "ECONNABORTED" ||
      error?.message === "Network Error" ||
      String(error?.message || "").toLowerCase().includes("network") ||
      String(error?.message || "").toLowerCase().includes("timeout"))
  );
};

const getResponseContentType = (error: any): string => {
  return String(error?.response?.headers?.["content-type"] || "").toLowerCase();
};

export const getApiErrorMessage = (
  error: any,
  fallback: string,
  apiUrl: string = getApiBaseUrl()
): string => {
  if (isNetworkLikeApiError(error)) {
    return `Can't reach the backend at ${apiUrl}. Check EXPO_PUBLIC_API_URL and make sure the FastAPI server is running.`;
  }

  const status = Number(error?.response?.status || 0);
  const contentType = getResponseContentType(error);

  if (
    status === 404 ||
    status === 405 ||
    contentType.includes("text/html") ||
    contentType.includes("text/plain")
  ) {
    return `The app is calling ${apiUrl}, but that URL does not look like the FastAPI backend. Check EXPO_PUBLIC_API_URL and make sure it points to the API server.`;
  }

  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.message ||
    fallback
  );
};
