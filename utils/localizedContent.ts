export type LocalizedText = {
  en?: string | null;
  it?: string | null;
} | null | undefined;

export type LocalizedTextList = {
  en?: string[] | null;
  it?: string[] | null;
} | null | undefined;

export type LocalizedAction = {
  title: string;
  description: string;
};

export type LocalizedActionList = {
  en?: LocalizedAction[] | null;
  it?: LocalizedAction[] | null;
} | null | undefined;

export const resolveLocalizedText = (
  language: "en" | "it",
  translations: LocalizedText,
  fallback?: string | null,
) => {
  const preferred = translations?.[language];
  if (preferred) {
    return preferred;
  }

  const alternate = translations?.[language === "it" ? "en" : "it"];
  if (alternate) {
    return alternate;
  }

  return fallback || "";
};

export const resolveLocalizedList = (
  language: "en" | "it",
  translations: LocalizedTextList,
  fallback?: string[] | null,
) => {
  const preferred = translations?.[language];
  if (preferred?.length) {
    return preferred;
  }

  const alternate = translations?.[language === "it" ? "en" : "it"];
  if (alternate?.length) {
    return alternate;
  }

  return fallback || [];
};

export const resolveLocalizedActions = (
  language: "en" | "it",
  translations: LocalizedActionList,
  fallback?: LocalizedAction[] | null,
) => {
  const preferred = translations?.[language];
  if (preferred?.length) {
    return preferred;
  }

  const alternate = translations?.[language === "it" ? "en" : "it"];
  if (alternate?.length) {
    return alternate;
  }

  return fallback || [];
};
