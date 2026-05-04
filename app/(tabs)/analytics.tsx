import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { useCachedFocusRefresh } from '../../hooks/useCachedFocusRefresh';
import Header from '../../components/ui/Header';
import AnalyticsAIInsightCard from '../../components/analytics/AnalyticsAIInsightCard';
import SummaryCards from '../../components/analytics/SummaryCards';
import RevenueTrendChart from '../../components/analytics/RevenueTrendChart';
import StatsSelector from '../../components/analytics/StatsSelector';
import RevenueComparisonChart from '../../components/analytics/RevenueComparisonChart';
import ActivityCostSection from '../../components/analytics/ActivityCostSection';
import SupplierPriceAlerts from '../../components/analytics/SupplierPriceAlerts';
import ActionFilterBar from '../../components/home/ActionFilterBar';
import Skeleton, { SkeletonCard } from '../../components/ui/Skeleton';
import apiClient from '../../api/apiClient';
import { useAppStore } from '../../store/useAppStore';
import { getApiDisplayMessage, logApiError } from '../../utils/apiErrors';
import { showErrorMessage } from '../../utils/feedback';
import { useTranslation } from '../../utils/i18n';
import { resolveLocalizedText } from '../../utils/localizedContent';
import { generateAnalyticsPdfExport, generateAnalyticsExcelExport } from '../../utils/exportData';

type PeriodKey = 'weekly' | 'monthly';

type InsightBanner = {
  title: string;
  subtitle: string;
  title_translations?: {
    en?: string | null;
    it?: string | null;
  } | null;
  subtitle_translations?: {
    en?: string | null;
    it?: string | null;
  } | null;
};

type MetricTile = {
  label: string;
  value: number | string;
  change_percent?: number;
  subtitle?: string;
};

type RevenuePoint = {
  label: string;
  value: number;
};

type SummaryStat = {
  label: string;
  value: number | string;
};

type RevenueComparison = {
  label: string;
  value: number;
};

type SupplierAlert = {
  title: string;
  subtitle?: string;
  impact?: string;
  title_translations?: {
    en?: string | null;
    it?: string | null;
  } | null;
  subtitle_translations?: {
    en?: string | null;
    it?: string | null;
  } | null;
};

interface AnalyticsRevenueTrendResponse {
  period: PeriodKey;
  revenue_total: number;
  change_percent: number;
  points: RevenuePoint[];
}

interface AnalyticsOverviewResponse {
  insight_banner?: InsightBanner | null;
  revenue_total: number;
  revenue_change_percent: number;
  weekly_revenue: RevenuePoint[];
  metric_tiles: MetricTile[];
  summary_stats: SummaryStat[];
  revenue_comparison: RevenueComparison[];
  covers_activity: SummaryStat[];
  cost_breakdown: SummaryStat[];
  supplier_price_alerts: SupplierAlert[];
}

const ANALYTICS_CACHE_TTL_MS = 60 * 1000;

const hasPeriodAnalyticsData = (
  period: PeriodKey,
    data: {
    metricTilesByPeriod: Partial<Record<PeriodKey, MetricTile[]>>;
    revenueTrendByPeriod: Partial<Record<PeriodKey, AnalyticsRevenueTrendResponse>>;
    summaryStatsByPeriod: Partial<Record<PeriodKey, SummaryStat[]>>;
    revenueComparisonByPeriod: Partial<Record<PeriodKey, RevenueComparison[]>>;
    coversActivityByPeriod: Partial<Record<PeriodKey, SummaryStat[]>>;
    costBreakdownByPeriod: Partial<Record<PeriodKey, SummaryStat[]>>;
    supplierAlertsByPeriod: Partial<Record<PeriodKey, SupplierAlert[]>>;
  },
) =>
  Boolean(
    data.metricTilesByPeriod[period] &&
      data.revenueTrendByPeriod[period] &&
      data.summaryStatsByPeriod[period] &&
      data.revenueComparisonByPeriod[period] &&
      data.coversActivityByPeriod[period] &&
      data.costBreakdownByPeriod[period] &&
      data.supplierAlertsByPeriod[period],
  );

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const appLanguage = useAppStore((state) => state.appLanguage);
  const analyticsScreenCache = useAppStore((state) => state.analyticsScreenCache);
  const setAnalyticsScreenCache = useAppStore((state) => state.setAnalyticsScreenCache);

  const [activePeriod, setActivePeriod] = React.useState<PeriodKey>('weekly');
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(
    !hasPeriodAnalyticsData('weekly', analyticsScreenCache as any),
  );
  const [error, setError] = React.useState<string | null>(null);

  const [businessInsight, setBusinessInsight] = React.useState<InsightBanner | null>(analyticsScreenCache.businessInsight);
  const [metricTilesByPeriod, setMetricTilesByPeriod] = React.useState<Partial<Record<PeriodKey, MetricTile[]>>>(analyticsScreenCache.metricTilesByPeriod);
  const [revenueTrendByPeriod, setRevenueTrendByPeriod] = React.useState<Partial<Record<PeriodKey, AnalyticsRevenueTrendResponse>>>(analyticsScreenCache.revenueTrendByPeriod);
  const [summaryStatsByPeriod, setSummaryStatsByPeriod] = React.useState<Partial<Record<PeriodKey, SummaryStat[]>>>(analyticsScreenCache.summaryStatsByPeriod);
  const [revenueComparisonByPeriod, setRevenueComparisonByPeriod] = React.useState<Partial<Record<PeriodKey, RevenueComparison[]>>>(analyticsScreenCache.revenueComparisonByPeriod);
  const [coversActivityByPeriod, setCoversActivityByPeriod] = React.useState<Partial<Record<PeriodKey, SummaryStat[]>>>(analyticsScreenCache.coversActivityByPeriod);
  const [costBreakdownByPeriod, setCostBreakdownByPeriod] = React.useState<Partial<Record<PeriodKey, SummaryStat[]>>>(analyticsScreenCache.costBreakdownByPeriod);
  const [supplierAlertsByPeriod, setSupplierAlertsByPeriod] = React.useState<Partial<Record<PeriodKey, SupplierAlert[]>>>(analyticsScreenCache.supplierAlertsByPeriod);

  const currentSnapshot = React.useMemo(
    () => ({
      businessInsight,
      metricTilesByPeriod,
      revenueTrendByPeriod,
      summaryStatsByPeriod,
      revenueComparisonByPeriod,
      coversActivityByPeriod,
      costBreakdownByPeriod,
      supplierAlertsByPeriod,
    }),
    [
      businessInsight,
      costBreakdownByPeriod,
      coversActivityByPeriod,
      metricTilesByPeriod,
      revenueComparisonByPeriod,
      revenueTrendByPeriod,
      summaryStatsByPeriod,
      supplierAlertsByPeriod,
    ],
  );

  const hasCachedPeriodData = React.useMemo(
    () => hasPeriodAnalyticsData(activePeriod, currentSnapshot),
    [activePeriod, currentSnapshot],
  );

  const applyAnalyticsOverview = React.useCallback(
    (period: PeriodKey, data: AnalyticsOverviewResponse) => {
      const nextRevenueTrend = {
        period,
        revenue_total: data.revenue_total,
        change_percent: data.revenue_change_percent,
        points: data.weekly_revenue,
      };

      const nextMetricTilesByPeriod = { ...currentSnapshot.metricTilesByPeriod, [period]: data.metric_tiles };
      const nextRevenueTrendByPeriod = { ...currentSnapshot.revenueTrendByPeriod, [period]: nextRevenueTrend };
      const nextSummaryStatsByPeriod = { ...currentSnapshot.summaryStatsByPeriod, [period]: data.summary_stats };
      const nextRevenueComparisonByPeriod = {
        ...currentSnapshot.revenueComparisonByPeriod,
        [period]: data.revenue_comparison,
      };
      const nextCoversActivityByPeriod = { ...currentSnapshot.coversActivityByPeriod, [period]: data.covers_activity };
      const nextCostBreakdownByPeriod = { ...currentSnapshot.costBreakdownByPeriod, [period]: data.cost_breakdown };
      const nextSupplierAlertsByPeriod = {
        ...currentSnapshot.supplierAlertsByPeriod,
        [period]: data.supplier_price_alerts,
      };
      const fetchedAt = Date.now();

      if (data.insight_banner) {
        setBusinessInsight(data.insight_banner);
      }
      setMetricTilesByPeriod(nextMetricTilesByPeriod);
      setRevenueTrendByPeriod(nextRevenueTrendByPeriod);
      setSummaryStatsByPeriod(nextSummaryStatsByPeriod);
      setRevenueComparisonByPeriod(nextRevenueComparisonByPeriod);
      setCoversActivityByPeriod(nextCoversActivityByPeriod);
      setCostBreakdownByPeriod(nextCostBreakdownByPeriod);
      setSupplierAlertsByPeriod(nextSupplierAlertsByPeriod);

      setAnalyticsScreenCache({
        businessInsight: data.insight_banner ?? currentSnapshot.businessInsight,
        metricTilesByPeriod: nextMetricTilesByPeriod,
        revenueTrendByPeriod: nextRevenueTrendByPeriod,
        summaryStatsByPeriod: nextSummaryStatsByPeriod,
        revenueComparisonByPeriod: nextRevenueComparisonByPeriod,
        coversActivityByPeriod: nextCoversActivityByPeriod,
        costBreakdownByPeriod: nextCostBreakdownByPeriod,
        supplierAlertsByPeriod: nextSupplierAlertsByPeriod,
        fetchedAt,
      });
    },
    [currentSnapshot, setAnalyticsScreenCache],
  );

  const fetchBusinessInsight = React.useCallback(
    async (period: PeriodKey) => {
      try {
        const response = await apiClient.get<InsightBanner>('/api/v1/restaurant/analytics/business-insight', {
          params: { period },
        });
        setBusinessInsight(response.data);
        setAnalyticsScreenCache({
          businessInsight: response.data,
        });
      } catch (error) {
        logApiError('analytics.business-insight', error);
      }
    },
    [setAnalyticsScreenCache],
  );

  const fetchAnalyticsScreenData = React.useCallback(
    async (period: PeriodKey, silent = false) => {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      const overviewRequest = apiClient.get<AnalyticsOverviewResponse>('/api/v1/restaurant/analytics/overview', {
        params: { period, include_insight: false },
      });
      const insightRequest = apiClient.get<InsightBanner>('/api/v1/restaurant/analytics/business-insight', {
        params: { period },
      });

      const [overviewResult, insightResult] = await Promise.all([
        overviewRequest
          .then((response) => ({ status: 'fulfilled' as const, response }))
          .catch((error) => ({ status: 'rejected' as const, error })),
        insightRequest
          .then((response) => ({ status: 'fulfilled' as const, response }))
          .catch((error) => ({ status: 'rejected' as const, error })),
      ]);

      if (overviewResult.status === 'fulfilled') {
        applyAnalyticsOverview(period, overviewResult.response.data);
      } else {
        logApiError('analytics.overview', overviewResult.error);
        if (!silent || !hasCachedPeriodData) {
          setError(getApiDisplayMessage(overviewResult.error, 'Unable to load analytics.'));
        }
      }

      if (insightResult.status === 'fulfilled') {
        setBusinessInsight(insightResult.response.data);
        setAnalyticsScreenCache({
          businessInsight: insightResult.response.data,
        });
      } else {
        logApiError('analytics.business-insight', insightResult.error);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [applyAnalyticsOverview, hasCachedPeriodData, setAnalyticsScreenCache],
  );

  useCachedFocusRefresh({
    hasCache: hasCachedPeriodData,
    fetchedAt: analyticsScreenCache.fetchedAt,
    ttlMs: ANALYTICS_CACHE_TTL_MS,
    loadOnEmpty: () => {
      void fetchAnalyticsScreenData(activePeriod, false);
    },
    refreshStale: () => {
      void fetchAnalyticsScreenData(activePeriod, true);
    },
  });

  React.useEffect(() => {
    if (hasCachedPeriodData && !businessInsight) {
      void fetchBusinessInsight(activePeriod);
    }
  }, [activePeriod, businessInsight, fetchBusinessInsight, hasCachedPeriodData]);

  const localizeAnalyticsLabel = React.useCallback((label: string) => {
    const safeLabel = String(label || '');
    const normalizedLabel = safeLabel.trim().toLowerCase();

    switch (normalizedLabel) {
      case 'estimated profit':
        return t('estimated_profit');
      case 'peak hour':
        return t('peak_hour');
      case 'revenue':
        return t('revenue');
      case 'food cost':
        return t('food_cost');
      case 'profit':
        return t('profit');
      case 'this week revenue':
        return t('this_week_revenue');
      case 'last week revenue':
        return `${t('last_week')} ${t('revenue')}`;
      case 'this month revenue':
        return t('this_month_revenue');
      case 'last month revenue':
        return t('last_month_revenue');
      case 'lunch':
        return t('lunch');
      case 'dinner':
        return t('dinner');
      case 'mon':
        return t('mon');
      case 'tue':
        return t('tue');
      case 'wed':
        return t('wed');
      case 'thu':
        return t('thu');
      case 'fri':
        return t('fri');
      case 'sat':
        return t('sat');
      case 'sun':
        return t('sun');
      default:
        return safeLabel;
    }
  }, [t]);

  const localizedMetricTiles = React.useMemo(
    () =>
      (metricTilesByPeriod[activePeriod] ?? []).map((item) => ({
        ...item,
        label: localizeAnalyticsLabel(item.label),
        value:
          item.label.trim().toLowerCase() === 'peak hour'
            ? localizeAnalyticsLabel(String(item.value))
            : item.value,
      })),
    [activePeriod, localizeAnalyticsLabel, metricTilesByPeriod],
  );

  const localizedBusinessInsight = React.useMemo(() => {
    if (!businessInsight) {
      return null;
    }

    return {
      ...businessInsight,
      title: resolveLocalizedText(appLanguage, businessInsight.title_translations, businessInsight.title),
      subtitle: resolveLocalizedText(appLanguage, businessInsight.subtitle_translations, businessInsight.subtitle),
    };
  }, [appLanguage, businessInsight]);

  const localizedSupplierAlerts = React.useMemo(
    () =>
      (supplierAlertsByPeriod[activePeriod] ?? []).map((item) => ({
        ...item,
        title: resolveLocalizedText(appLanguage, item.title_translations, item.title),
        subtitle: resolveLocalizedText(appLanguage, item.subtitle_translations, item.subtitle),
      })),
    [activePeriod, appLanguage, supplierAlertsByPeriod],
  );

  const localizedRevenueTrendPoints = React.useMemo(
    () =>
      (revenueTrendByPeriod[activePeriod]?.points ?? []).map((item) => ({
        ...item,
        label: localizeAnalyticsLabel(item.label),
      })),
    [activePeriod, localizeAnalyticsLabel, revenueTrendByPeriod],
  );

  const localizedSummaryStats = React.useMemo(
    () =>
      (summaryStatsByPeriod[activePeriod] ?? []).map((item) => ({
        ...item,
        label: localizeAnalyticsLabel(item.label),
      })),
    [activePeriod, localizeAnalyticsLabel, summaryStatsByPeriod],
  );

  const localizedRevenueComparison = React.useMemo(
    () =>
      (revenueComparisonByPeriod[activePeriod] ?? []).map((item) => ({
        ...item,
        label: localizeAnalyticsLabel(item.label),
      })),
    [activePeriod, localizeAnalyticsLabel, revenueComparisonByPeriod],
  );

  const localizedCoversActivity = React.useMemo(
    () =>
      (coversActivityByPeriod[activePeriod] ?? []).map((item) => ({
        ...item,
        label: localizeAnalyticsLabel(item.label),
      })),
    [activePeriod, localizeAnalyticsLabel, coversActivityByPeriod],
  );

  const localizedCostBreakdown = React.useMemo(
    () =>
      (costBreakdownByPeriod[activePeriod] ?? []).map((item) => ({
        ...item,
        label: localizeAnalyticsLabel(item.label),
      })),
    [activePeriod, localizeAnalyticsLabel, costBreakdownByPeriod],
  );

  const handlePeriodChange = React.useCallback((period: string) => {
    setActivePeriod(period as PeriodKey);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    void fetchAnalyticsScreenData(activePeriod, false);
  }, [activePeriod, fetchAnalyticsScreenData]);

  const handleExport = React.useCallback(async (format: 'pdf' | 'excel') => {
    const hasExportableData =
      Boolean(localizedBusinessInsight) ||
      localizedMetricTiles.length > 0 ||
      localizedRevenueTrendPoints.length > 0 ||
      localizedSummaryStats.length > 0 ||
      localizedRevenueComparison.length > 0 ||
      localizedCoversActivity.length > 0 ||
      localizedCostBreakdown.length > 0 ||
      localizedSupplierAlerts.length > 0;

    if (!hasExportableData) {
      showErrorMessage('No analytics data is available to export.');
      return;
    }

    const analyticsData = {
      insight_banner: localizedBusinessInsight,
      revenue_total: revenueTrendByPeriod[activePeriod]?.revenue_total ?? 0,
      revenue_change_percent: revenueTrendByPeriod[activePeriod]?.change_percent ?? 0,
      weekly_revenue: localizedRevenueTrendPoints,
      metric_tiles: localizedMetricTiles,
      summary_stats: localizedSummaryStats,
      revenue_comparison: localizedRevenueComparison,
      covers_activity: localizedCoversActivity,
      cost_breakdown: localizedCostBreakdown,
      supplier_price_alerts: localizedSupplierAlerts,
    };

    if (format === 'pdf') {
      await generateAnalyticsPdfExport({ analyticsData: analyticsData as any, period: activePeriod });
      return;
    }

    await generateAnalyticsExcelExport({ analyticsData: analyticsData as any, period: activePeriod });
  }, [
    activePeriod,
    costBreakdownByPeriod,
    coversActivityByPeriod,
    localizedBusinessInsight,
    localizedSupplierAlerts,
    metricTilesByPeriod,
    revenueComparisonByPeriod,
    revenueTrendByPeriod,
    summaryStatsByPeriod,
  ]);

  return (
    <View style={styles.safeArea}>
      <Header title={t('analytics_title')} showBell={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FA8C4C']} />
        }
      >
        <ActionFilterBar
          activePeriod={activePeriod}
          availablePeriods={['weekly', 'monthly']}
          onPeriodChange={handlePeriodChange}
          onExport={handleExport}
          dropdownTop={verticalScale(132)}
        />

        {loading ? (
          <>
            <SkeletonCard style={styles.sectionCard}>
              <Skeleton width="42%" height={moderateScale(12)} borderRadius={6} />
              <Skeleton width="94%" height={moderateScale(14)} borderRadius={7} style={styles.gap8} />
              <Skeleton width="86%" height={moderateScale(14)} borderRadius={7} style={styles.gap8} />
              <Skeleton width="76%" height={moderateScale(14)} borderRadius={7} style={styles.gap8} />
            </SkeletonCard>

            <View style={styles.twoCardRow}>
              {[0, 1].map((index) => (
                <SkeletonCard key={index} style={styles.metricCardSkeleton}>
                  <Skeleton width="46%" height={moderateScale(10)} borderRadius={5} />
                  <Skeleton width="72%" height={moderateScale(20)} borderRadius={8} style={styles.gap8} />
                  <Skeleton width="34%" height={moderateScale(10)} borderRadius={5} />
                </SkeletonCard>
              ))}
            </View>

            <SkeletonCard style={styles.sectionCard}>
              <Skeleton width="34%" height={moderateScale(12)} borderRadius={6} />
              <Skeleton width="28%" height={moderateScale(22)} borderRadius={8} style={styles.gap8} />
              <Skeleton width="100%" height={verticalScale(150)} borderRadius={12} style={styles.gap12} />
            </SkeletonCard>
          </>
        ) : error && !hasCachedPeriodData ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void fetchAnalyticsScreenData(activePeriod, false)}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {localizedBusinessInsight ? <AnalyticsAIInsightCard insight={localizedBusinessInsight} /> : null}
            {metricTilesByPeriod[activePeriod] ? <SummaryCards metrics={localizedMetricTiles} /> : null}
            {revenueTrendByPeriod[activePeriod] ? (
              <RevenueTrendChart
                weeklyRevenue={localizedRevenueTrendPoints}
                totalRevenue={revenueTrendByPeriod[activePeriod]?.revenue_total ?? 0}
                changePercent={revenueTrendByPeriod[activePeriod]?.change_percent ?? 0}
              />
            ) : null}
            {summaryStatsByPeriod[activePeriod] ? <StatsSelector stats={localizedSummaryStats} /> : null}
            {revenueComparisonByPeriod[activePeriod] ? (
              <RevenueComparisonChart comparison={localizedRevenueComparison} />
            ) : null}
            {coversActivityByPeriod[activePeriod] || costBreakdownByPeriod[activePeriod] ? (
              <ActivityCostSection
                coversActivity={localizedCoversActivity}
                costBreakdown={localizedCostBreakdown}
                coversLoading={false}
                costLoading={false}
              />
            ) : null}
            {supplierAlertsByPeriod[activePeriod] ? (
              <SupplierPriceAlerts alerts={localizedSupplierAlerts} />
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(6),
    paddingBottom: verticalScale(96),
  },
  sectionCard: {
    marginBottom: verticalScale(24),
  },
  twoCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(24),
  },
  metricCardSkeleton: {
    flex: 1,
    marginHorizontal: scale(4),
  },
  errorCard: {
    marginBottom: verticalScale(24),
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    padding: scale(18),
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#991B1B',
  },
  errorSubtitle: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(13, 0.3),
    color: '#7F1D1D',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: verticalScale(16),
    borderRadius: scale(12),
    backgroundColor: '#FA8C4C',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: moderateScale(13, 0.3),
    fontWeight: '700',
  },
  gap8: {
    marginTop: verticalScale(8),
  },
  gap12: {
    marginTop: verticalScale(12),
  },
});
