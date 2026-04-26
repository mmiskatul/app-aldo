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

const SECTION_LOAD_DELAY_MS = 180;

export default function AnalyticsScreen() {
  const { t } = useTranslation();

  const [activePeriod, setActivePeriod] = React.useState<PeriodKey>('weekly');
  const [refreshing, setRefreshing] = React.useState(false);

  const [businessInsight, setBusinessInsight] = React.useState<InsightBanner | null>(null);
  const [metricTilesByPeriod, setMetricTilesByPeriod] = React.useState<Partial<Record<PeriodKey, MetricTile[]>>>({});
  const [revenueTrendByPeriod, setRevenueTrendByPeriod] = React.useState<Partial<Record<PeriodKey, AnalyticsRevenueTrendResponse>>>({});
  const [summaryStatsByPeriod, setSummaryStatsByPeriod] = React.useState<Partial<Record<PeriodKey, SummaryStat[]>>>({});
  const [revenueComparisonByPeriod, setRevenueComparisonByPeriod] = React.useState<Partial<Record<PeriodKey, RevenueComparison[]>>>({});
  const [coversActivityByPeriod, setCoversActivityByPeriod] = React.useState<Partial<Record<PeriodKey, SummaryStat[]>>>({});
  const [costBreakdownByPeriod, setCostBreakdownByPeriod] = React.useState<Partial<Record<PeriodKey, SummaryStat[]>>>({});
  const [supplierAlertsByPeriod, setSupplierAlertsByPeriod] = React.useState<Partial<Record<PeriodKey, SupplierAlert[]>>>({});

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
    } catch (error) {
      console.error('Error fetching business insight:', error);
    } finally {
      setInsightLoading(false);
    }
  }, []);

  const fetchMetricTiles = React.useCallback(async (period: PeriodKey) => {
    setMetricTilesLoading(true);
    try {
      const response = await apiClient.get<AnalyticsMetricTilesResponse>('/api/v1/restaurant/analytics/metric-tiles', {
        params: { period },
      });
      setMetricTilesByPeriod((current) => ({ ...current, [period]: response.data.items }));
    } catch (error) {
      console.error('Error fetching analytics metric tiles:', error);
    } finally {
      setMetricTilesLoading(false);
    }
  }, []);

  const fetchRevenueTrend = React.useCallback(async (period: PeriodKey) => {
    setRevenueTrendLoading(true);
    try {
      const response = await apiClient.get<AnalyticsRevenueTrendResponse>('/api/v1/restaurant/analytics/revenue-trend', {
        params: { period },
      });
      setRevenueTrendByPeriod((current) => ({ ...current, [period]: response.data }));
    } catch (error) {
      console.error('Error fetching analytics revenue trend:', error);
    } finally {
      setRevenueTrendLoading(false);
    }
  }, []);

  const fetchSummaryStats = React.useCallback(async (period: PeriodKey) => {
    setSummaryStatsLoading(true);
    try {
      const response = await apiClient.get<AnalyticsSummaryStatsResponse>('/api/v1/restaurant/analytics/summary-stats', {
        params: { period },
      });
      setSummaryStatsByPeriod((current) => ({ ...current, [period]: response.data.items }));
    } catch (error) {
      console.error('Error fetching analytics summary stats:', error);
    } finally {
      setSummaryStatsLoading(false);
    }
  }, []);

  const fetchRevenueComparison = React.useCallback(async (period: PeriodKey) => {
    setRevenueComparisonLoading(true);
    try {
      const response = await apiClient.get<AnalyticsRevenueComparisonResponse>('/api/v1/restaurant/analytics/revenue-comparison', {
        params: { period },
      });
      setRevenueComparisonByPeriod((current) => ({ ...current, [period]: response.data.items }));
    } catch (error) {
      console.error('Error fetching analytics revenue comparison:', error);
    } finally {
      setRevenueComparisonLoading(false);
    }
  }, []);

  const fetchCoversActivity = React.useCallback(async (period: PeriodKey) => {
    setCoversActivityLoading(true);
    try {
      const response = await apiClient.get<AnalyticsCoversActivityResponse>('/api/v1/restaurant/analytics/covers-activity', {
        params: { period },
      });
      setCoversActivityByPeriod((current) => ({ ...current, [period]: response.data.items }));
    } catch (error) {
      console.error('Error fetching analytics covers activity:', error);
    } finally {
      setCoversActivityLoading(false);
    }
  }, []);

  const fetchCostBreakdown = React.useCallback(async (period: PeriodKey) => {
    setCostBreakdownLoading(true);
    try {
      const response = await apiClient.get<AnalyticsCostBreakdownResponse>('/api/v1/restaurant/analytics/cost-breakdown', {
        params: { period },
      });
      setCostBreakdownByPeriod((current) => ({ ...current, [period]: response.data.items }));
    } catch (error) {
      console.error('Error fetching analytics cost breakdown:', error);
    } finally {
      setCostBreakdownLoading(false);
    }
  }, []);

  const fetchSupplierAlerts = React.useCallback(async (period: PeriodKey) => {
    setSupplierAlertsLoading(true);
    try {
      const response = await apiClient.get<AnalyticsSupplierAlertsResponse>('/api/v1/restaurant/analytics/supplier-alerts', {
        params: { period },
      });
      setSupplierAlertsByPeriod((current) => ({ ...current, [period]: response.data.items }));
    } catch (error) {
      console.error('Error fetching analytics supplier alerts:', error);
    } finally {
      setSupplierAlertsLoading(false);
    }
  }, []);

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
    scheduleSection(force || !revenueTrendByPeriod[period], 1, () => fetchRevenueTrend(period));
    scheduleSection(force || !summaryStatsByPeriod[period], 2, () => fetchSummaryStats(period));
    scheduleSection(force || !revenueComparisonByPeriod[period], 3, () => fetchRevenueComparison(period));
    scheduleSection(force || !coversActivityByPeriod[period], 4, () => fetchCoversActivity(period));
    scheduleSection(force || !costBreakdownByPeriod[period], 5, () => fetchCostBreakdown(period));
    scheduleSection(force || !supplierAlertsByPeriod[period], 6, () => fetchSupplierAlerts(period));

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

  const fetchAnalyticsData = React.useCallback(async (period: PeriodKey) => {
    try {
      if (businessInsight === null) {
        void fetchBusinessInsight();
      }
      await fetchNonAiSectionsStaggered(period, true);
    } finally {
      setRefreshing(false);
    }
  }, [businessInsight, fetchBusinessInsight, fetchNonAiSectionsStaggered]);

  React.useEffect(() => {
    void fetchAnalyticsData(activePeriod);
  }, [activePeriod, fetchAnalyticsData]);

  const handlePeriodChange = (period: string) => {
    setActivePeriod(period as PeriodKey);
  };

  const onRefresh = () => {
    setRefreshing(true);
    void fetchBusinessInsight();
    void fetchAnalyticsData(activePeriod);
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
