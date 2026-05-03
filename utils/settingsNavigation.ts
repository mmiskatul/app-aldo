import { Href } from 'expo-router';

export const normalizeOrigin = (value: string | string[] | undefined | null): string | undefined => {
  const resolved = Array.isArray(value) ? value[0] : value;
  if (!resolved || typeof resolved !== 'string') {
    return undefined;
  }
  return resolved.startsWith('/') ? resolved : undefined;
};

export const buildSettingsHref = (
  pathname: string,
  origin?: string | string[] | null,
  extraParams?: Record<string, string | number | undefined | null>,
): Href<string> => {
  const normalizedOrigin = normalizeOrigin(origin);
  const params: Record<string, string> = {};

  if (normalizedOrigin) {
    params.origin = normalizedOrigin;
  }

  for (const [key, value] of Object.entries(extraParams || {})) {
    if (value !== undefined && value !== null) {
      params[key] = String(value);
    }
  }

  if (Object.keys(params).length === 0) {
    return pathname as Href<string>;
  }

  return {
    pathname: pathname as Href<string>,
    params,
  } as unknown as Href<string>;
};
