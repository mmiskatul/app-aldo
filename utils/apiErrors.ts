import { getApiErrorMessage } from "./api";
import { showErrorMessage } from "./feedback";

export const getApiDisplayMessage = (error: any, fallback: string) =>
  getApiErrorMessage(error, fallback);

const sanitizeApiErrorForLog = (error: any) => {
  const code = error?.response?.data?.error?.code;
  const status = error?.response?.status;
  const message = getApiErrorMessage(error, "Request failed.");
  return { status, code, message };
};

export const logApiError = (scope: string, error: any) => {
  console.error(`[${scope}]`, sanitizeApiErrorForLog(error));
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
