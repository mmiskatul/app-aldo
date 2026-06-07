import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale } from 'react-native-size-matters';

import Header from '../components/ui/Header';
import StateCard from '../components/ui/StateCard';
import SupplierPriceAlerts, { type SupplierAlertItem } from '../components/analytics/SupplierPriceAlerts';
import apiClient from '../api/apiClient';
import { useAppStore } from '../store/useAppStore';
import { getApiDisplayMessage, logApiError } from '../utils/apiErrors';
import { useTranslation } from '../utils/i18n';
import { resolveLocalizedText } from '../utils/localizedContent';

type PeriodKey = 'weekly' | 'monthly';

type SupplierAlertResponse = {
  title?: string;
  subtitle?: string;
  impact?: string;
  ai_provider?: string | null;
  title_translations?: {
    en?: string | null;
    it?: string | null;
  } | null;
  subtitle_translations?: {
    en?: string | null;
    it?: string | null;
  } | null;
};

type SupplierAlertsEndpointResponse = {
  period: PeriodKey;
  items: SupplierAlertResponse[];
};

const getFirstParam = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

const normalizeSupplierAlerts = (value: unknown): SupplierAlertResponse[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    return {
      title: typeof record.title === 'string' ? record.title : '',
      subtitle: typeof record.subtitle === 'string' ? record.subtitle : '',
      impact: typeof record.impact === 'string' ? record.impact : '',
      ai_provider: typeof record.ai_provider === 'string' ? record.ai_provider : null,
      title_translations: (record.title_translations as SupplierAlertResponse['title_translations']) ?? null,
      subtitle_translations: (record.subtitle_translations as SupplierAlertResponse['subtitle_translations']) ?? null,
    };
  });
};

export default function AnalyticsAlertsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const appLanguage = useAppStore((state) => state.appLanguage);
  const analyticsScreenCache = useAppStore((state) => state.analyticsScreenCache);
  const setAnalyticsScreenCache = useAppStore((state) => state.setAnalyticsScreenCache);

  const activePeriod: PeriodKey = getFirstParam(params.period) === 'monthly' ? 'monthly' : 'weekly';
  const cachedAlerts = analyticsScreenCache.supplierAlertsByPeriod[activePeriod] ?? [];

  const [alerts, setAlerts] = React.useState<SupplierAlertResponse[]>(cachedAlerts);
  const [loading, setLoading] = React.useState(cachedAlerts.length === 0);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const localizedAlerts = React.useMemo<SupplierAlertItem[]>(
    () =>
      alerts.map((item) => ({
        ...item,
        title: resolveLocalizedText(appLanguage, item.title_translations, item.title || ''),
        subtitle: resolveLocalizedText(appLanguage, item.subtitle_translations, item.subtitle || item.impact || ''),
      })),
    [alerts, appLanguage],
  );

  const fetchAlerts = React.useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await apiClient.get<SupplierAlertsEndpointResponse>('/api/v1/restaurant/analytics/supplier-alerts', {
        params: { period: activePeriod },
      });
      const nextAlerts = normalizeSupplierAlerts(response.data.items);
      setAlerts(nextAlerts);
      setAnalyticsScreenCache({
        supplierAlertsByPeriod: {
          ...analyticsScreenCache.supplierAlertsByPeriod,
          [activePeriod]: nextAlerts as any,
        },
      });
    } catch (fetchError) {
      logApiError('analytics.supplier-alerts', fetchError);
      setError(getApiDisplayMessage(fetchError, 'Unable to load monitoring alerts.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activePeriod, analyticsScreenCache.supplierAlertsByPeriod, setAnalyticsScreenCache]);

  React.useEffect(() => {
    setAlerts(cachedAlerts);
    if (cachedAlerts.length === 0) {
      void fetchAlerts(false);
    }
  }, [activePeriod, cachedAlerts, fetchAlerts]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    void fetchAlerts(true);
  }, [fetchAlerts]);

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrap, { paddingTop: Math.max(insets.top + verticalScale(12), verticalScale(16)) }]}>
        <Header title={t('revenue_monitoring_alerts')} showBack={true} />
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#FA8C4C" />
        </View>
      ) : error && localizedAlerts.length === 0 ? (
        <View style={styles.content}>
          <StateCard
            title={t('something_went_wrong')}
            description={error}
            tone="error"
            actionLabel={t('try_again')}
            onAction={() => void fetchAlerts(false)}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + verticalScale(24), verticalScale(32)) },
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FA8C4C" />}
          showsVerticalScrollIndicator={false}
        >
          <SupplierPriceAlerts alerts={localizedAlerts} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerWrap: {
    paddingHorizontal: scale(16),
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(8),
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
