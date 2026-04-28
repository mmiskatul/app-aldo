import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

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
import { useTranslation } from '../../utils/i18n';
import { generateAnalyticsPdfExport, generateAnalyticsExcelExport } from '../../utils/exportData';

type PeriodKey = 'weekly' | 'monthly';

type InsightBanner = {
  title: string;
  subtitle: string;
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
};

interface AnalyticsMetricTilesResponse {
  period: PeriodKey;
  items: MetricTile[];
}

interface AnalyticsRevenueTrendResponse {
  period: PeriodKey;
  revenue_total: number;
  change_percent: number;
  points: RevenuePoint[];
}

interface AnalyticsSummaryStatsResponse {
  period: PeriodKey;
  items: SummaryStat[];
}

interface AnalyticsRevenueComparisonResponse {
  period: PeriodKey;
  items: RevenueComparison[];
}

interface AnalyticsCoversActivityResponse {
  period: PeriodKey;
  items: SummaryStat[];
}

interface AnalyticsCostBreakdownResponse {
  period: PeriodKey;
  items: SummaryStat[];
}

interface AnalyticsSupplierAlertsResponse {
  period: PeriodKey;
  items: SupplierAlert[];
}

interface AnalyticsOverviewResponse {
  insight_banner: InsightBanner;
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

const SECTION_LOAD_DELAY_MS = 180;

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const analyticsScreenCache = useAppStore((state) => state.analyticsScreenCache);
  const setAnalyticsScreenCache = useAppStore((state) => state.setAnalyticsScreenCache);

  const [activePeriod, setActivePeriod] = React.useState<PeriodKey>('weekly');
  const [refreshing, setRefreshing] = React.useState(false);

  const [businessInsight, setBusinessInsight] = React.useState<InsightBanner | null>(analyticsScreenCache.businessInsight);
  const [metricTilesByPeriod, setMetricTilesByPeriod] = React.useState<Partial<Record<PeriodKey, MetricTile[]>>>(analyticsScreenCache.metricTilesByPeriod);
  const [revenueTrendByPeriod, setRevenueTrendByPeriod] = React.useState<Partial<Record<PeriodKey, AnalyticsRevenueTrendResponse>>>(analyticsScreenCache.revenueTrendByPeriod);
  const [summaryStatsByPeriod, setSummaryStatsByPeriod] = React.useState<Partial<Record<PeriodKey, SummaryStat[]>>>(analyticsScreenCache.summaryStatsByPeriod);
  const [revenueComparisonByPeriod, setRevenueComparisonByPeriod] = React.useState<Partial<Record<PeriodKey, RevenueComparison[]>>>(analyticsScreenCache.revenueComparisonByPeriod);
  const [coversActivityByPeriod, setCoversActivityByPeriod] = React.useState<Partial<Record<PeriodKey, SummaryStat[]>>>(analyticsScreenCache.coversActivityByPeriod);
  const [costBreakdownByPeriod, setCostBreakdownByPeriod] = React.useState<Partial<Record<PeriodKey, SummaryStat[]>>>(analyticsScreenCache.costBreakdownByPeriod);
  const [supplierAlertsByPeriod, setSupplierAlertsByPeriod] = React.useState<Partial<Record<PeriodKey, SupplierAlert[]>>>(analyticsScreenCache.supplierAlertsByPeriod);

  const [insightLoading, setInsightLoading] = React.useState(false);
  const [metricTilesLoading, setMetricTilesLoading] = React.useState(false);
  const [revenueTrendLoading, setRevenueTrendLoading] = React.useState(false);
  const [summaryStatsLoading, setSummaryStatsLoading] = React.useState(false);
  const [revenueComparisonLoading, setRevenueComparisonLoading] = React.useState(false);
  const [coversActivityLoading, setCoversActivityLoading] = React.useState(false);
  const [costBreakdownLoading, setCostBreakdownLoading] = React.useState(false);
  const [supplierAlertsLoading, setSupplierAlertsLoading] = React.useState(false);

  const fetchBusinessInsight = React.useCallback(async () => {
    setInsightLoading(true);
    try {
      const response = await apiClient.get<InsightBanner>('/api/v1/restaurant/analytics/business-insight');
      setBusinessInsight(response.data);
      setAnalyticsScreenCache({ businessInsight: response.data });
    } catch (error) {
      console.error('Error fetching business insight:', error);
    } finally {
      setInsightLoading(false);
    }
  }, [setAnalyticsScreenCache]);

  const fetchMetricTiles = React.useCallback(async (period: PeriodKey) => {
    setMetricTilesLoading(true);
    try {
      const response = await apiClient.get<AnalyticsMetricTilesResponse>('/api/v1/restaurant/analytics/metric-tiles', {
        params: { period },
      });
      let nextMetricTilesByPeriod: Partial<Record<PeriodKey, MetricTile[]>> | null = null;
      setMetricTilesByPeriod((current) => {
        nextMetricTilesByPeriod = { ...current, [period]: response.data.items };
        return nextMetricTilesByPeriod;
      });
      if (nextMetricTilesByPeriod) {
        setAnalyticsScreenCache({ metricTilesByPeriod: nextMetricTilesByPeriod });
      }
    } catch (error) {
      console.error('Error fetching analytics metric tiles:', error);
    } finally {
      setMetricTilesLoading(false);
    }
  }, [setAnalyticsScreenCache]);

  const fetchRevenueTrend = React.useCallback(async (period: PeriodKey) => {
    setRevenueTrendLoading(true);
    try {
      const response = await apiClient.get<AnalyticsRevenueTrendResponse>('/api/v1/restaurant/analytics/revenue-trend', {
        params: { period },
      });
      let nextRevenueTrendByPeriod: Partial<Record<PeriodKey, AnalyticsRevenueTrendResponse>> | null = null;
      setRevenueTrendByPeriod((current) => {
        nextRevenueTrendByPeriod = { ...current, [period]: response.data };
        return nextRevenueTrendByPeriod;
      });
      if (nextRevenueTrendByPeriod) {
        setAnalyticsScreenCache({ revenueTrendByPeriod: nextRevenueTrendByPeriod });
      }
    } catch (error) {
      console.error('Error fetching analytics revenue trend:', error);
    } finally {
      setRevenueTrendLoading(false);
    }
  }, [setAnalyticsScreenCache]);

  const fetchSummaryStats = React.useCallback(async (period: PeriodKey) => {
    setSummaryStatsLoading(true);
    try {
      const response = await apiClient.get<AnalyticsSummaryStatsResponse>('/api/v1/restaurant/analytics/summary-stats', {
        params: { period },
      });
      let nextSummaryStatsByPeriod: Partial<Record<PeriodKey, SummaryStat[]>> | null = null;
      setSummaryStatsByPeriod((current) => {
        nextSummaryStatsByPeriod = { ...current, [period]: response.data.items };
        return nextSummaryStatsByPeriod;
      });
      if (nextSummaryStatsByPeriod) {
        setAnalyticsScreenCache({ summaryStatsByPeriod: nextSummaryStatsByPeriod });
      }
    } catch (error) {
      console.error('Error fetching analytics summary stats:', error);
    } finally {
      setSummaryStatsLoading(false);
    }
  }, [setAnalyticsScreenCache]);

  const fetchRevenueComparison = React.useCallback(async (period: PeriodKey) => {
    setRevenueComparisonLoading(true);
    try {
      const response = await apiClient.get<AnalyticsRevenueComparisonResponse>('/api/v1/restaurant/analytics/revenue-comparison', {
        params: { period },
      });
      let nextRevenueComparisonByPeriod: Partial<Record<PeriodKey, RevenueComparison[]>> | null = null;
      setRevenueComparisonByPeriod((current) => {
        nextRevenueComparisonByPeriod = { ...current, [period]: response.data.items };
        return nextRevenueComparisonByPeriod;
      });
      if (nextRevenueComparisonByPeriod) {
        setAnalyticsScreenCache({ revenueComparisonByPeriod: nextRevenueComparisonByPeriod });
      }
    } catch (error) {
      console.error('Error fetching analytics revenue comparison:', error);
    } finally {
      setRevenueComparisonLoading(false);
    }
  }, [setAnalyticsScreenCache]);

  const fetchCoversActivity = React.useCallback(async (period: PeriodKey) => {
    setCoversActivityLoading(true);
    try {
      const response = await apiClient.get<AnalyticsCoversActivityResponse>('/api/v1/restaurant/analytics/covers-activity', {
        params: { period },
      });
      let nextCoversActivityByPeriod: Partial<Record<PeriodKey, SummaryStat[]>> | null = null;
      setCoversActivityByPeriod((current) => {
        nextCoversActivityByPeriod = { ...current, [period]: response.data.items };
        return nextCoversActivityByPeriod;
      });
      if (nextCoversActivityByPeriod) {
        setAnalyticsScreenCache({ coversActivityByPeriod: nextCoversActivityByPeriod });
      }
    } catch (error) {
      console.error('Error fetching analytics covers activity:', error);
    } finally {
      setCoversActivityLoading(false);
    }
  }, [setAnalyticsScreenCache]);

  const fetchCostBreakdown = React.useCallback(async (period: PeriodKey) => {
    setCostBreakdownLoading(true);
    try {
      const response = await apiClient.get<AnalyticsCostBreakdownResponse>('/api/v1/restaurant/analytics/cost-breakdown', {
        params: { period },
      });
      let nextCostBreakdownByPeriod: Partial<Record<PeriodKey, SummaryStat[]>> | null = null;
      setCostBreakdownByPeriod((current) => {
        nextCostBreakdownByPeriod = { ...current, [period]: response.data.items };
        return nextCostBreakdownByPeriod;
      });
      if (nextCostBreakdownByPeriod) {
        setAnalyticsScreenCache({ costBreakdownByPeriod: nextCostBreakdownByPeriod });
      }
    } catch (error) {
      console.error('Error fetching analytics cost breakdown:', error);
    } finally {
      setCostBreakdownLoading(false);
    }
  }, [setAnalyticsScreenCache]);

  const fetchSupplierAlerts = React.useCallback(async (period: PeriodKey) => {
    setSupplierAlertsLoading(true);
    try {
      const response = await apiClient.get<AnalyticsSupplierAlertsResponse>('/api/v1/restaurant/analytics/supplier-alerts', {
        params: { period },
      });
      let nextSupplierAlertsByPeriod: Partial<Record<PeriodKey, SupplierAlert[]>> | null = null;
      setSupplierAlertsByPeriod((current) => {
        nextSupplierAlertsByPeriod = { ...current, [period]: response.data.items };
        return nextSupplierAlertsByPeriod;
      });
      if (nextSupplierAlertsByPeriod) {
        setAnalyticsScreenCache({ supplierAlertsByPeriod: nextSupplierAlertsByPeriod });
      }
    } catch (error) {
      console.error('Error fetching analytics supplier alerts:', error);
    } finally {
      setSupplierAlertsLoading(false);
    }
  }, [setAnalyticsScreenCache]);

  const applyAnalyticsOverview = React.useCallback((period: PeriodKey, data: AnalyticsOverviewResponse) => {
    const nextRevenueTrend = {
      period,
      revenue_total: data.revenue_total,
      change_percent: data.revenue_change_percent,
      points: data.weekly_revenue,
    };

    setBusinessInsight(data.insight_banner);
    setMetricTilesByPeriod((current) => ({ ...current, [period]: data.metric_tiles }));
    setRevenueTrendByPeriod((current) => ({ ...current, [period]: nextRevenueTrend }));
    setSummaryStatsByPeriod((current) => ({ ...current, [period]: data.summary_stats }));
    setRevenueComparisonByPeriod((current) => ({ ...current, [period]: data.revenue_comparison }));
    setCoversActivityByPeriod((current) => ({ ...current, [period]: data.covers_activity }));
    setCostBreakdownByPeriod((current) => ({ ...current, [period]: data.cost_breakdown }));
    setSupplierAlertsByPeriod((current) => ({ ...current, [period]: data.supplier_price_alerts }));
    setAnalyticsScreenCache({
      businessInsight: data.insight_banner,
      metricTilesByPeriod: { ...metricTilesByPeriod, [period]: data.metric_tiles },
      revenueTrendByPeriod: { ...revenueTrendByPeriod, [period]: nextRevenueTrend },
      summaryStatsByPeriod: { ...summaryStatsByPeriod, [period]: data.summary_stats },
      revenueComparisonByPeriod: { ...revenueComparisonByPeriod, [period]: data.revenue_comparison },
      coversActivityByPeriod: { ...coversActivityByPeriod, [period]: data.covers_activity },
      costBreakdownByPeriod: { ...costBreakdownByPeriod, [period]: data.cost_breakdown },
      supplierAlertsByPeriod: { ...supplierAlertsByPeriod, [period]: data.supplier_price_alerts },
    });
  }, [
    costBreakdownByPeriod,
    coversActivityByPeriod,
    metricTilesByPeriod,
    revenueComparisonByPeriod,
    revenueTrendByPeriod,
    setAnalyticsScreenCache,
    summaryStatsByPeriod,
    supplierAlertsByPeriod,
  ]);

  const fetchAnalyticsOverview = React.useCallback(async (period: PeriodKey) => {
    setMetricTilesLoading(true);
    setRevenueTrendLoading(true);
    setSummaryStatsLoading(true);
    setRevenueComparisonLoading(true);
    setCoversActivityLoading(true);
    setCostBreakdownLoading(true);
    setSupplierAlertsLoading(true);

    try {
      const response = await apiClient.get<AnalyticsOverviewResponse>('/api/v1/restaurant/analytics/overview', {
        params: { period },
      });
      applyAnalyticsOverview(period, response.data);
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
    } finally {
      setMetricTilesLoading(false);
      setRevenueTrendLoading(false);
      setSummaryStatsLoading(false);
      setRevenueComparisonLoading(false);
      setCoversActivityLoading(false);
      setCostBreakdownLoading(false);
      setSupplierAlertsLoading(false);
    }
  }, [applyAnalyticsOverview]);

  const waitForDelay = React.useCallback((delayMs: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }, []);

  const fetchNonAiSectionsStaggered = React.useCallback(async (period: PeriodKey, force = false) => {
    const sectionTasks: Promise<void>[] = [];

    const scheduleSection = (
      shouldFetch: boolean,
      order: number,
      fetcher: () => Promise<void>,
    ) => {
      if (!shouldFetch) {
        return;
      }
      sectionTasks.push((async () => {
        await waitForDelay(order * SECTION_LOAD_DELAY_MS);
        await fetcher();
      })());
    };

    scheduleSection(force || !metricTilesByPeriod[period], 0, () => fetchMetricTiles(period));
    scheduleSection(force || !revenueTrendByPeriod[period], 0, () => fetchRevenueTrend(period));
    scheduleSection(force || !summaryStatsByPeriod[period], 0, () => fetchSummaryStats(period));
    scheduleSection(force || !revenueComparisonByPeriod[period], 1, () => fetchRevenueComparison(period));
    scheduleSection(force || !coversActivityByPeriod[period], 1, () => fetchCoversActivity(period));
    scheduleSection(force || !costBreakdownByPeriod[period], 1, () => fetchCostBreakdown(period));
    scheduleSection(force || !supplierAlertsByPeriod[period], 2, () => fetchSupplierAlerts(period));

    await Promise.all(sectionTasks);
  }, [
    costBreakdownByPeriod,
    coversActivityByPeriod,
    fetchCostBreakdown,
    fetchCoversActivity,
    fetchMetricTiles,
    fetchRevenueComparison,
    fetchRevenueTrend,
    fetchSummaryStats,
    fetchSupplierAlerts,
    metricTilesByPeriod,
    revenueComparisonByPeriod,
    revenueTrendByPeriod,
    summaryStatsByPeriod,
    supplierAlertsByPeriod,
    waitForDelay,
  ]);

  const fetchAnalyticsData = React.useCallback(async (period: PeriodKey, force = false) => {
    try {
      if (force) {
        await fetchAnalyticsOverview(period);
        return;
      }
      if (businessInsight === null) {
        void fetchBusinessInsight();
      }
      await fetchNonAiSectionsStaggered(period, false);
    } finally {
      setRefreshing(false);
    }
  }, [businessInsight, fetchAnalyticsOverview, fetchBusinessInsight, fetchNonAiSectionsStaggered]);

  React.useEffect(() => {
    const hasCachedPeriodData =
      !!metricTilesByPeriod[activePeriod] &&
      !!revenueTrendByPeriod[activePeriod] &&
      !!summaryStatsByPeriod[activePeriod] &&
      !!revenueComparisonByPeriod[activePeriod] &&
      !!coversActivityByPeriod[activePeriod] &&
      !!costBreakdownByPeriod[activePeriod] &&
      !!supplierAlertsByPeriod[activePeriod];
    void fetchAnalyticsData(activePeriod, !hasCachedPeriodData);
  }, [
    activePeriod,
    costBreakdownByPeriod,
    coversActivityByPeriod,
    fetchAnalyticsData,
    metricTilesByPeriod,
    revenueComparisonByPeriod,
    revenueTrendByPeriod,
    supplierAlertsByPeriod,
    summaryStatsByPeriod,
  ]);

  const handlePeriodChange = (period: string) => {
    setActivePeriod(period as PeriodKey);
  };

  const onRefresh = () => {
    setRefreshing(true);
    void fetchAnalyticsData(activePeriod, true);
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    const analyticsData = {
      insight_banner: businessInsight,
      revenue_total: revenueTrendByPeriod[activePeriod]?.revenue_total ?? 0,
      revenue_change_percent: revenueTrendByPeriod[activePeriod]?.change_percent ?? 0,
      weekly_revenue: revenueTrendByPeriod[activePeriod]?.points ?? [],
      metric_tiles: metricTilesByPeriod[activePeriod] ?? [],
      summary_stats: summaryStatsByPeriod[activePeriod] ?? [],
      revenue_comparison: revenueComparisonByPeriod[activePeriod] ?? [],
      covers_activity: coversActivityByPeriod[activePeriod] ?? [],
      cost_breakdown: costBreakdownByPeriod[activePeriod] ?? [],
      supplier_price_alerts: supplierAlertsByPeriod[activePeriod] ?? [],
    };

    if (format === 'pdf') {
      await generateAnalyticsPdfExport({ analyticsData: analyticsData as any, period: activePeriod });
    } else {
      await generateAnalyticsExcelExport({ analyticsData: analyticsData as any, period: activePeriod });
    }
  };

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
          dropdownTop={verticalScale(130)}
        />

        {insightLoading && !businessInsight ? (
          <SkeletonCard style={styles.sectionCard}>
            <Skeleton width="42%" height={moderateScale(12)} borderRadius={6} />
            <Skeleton width="94%" height={moderateScale(14)} borderRadius={7} style={styles.gap8} />
            <Skeleton width="86%" height={moderateScale(14)} borderRadius={7} style={styles.gap8} />
            <Skeleton width="76%" height={moderateScale(14)} borderRadius={7} style={styles.gap8} />
          </SkeletonCard>
        ) : businessInsight ? (
          <AnalyticsAIInsightCard insight={businessInsight} />
        ) : null}

        {metricTilesLoading && !metricTilesByPeriod[activePeriod] ? (
          <View style={styles.twoCardRow}>
            {[0, 1].map((index) => (
              <SkeletonCard key={index} style={styles.metricCardSkeleton}>
                <Skeleton width="46%" height={moderateScale(10)} borderRadius={5} />
                <Skeleton width="72%" height={moderateScale(20)} borderRadius={8} style={styles.gap8} />
                <Skeleton width="34%" height={moderateScale(10)} borderRadius={5} />
              </SkeletonCard>
            ))}
          </View>
        ) : metricTilesByPeriod[activePeriod] ? (
          <SummaryCards metrics={metricTilesByPeriod[activePeriod] ?? []} />
        ) : null}

        {revenueTrendLoading && !revenueTrendByPeriod[activePeriod] ? (
          <SkeletonCard style={styles.sectionCard}>
            <Skeleton width="34%" height={moderateScale(12)} borderRadius={6} />
            <Skeleton width="28%" height={moderateScale(22)} borderRadius={8} style={styles.gap8} />
            <Skeleton width="100%" height={verticalScale(150)} borderRadius={12} style={styles.gap12} />
          </SkeletonCard>
        ) : revenueTrendByPeriod[activePeriod] ? (
          <RevenueTrendChart
            weeklyRevenue={revenueTrendByPeriod[activePeriod]?.points ?? []}
            totalRevenue={revenueTrendByPeriod[activePeriod]?.revenue_total ?? 0}
            changePercent={revenueTrendByPeriod[activePeriod]?.change_percent ?? 0}
          />
        ) : null}

        {summaryStatsLoading && !summaryStatsByPeriod[activePeriod] ? (
          <View style={styles.threeCardRow}>
            {[0, 1, 2].map((index) => (
              <SkeletonCard key={index} style={styles.statCardSkeleton}>
                <Skeleton width="54%" height={moderateScale(9)} borderRadius={5} />
                <Skeleton width="72%" height={moderateScale(16)} borderRadius={7} style={styles.gap8} />
              </SkeletonCard>
            ))}
          </View>
        ) : summaryStatsByPeriod[activePeriod] ? (
          <StatsSelector stats={summaryStatsByPeriod[activePeriod] ?? []} />
        ) : null}

        {revenueComparisonLoading && !revenueComparisonByPeriod[activePeriod] ? (
          <SkeletonCard style={styles.sectionCard}>
            <Skeleton width="38%" height={moderateScale(12)} borderRadius={6} />
            {[0, 1].map((index) => (
              <View key={index} style={styles.gap12}>
                <Skeleton width="100%" height={moderateScale(12)} borderRadius={6} />
                <Skeleton width="100%" height={moderateScale(8)} borderRadius={4} style={styles.gap8} />
              </View>
            ))}
          </SkeletonCard>
        ) : revenueComparisonByPeriod[activePeriod] ? (
          <RevenueComparisonChart comparison={revenueComparisonByPeriod[activePeriod] ?? []} />
        ) : null}

        {coversActivityLoading || costBreakdownLoading || coversActivityByPeriod[activePeriod] || costBreakdownByPeriod[activePeriod] ? (
          <ActivityCostSection
            coversActivity={coversActivityByPeriod[activePeriod] ?? []}
            costBreakdown={costBreakdownByPeriod[activePeriod] ?? []}
            coversLoading={coversActivityLoading && !coversActivityByPeriod[activePeriod]}
            costLoading={costBreakdownLoading && !costBreakdownByPeriod[activePeriod]}
          />
        ) : null}

        {supplierAlertsLoading && !supplierAlertsByPeriod[activePeriod] ? (
          <SkeletonCard style={styles.sectionCard}>
            <Skeleton width="44%" height={moderateScale(12)} borderRadius={6} />
            <Skeleton width="100%" height={verticalScale(72)} borderRadius={12} style={styles.gap12} />
          </SkeletonCard>
        ) : supplierAlertsByPeriod[activePeriod] ? (
          <SupplierPriceAlerts alerts={supplierAlertsByPeriod[activePeriod] ?? []} />
        ) : null}
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
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(40),
  },
  sectionCard: {
    marginBottom: verticalScale(24),
  },
  twoCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(24),
  },
  threeCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(24),
  },
  metricCardSkeleton: {
    flex: 1,
    marginHorizontal: scale(4),
  },
  statCardSkeleton: {
    flex: 1,
    marginHorizontal: scale(4),
    paddingVertical: scale(12),
  },
  gap8: {
    marginTop: verticalScale(8),
  },
  gap12: {
    marginTop: verticalScale(12),
  },
});
