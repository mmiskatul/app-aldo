import React from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { isCacheFresh } from '../utils/cache';

interface UseCachedFocusRefreshOptions {
  enabled?: boolean;
  hasCache: boolean;
  fetchedAt: number | null;
  ttlMs: number;
  loadOnEmpty: () => void;
  refreshStale: () => void;
  refreshOnFocus?: 'stale' | 'always';
}

export const useCachedFocusRefresh = ({
  enabled = true,
  hasCache,
  fetchedAt,
  ttlMs,
  loadOnEmpty,
  refreshStale,
  refreshOnFocus = 'stale',
}: UseCachedFocusRefreshOptions) => {
  const loadOnEmptyRef = React.useRef(loadOnEmpty);
  const refreshStaleRef = React.useRef(refreshStale);
  const hasRunRef = React.useRef(false);

  React.useEffect(() => {
    loadOnEmptyRef.current = loadOnEmpty;
  }, [loadOnEmpty]);

  React.useEffect(() => {
    refreshStaleRef.current = refreshStale;
  }, [refreshStale]);

  // Maintain refs for options to read the latest values on focus transition
  const enabledRef = React.useRef(enabled);
  enabledRef.current = enabled;

  const hasCacheRef = React.useRef(hasCache);
  hasCacheRef.current = hasCache;

  const fetchedAtRef = React.useRef(fetchedAt);
  fetchedAtRef.current = fetchedAt;

  const ttlMsRef = React.useRef(ttlMs);
  ttlMsRef.current = ttlMs;

  const refreshOnFocusRef = React.useRef(refreshOnFocus);
  refreshOnFocusRef.current = refreshOnFocus;

  useFocusEffect(
    React.useCallback(() => {
      if (!enabledRef.current) {
        return undefined;
      }

      if (hasRunRef.current) {
        return undefined;
      }

      hasRunRef.current = true;

      if (!hasCacheRef.current) {
        loadOnEmptyRef.current();
      } else {
        const shouldRefresh =
          refreshOnFocusRef.current === 'always' ||
          !isCacheFresh(fetchedAtRef.current, ttlMsRef.current);
        if (shouldRefresh) {
          refreshStaleRef.current();
        }
      }

      return () => {
        hasRunRef.current = false;
      };
    }, [])
  );
};

