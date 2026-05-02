import { getApiErrorMessage } from "./api";
import { showErrorMessage } from "./feedback";

export const getApiDisplayMessage = (error: any, fallback: string) =>
  getApiErrorMessage(error, fallback);

export const logApiError = (scope: string, error: any) => {
  console.error(`[${scope}]`, error?.response?.data || error?.message || error);
};

export const showApiError = (
  scope: string,
  error: any,
  fallback: string,
  title = "Error",
) => {
  logApiError(scope, error);
  showErrorMessage(getApiDisplayMessage(error, fallback), title);
};
