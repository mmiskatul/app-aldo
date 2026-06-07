import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PublicLegalDocument } from '../../api/settings';
import { useCachedFocusRefresh } from '../../hooks/useCachedFocusRefresh';
import { useAppStore } from '../../store/useAppStore';
import { formatReadableDate } from '../../utils/date';
import { useTranslation } from '../../utils/i18n';
import Header from '../ui/Header';
import RouteStateView from '../ui/RouteStateView';
import { TextRouteSkeleton } from '../ui/RouteSkeletons';

type LegalDocumentScreenProps = {
  cacheKey: string;
  datePrefix: string;
  defaultTitle: string;
  errorFallback: string;
  errorTitle: string;
  headerTitle: string;
  loadDocument: () => Promise<PublicLegalDocument>;
};

export default function LegalDocumentScreen({
  cacheKey,
  datePrefix,
  defaultTitle,
  errorFallback,
  errorTitle,
  headerTitle,
  loadDocument,
}: LegalDocumentScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const cachedDocument = useAppStore((state) => state.legalDocumentCache[cacheKey]);
  const setLegalDocumentCacheItem = useAppStore((state) => state.setLegalDocumentCacheItem);
  const errorFallbackRef = useRef(errorFallback);
  const [document, setDocument] = useState<PublicLegalDocument | null>(cachedDocument ?? null);
  const [loading, setLoading] = useState(!cachedDocument);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);

  useEffect(() => {
    errorFallbackRef.current = errorFallback;
  }, [errorFallback]);

  const fetchDocument = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await loadDocument();
      setDocument(data);
      setLegalDocumentCacheItem(cacheKey, data);
      setFetchedAt(Date.now());
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          errorFallbackRef.current
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cacheKey, loadDocument, setLegalDocumentCacheItem]);

  useCachedFocusRefresh({
    hasCache: Boolean(document),
    fetchedAt,
    ttlMs: 5 * 60 * 1000,
    loadOnEmpty: () => {
      void fetchDocument();
    },
    refreshStale: () => {
      void fetchDocument(true);
    },
    refreshOnFocus: 'always',
  });

  return (
    <View style={styles.safeArea}>
      <Header title={headerTitle} showBack={true} />

      <RouteStateView
        loading={loading}
        loadingFallback={<TextRouteSkeleton />}
        error={error}
        errorTitle={errorTitle}
        hasData={Boolean(document)}
        retryLabel={t('try_again')}
        onRetry={() => {
          void fetchDocument();
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: verticalScale(40) + insets.bottom },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void fetchDocument(true);
              }}
              colors={['#FA8C4C']}
            />
          }
        >
          <Text style={styles.documentTitle}>
            {document?.title || defaultTitle}
          </Text>
          <Text style={styles.lastUpdated}>
            {datePrefix}: {formatReadableDate(
              document?.updated_at,
              {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              },
              t('not_available'),
              'input',
            )}
          </Text>
          {document?.updated_by ? (
            <Text style={styles.updatedBy}>{t('legal_updated_by')}: {document.updated_by}</Text>
          ) : null}

          {(document?.content ?? '')
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph, index) => (
              <View key={`${index}-${paragraph.slice(0, 20)}`} style={styles.section}>
                <Text style={styles.paragraph}>{paragraph}</Text>
              </View>
            ))}
        </ScrollView>
      </RouteStateView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: scale(20),
  },
  documentTitle: {
    fontSize: moderateScale(24, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  lastUpdated: {
    fontSize: moderateScale(13, 0.3),
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: verticalScale(6),
  },
  updatedBy: {
    fontSize: moderateScale(13, 0.3),
    color: '#9CA3AF',
    marginBottom: verticalScale(24),
  },
  section: {
    marginBottom: verticalScale(20),
  },
  paragraph: {
    fontSize: moderateScale(14, 0.3),
    color: '#4B5563',
    lineHeight: 24,
  },
});
