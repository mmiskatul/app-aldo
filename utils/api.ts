import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { Platform } from "react-native";

const DEFAULT_API_URL = "https://risto-ai.vercel.app";

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
  const candidates = [
    Linking.createURL("/"),
    (Constants as any)?.expoGoConfig?.debuggerHost
      ? `http://${(Constants as any).expoGoConfig.debuggerHost}`
      : null,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = candidate
      .replace(/^exp:\/\//, "http://")
      .replace(/^exps:\/\//, "https://");
    const parsed = parseUrl(normalized);
    if (parsed?.hostname) {
      return parsed.hostname;
    }
  }

  return null;
};

export const getApiBaseUrl = (): string => {
  const configured = (process.env.EXPO_PUBLIC_API_URL || "").trim();
  if (!configured) {
    return DEFAULT_API_URL;
  }

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
    const expoHost = resolveExpoHost();
    if (expoHost && !LOCAL_HOSTS.has(expoHost)) {
      return `${protocol}//${expoHost}${port}`;
    }
    return `${protocol}//10.0.2.2${port}`;
  }

  if (Platform.OS === "ios") {
    const expoHost = resolveExpoHost();
    if (expoHost && !LOCAL_HOSTS.has(expoHost)) {
      return `${protocol}//${expoHost}${port}`;
    }
  }

  return configured;
};
