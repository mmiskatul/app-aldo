const MIME_TYPE_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "application/x-pdf": "application/pdf",
};

const MIME_BY_EXTENSION: Record<string, string> = {
  avif: "image/avif",
  bmp: "image/bmp",
  csv: "text/csv",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  jfif: "image/jpeg",
  jpe: "image/jpeg",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
  svg: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  webp: "image/webp",
};

const EXTENSION_BY_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/tiff": "tiff",
  "image/webp": "webp",
  "text/csv": "csv",
};

export const getFileExtension = (value?: string | null): string => {
  const cleanValue = (value || "").split("?")[0].split("#")[0];
  const match = cleanValue.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() || "";
};

export const normalizeMimeType = (mimeType?: string | null): string => {
  const normalized = (mimeType || "").trim().toLowerCase();
  return MIME_TYPE_ALIASES[normalized] || normalized;
};

export const inferMimeType = (
  nameOrUri?: string | null,
  providedMimeType?: string | null,
): string => {
  const normalized = normalizeMimeType(providedMimeType);
  if (normalized && normalized !== "application/octet-stream") {
    return normalized;
  }

  const extension = getFileExtension(nameOrUri);
  return MIME_BY_EXTENSION[extension] || "application/octet-stream";
};

export const isImageFile = (
  nameOrUri?: string | null,
  mimeType?: string | null,
): boolean => inferMimeType(nameOrUri, mimeType).startsWith("image/");

export const buildFileName = (
  preferredName: string | null | undefined,
  uri: string,
  fallbackBaseName: string,
  mimeType: string,
): string => {
  const fromName = (preferredName || "").trim();
  if (getFileExtension(fromName)) {
    return fromName;
  }

  const uriName = decodeURIComponent(uri.split("?")[0].split("#")[0].split("/").pop() || "");
  if (getFileExtension(uriName)) {
    return uriName;
  }

  const extension = EXTENSION_BY_MIME[normalizeMimeType(mimeType)] || "jpg";
  return `${fallbackBaseName}.${extension}`;
};
