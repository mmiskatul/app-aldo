import Constants from "expo-constants";
import { Platform } from "react-native";

export const API_REQUEST_TIMEOUT_MS = 15_000;

const LOCAL_HOSTS = new Set(["0.0.0.0", "127.0.0.1", "localhost"]);

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

  return expoExtraApiUrl;
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

const formatValidationFieldName = (loc: unknown): string => {
  const parts = Array.isArray(loc) ? loc : [];
  const relevantParts = parts
    .map((part) => String(part))
    .filter((part) => !["body", "query", "path", "method_one", "method_two"].includes(part));
  const field = relevantParts[relevantParts.length - 1] || "";

  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getValidationErrors = (error: any): any[] => {
  const wrappedErrors = error?.response?.data?.error?.details?.errors;
  if (Array.isArray(wrappedErrors)) {
    return wrappedErrors;
  }

  const detailErrors = error?.response?.data?.detail;
  if (Array.isArray(detailErrors)) {
    return detailErrors;
  }

  return [];
};

const getValidationErrorMessage = (error: any): string | null => {
  const validationErrors = getValidationErrors(error);
  if (validationErrors.length === 0) {
    return null;
  }

  const firstError = validationErrors[0];
  const fieldName = formatValidationFieldName(firstError?.loc);
  const message = String(firstError?.msg || "Invalid value");

  return fieldName ? `${fieldName}: ${message}` : message;
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

  const missingFields = error?.response?.data?.error?.details?.missing_fields;
  if (Array.isArray(missingFields) && missingFields.length > 0) {
    const baseMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      fallback;
    return `${baseMessage}. Missing: ${missingFields.join(", ")}`;
  }

  const validationMessage = getValidationErrorMessage(error);
  if (validationMessage) {
    return validationMessage;
  }

  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.detail ||
    error?.message ||
    fallback
  );
};
