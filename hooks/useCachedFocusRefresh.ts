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
}

export const useCachedFocusRefresh = ({
  enabled = true,
  hasCache,
  fetchedAt,
  ttlMs,
  loadOnEmpty,
  refreshStale,
}: UseCachedFocusRefreshOptions) => {
  const loadOnEmptyRef = React.useRef(loadOnEmpty);
  const refreshStaleRef = React.useRef(refreshStale);
  const lastActionKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    loadOnEmptyRef.current = loadOnEmpty;
  }, [loadOnEmpty]);

  React.useEffect(() => {
    refreshStaleRef.current = refreshStale;
  }, [refreshStale]);

  React.useEffect(() => {
    if (!enabled) {
      lastActionKeyRef.current = null;
      return;
    }

    if (!hasCache) {
      lastActionKeyRef.current = null;
      return;
    }

    lastActionKeyRef.current = null;
  }, [enabled, fetchedAt, hasCache]);

  useFocusEffect(
    React.useCallback(() => {
      if (!enabled) {
        return undefined;
      }

      if (!hasCache) {
        const actionKey = `empty:${String(fetchedAt)}`;
        if (lastActionKeyRef.current !== actionKey) {
          lastActionKeyRef.current = actionKey;
          loadOnEmptyRef.current();
        }
        return undefined;
      }

      if (!isCacheFresh(fetchedAt, ttlMs)) {
        const actionKey = `stale:${String(fetchedAt)}`;
        if (lastActionKeyRef.current !== actionKey) {
          lastActionKeyRef.current = actionKey;
          refreshStaleRef.current();
        }
      }

      return undefined;
    }, [enabled, fetchedAt, hasCache, ttlMs]),
  );
};
