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
  useFocusEffect(
    React.useCallback(() => {
      if (!enabled) {
        return undefined;
      }

      if (!hasCache) {
        loadOnEmpty();
        return undefined;
      }

      if (!isCacheFresh(fetchedAt, ttlMs)) {
        refreshStale();
      }

      return undefined;
    }, [enabled, fetchedAt, hasCache, loadOnEmpty, refreshStale, ttlMs]),
  );
};
