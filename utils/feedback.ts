import { Alert, AlertButton } from "react-native";

export type AppMessageType = "success" | "error" | "info";

type ShowAppMessagePayload = {
  title?: string;
  message: string;
  type?: AppMessageType;
  durationMs?: number;
};

type AppMessageHandler = (payload: Required<ShowAppMessagePayload>) => void;

let currentHandler: AppMessageHandler | null = null;

export const registerAppMessageHandler = (handler: AppMessageHandler | null) => {
  currentHandler = handler;
};

export const showAppMessage = ({
  title,
  message,
  type = "info",
  durationMs = 3000,
}: ShowAppMessagePayload) => {
  if (currentHandler) {
    currentHandler({
      title: title || defaultTitleForType(type),
      message,
      type,
      durationMs,
    });
    return;
  }

  Alert.alert(title || defaultTitleForType(type), message);
};

export const showSuccessMessage = (message: string, title = "Success") => {
  showAppMessage({ title, message, type: "success" });
};

export const showErrorMessage = (message: string, title = "Error") => {
  showAppMessage({ title, message, type: "error" });
};

export const showInfoMessage = (message: string, title = "Info") => {
  showAppMessage({ title, message, type: "info" });
};

export const showDialog = (title: string, message: string, buttons?: AlertButton[]) => {
  Alert.alert(title, message, buttons);
};

const defaultTitleForType = (type: AppMessageType) => {
  switch (type) {
    case "success":
      return "Success";
    case "error":
      return "Error";
    default:
      return "Info";
  }
};
