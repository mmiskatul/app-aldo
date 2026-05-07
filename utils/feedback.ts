import { Alert, AlertButton } from "react-native";

export type AppMessageType = "success" | "error" | "info";
export type AppMessagePresentation = "snackbar" | "modal";

type ShowAppMessagePayload = {
  title?: string;
  message: string;
  type?: AppMessageType;
  durationMs?: number;
  presentation?: AppMessagePresentation;
};

type NormalizedAppMessagePayload = Required<Omit<ShowAppMessagePayload, "presentation">> & {
  presentation: AppMessagePresentation;
};

type AppMessageHandler = (payload: NormalizedAppMessagePayload) => void;

let currentHandler: AppMessageHandler | null = null;

export const registerAppMessageHandler = (handler: AppMessageHandler | null) => {
  currentHandler = handler;
};

export const showAppMessage = ({
  title,
  message,
  type = "info",
  durationMs = 3000,
  presentation = "snackbar",
}: ShowAppMessagePayload) => {
  if (currentHandler) {
    currentHandler({
      title: title || defaultTitleForType(type),
      message,
      type,
      durationMs,
      presentation,
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

export const showModalErrorMessage = (message: string, title = "Error") => {
  showAppMessage({ title, message, type: "error", presentation: "modal", durationMs: 0 });
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
