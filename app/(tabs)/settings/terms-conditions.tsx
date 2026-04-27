import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../../../components/ui/Header';
import { TextRouteSkeleton } from '../../../components/ui/RouteSkeletons';
import { PublicLegalDocument, getTermsOfService } from '../../../api/settings';
import { useAppStore } from '../../../store/useAppStore';

const formatDate = (value: string | null) => {
  if (!value) {
    return 'Not available';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function TermsConditionsScreen() {
  const insets = useSafeAreaInsets();
  const cachedDocument = useAppStore((state) => state.legalDocumentCache['terms-of-service']);
  const setLegalDocumentCacheItem = useAppStore((state) => state.setLegalDocumentCacheItem);
  const [document, setDocument] = useState<PublicLegalDocument | null>(cachedDocument ?? null);
  const [loading, setLoading] = useState(!cachedDocument);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await getTermsOfService();
      setDocument(data);
      setLegalDocumentCacheItem('terms-of-service', data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          'Failed to load terms and conditions.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setLegalDocumentCacheItem]);

  useEffect(() => {
    void fetchDocument(!!cachedDocument);
  }, [fetchDocument]);

  return (
    <View style={styles.safeArea}>
      <Header title="Terms of Service" showBack={true} />

      {loading ? (
        <TextRouteSkeleton />
      ) : error ? (
        <View style={styles.centerState}>
          <Feather name="alert-circle" size={moderateScale(42)} color="#EF4444" />
          <Text style={styles.stateTitle}>Unable to load terms</Text>
          <Text style={styles.stateDescription}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void fetchDocument()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
            {document?.title || 'Terms of Service'}
          </Text>
          <Text style={styles.lastUpdated}>
            Last updated: {formatDate(document?.updated_at ?? null)}
          </Text>
          {document?.updated_by ? (
            <Text style={styles.updatedBy}>Updated by: {document.updated_by}</Text>
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
      )}
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
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  stateTitle: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  stateDescription: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(14, 0.3),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: verticalScale(20),
    backgroundColor: '#FA8C4C',
    borderRadius: scale(12),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
  },
});
