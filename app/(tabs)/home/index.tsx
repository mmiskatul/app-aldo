import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale, verticalScale } from "react-native-size-matters";
import { useRouter } from "expo-router";
import apiClient from "../../../api/apiClient";
import { useAppStore } from "../../../store/useAppStore";

import ActionFilterBar from "../../../components/home/ActionFilterBar";
import AIInsightBox from "../../../components/home/AIInsightBox";
import CashManagement from "../../../components/home/CashManagement";
import HomeHeader from "../../../components/home/HomeHeader";
import KPIGrid from "../../../components/home/KPIGrid";
import QuickActions from "../../../components/home/QuickActions";
import RecentActivity from "../../../components/home/RecentActivity";
import RevenueChart from "../../../components/home/RevenueChart";
import VatBalance from "../../../components/home/VatBalance";
import { generatePdfExport, generateExcelExport } from "../../../utils/exportData";

interface MetricCard {
  label: string;
  value: number;
  change_percent: number;
  currency: string;
}

interface CashItem {
  label: string;
  amount: number;
  subtitle: string;
}

interface RevenuePoint {
  label: string;
  value: number;
}

interface FeaturedInsight {
  title: string;
  summary: string;
}

interface ActivityItem {
  kind?: string;
  title?: string;
  subtitle?: string;
  timestamp?: string;
}

interface HomeShellData {
  greeting_name: string;
  restaurant_name: string;
  preferred_language: string;
  available_periods: string[];
  quick_actions: any[];
}

interface HomeSectionMetricResponse {
  period: "weekly" | "monthly";
  items: MetricCard[];
}

interface HomeSectionCashResponse {
  period: "weekly" | "monthly";
  items: CashItem[];
}

interface HomeSectionRevenueResponse {
  period: "weekly" | "monthly";
  items: RevenuePoint[];
}

interface HomeSectionInsightResponse {
  period: "weekly" | "monthly";
  insight: FeaturedInsight | null;
}

interface HomeSectionRecentActivityResponse {
  items: ActivityItem[];
}

interface HomeSectionVatBalanceResponse {
  balance: number;
}

type PeriodKey = "weekly" | "monthly";

const REVENUE_TRIGGER_Y = 260;
const INSIGHT_TRIGGER_Y = 520;
const RECENT_ACTIVITY_TRIGGER_Y = 760;
const HOME_SECTION_LOAD_DELAY_MS = 160;

export default function TabsIndex() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const setAnalyticsData = useAppStore((state) => state.setAnalyticsData);
  const setCashOverviewData = useAppStore((state) => state.setCashOverviewData);
  const setProfile = useAppStore((state) => state.setProfile);
  const homeScreenCache = useAppStore((state) => state.homeScreenCache);
  const setHomeScreenCache = useAppStore((state) => state.setHomeScreenCache);

  const [shellData, setShellData] = useState<HomeShellData | null>(homeScreenCache.shellData);
  const [activePeriod, setActivePeriod] = useState<PeriodKey>("weekly");
  const [loading, setLoading] = useState(!homeScreenCache.shellData);
  const [refreshing, setRefreshing] = useState(false);

  const [metricsByPeriod, setMetricsByPeriod] = useState<Partial<Record<PeriodKey, MetricCard[]>>>(homeScreenCache.metricsByPeriod);
  const [cashByPeriod, setCashByPeriod] = useState<Partial<Record<PeriodKey, CashItem[]>>>(homeScreenCache.cashByPeriod);
  const [revenueByPeriod, setRevenueByPeriod] = useState<Partial<Record<PeriodKey, RevenuePoint[]>>>(homeScreenCache.revenueByPeriod);
  const [insightByPeriod, setInsightByPeriod] = useState<Partial<Record<PeriodKey, FeaturedInsight | null>>>(homeScreenCache.insightByPeriod);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[] | null>(homeScreenCache.recentActivity);
  const [vatBalance, setVatBalance] = useState<number | null>(homeScreenCache.vatBalance);

  const [metricsLoading, setMetricsLoading] = useState(false);
  const [cashLoading, setCashLoading] = useState(false);
  const [vatLoading, setVatLoading] = useState(false);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [recentActivityLoading, setRecentActivityLoading] = useState(false);

  const triggeredSectionsRef = useRef({
    revenue: false,
    insight: false,
    recentActivity: false,
  });
  const hasFocusedRef = useRef(false);
  const previousPeriodRef = useRef<PeriodKey>("weekly");

  const hydrateSupportingData = useCallback(async () => {
    const [analyticsRes, cashOverviewRes, profileRes] = await Promise.allSettled([
      apiClient.get("/api/v1/restaurant/analytics/overview"),
      apiClient.get("/api/v1/restaurant/cash/overview"),
      apiClient.get("/api/v1/restaurant/settings/profile"),
    ]);

    if (analyticsRes.status === "fulfilled") {
      setAnalyticsData(analyticsRes.value.data);
    } else {
      console.log("Analytics preload error:", analyticsRes.reason?.response?.data || analyticsRes.reason?.message);
    }

    if (cashOverviewRes.status === "fulfilled") {
      setCashOverviewData(cashOverviewRes.value.data);
    } else {
      console.log("Cash overview preload error:", cashOverviewRes.reason?.response?.data || cashOverviewRes.reason?.message);
    }

    if (profileRes.status === "fulfilled") {
      setProfile(profileRes.value.data);
    } else {
      console.log("Profile preload error:", profileRes.reason?.response?.data || profileRes.reason?.message);
    }
  }, [setAnalyticsData, setCashOverviewData, setProfile]);

  const fetchHomeShell = useCallback(async () => {
    const response = await apiClient.get("/api/v1/restaurant/home", {
      params: {
        include_metrics: false,
        include_cash_management: false,
        include_revenue: false,
        include_featured_insight: false,
        include_recent_activity: false,
      },
    });

    const nextShellData = {
      greeting_name: response.data.greeting_name,
      restaurant_name: response.data.restaurant_name,
      preferred_language: response.data.preferred_language,
      available_periods: response.data.available_periods,
      quick_actions: response.data.quick_actions,
    };

    setShellData(nextShellData);
    setHomeScreenCache({ shellData: nextShellData });

    if (response.data.available_periods?.length > 0) {
      setActivePeriod((currentPeriod) =>
        response.data.available_periods.includes(currentPeriod)
          ? currentPeriod
          : response.data.available_periods[0]
      );
    }
  }, [setHomeScreenCache]);

  const fetchMetricsSection = useCallback(async (period: PeriodKey) => {
    setMetricsLoading(true);
    try {
      const response = await apiClient.get<HomeSectionMetricResponse>("/api/v1/restaurant/home/metrics", {
        params: { period },
      });
      let nextMetricsByPeriod: Partial<Record<PeriodKey, MetricCard[]>> | null = null;
      setMetricsByPeriod((current) => {
        nextMetricsByPeriod = { ...current, [period]: response.data.items };
        return nextMetricsByPeriod;
      });
      if (nextMetricsByPeriod) {
        setHomeScreenCache({ metricsByPeriod: nextMetricsByPeriod });
      }
    } catch (error: any) {
      console.log("Home metrics error:", error.response?.data || error.message);
    } finally {
      setMetricsLoading(false);
    }
  }, [setHomeScreenCache]);

  const fetchCashSection = useCallback(async (period: PeriodKey) => {
    setCashLoading(true);
    try {
      const response = await apiClient.get<HomeSectionCashResponse>("/api/v1/restaurant/home/cash-management", {
        params: { period },
      });
      let nextCashByPeriod: Partial<Record<PeriodKey, CashItem[]>> | null = null;
      setCashByPeriod((current) => {
        nextCashByPeriod = { ...current, [period]: response.data.items };
        return nextCashByPeriod;
      });
      if (nextCashByPeriod) {
        setHomeScreenCache({ cashByPeriod: nextCashByPeriod });
      }
    } catch (error: any) {
      console.log("Home cash section error:", error.response?.data || error.message);
    } finally {
      setCashLoading(false);
    }
  }, [setHomeScreenCache]);

  const fetchVatSection = useCallback(async () => {
    setVatLoading(true);
    try {
      const response = await apiClient.get<HomeSectionVatBalanceResponse>("/api/v1/restaurant/home/vat-balance");
      setVatBalance(response.data.balance);
      setHomeScreenCache({ vatBalance: response.data.balance });
    } catch (error: any) {
      console.log("Home VAT error:", error.response?.data || error.message);
    } finally {
      setVatLoading(false);
    }
  }, []);

  const fetchRevenueSection = useCallback(async (period: PeriodKey) => {
    setRevenueLoading(true);
    try {
      const response = await apiClient.get<HomeSectionRevenueResponse>("/api/v1/restaurant/home/revenue", {
        params: { period },
      });
      let nextRevenueByPeriod: Partial<Record<PeriodKey, RevenuePoint[]>> | null = null;
      setRevenueByPeriod((current) => {
        nextRevenueByPeriod = { ...current, [period]: response.data.items };
        return nextRevenueByPeriod;
      });
      if (nextRevenueByPeriod) {
        setHomeScreenCache({ revenueByPeriod: nextRevenueByPeriod });
      }
    } catch (error: any) {
      console.log("Home revenue error:", error.response?.data || error.message);
    } finally {
      setRevenueLoading(false);
    }
  }, [setHomeScreenCache]);

  const fetchInsightSection = useCallback(async (period: PeriodKey) => {
    setInsightLoading(true);
    try {
      const response = await apiClient.get<HomeSectionInsightResponse>("/api/v1/restaurant/home/insight", {
        params: { period },
      });
      let nextInsightByPeriod: Partial<Record<PeriodKey, FeaturedInsight | null>> | null = null;
      setInsightByPeriod((current) => {
        nextInsightByPeriod = { ...current, [period]: response.data.insight };
        return nextInsightByPeriod;
      });
      if (nextInsightByPeriod) {
        setHomeScreenCache({ insightByPeriod: nextInsightByPeriod });
      }
    } catch (error: any) {
      console.log("Home insight error:", error.response?.data || error.message);
    } finally {
      setInsightLoading(false);
    }
  }, [setHomeScreenCache]);

  const fetchRecentActivitySection = useCallback(async () => {
    setRecentActivityLoading(true);
    try {
      const response = await apiClient.get<HomeSectionRecentActivityResponse>("/api/v1/restaurant/home/recent-activity");
      setRecentActivity(response.data.items);
      setHomeScreenCache({ recentActivity: response.data.items });
    } catch (error: any) {
      console.log("Home recent activity error:", error.response?.data || error.message);
    } finally {
      setRecentActivityLoading(false);
    }
  }, []);

  const waitForDelay = useCallback((delayMs: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }, []);

  const fetchTopPrioritySections = useCallback(async (period: PeriodKey, force = false) => {
    const tasks: Promise<void>[] = [];

    const scheduleSection = (
      shouldFetch: boolean,
      order: number,
      fetcher: () => Promise<void>,
    ) => {
      if (!shouldFetch) {
        return;
      }
      tasks.push((async () => {
        await waitForDelay(order * HOME_SECTION_LOAD_DELAY_MS);
        await fetcher();
      })());
    };

    scheduleSection(force || !metricsByPeriod[period], 0, () => fetchMetricsSection(period));
    scheduleSection(force || !cashByPeriod[period], 1, () => fetchCashSection(period));
    scheduleSection(force || vatBalance === null, 2, () => fetchVatSection());

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }
  }, [cashByPeriod, fetchCashSection, fetchMetricsSection, fetchVatSection, metricsByPeriod, vatBalance, waitForDelay]);

  const fetchHomeData = useCallback(async (period: PeriodKey, silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      triggeredSectionsRef.current = {
        revenue: false,
        insight: false,
        recentActivity: false,
      };
      await fetchHomeShell();
      await fetchTopPrioritySections(period, true);
      void hydrateSupportingData();
    } catch (error: any) {
      console.log("Home shell error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchHomeShell, fetchTopPrioritySections, hydrateSupportingData]);

  useFocusEffect(
    useCallback(() => {
      hasFocusedRef.current = true;
      previousPeriodRef.current = activePeriod;
      void fetchHomeData(activePeriod, !!homeScreenCache.shellData);
    }, [activePeriod, fetchHomeData])
  );

  useEffect(() => {
    if (!hasFocusedRef.current || loading || previousPeriodRef.current === activePeriod) {
      return;
    }
    previousPeriodRef.current = activePeriod;
    void fetchTopPrioritySections(activePeriod);
  }, [activePeriod, fetchTopPrioritySections, loading]);

  useEffect(() => {
    if (!loading) {
      void fetchTopPrioritySections(activePeriod);
      if (triggeredSectionsRef.current.revenue && !revenueByPeriod[activePeriod]) {
        void fetchRevenueSection(activePeriod);
      }
      if (triggeredSectionsRef.current.insight && !(activePeriod in insightByPeriod)) {
        void fetchInsightSection(activePeriod);
      }
    }
  }, [activePeriod, fetchInsightSection, fetchRevenueSection, fetchTopPrioritySections, insightByPeriod, loading, revenueByPeriod]);

  const onRefresh = () => {
    setRefreshing(true);
    void fetchHomeData(activePeriod);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    if (offsetY >= REVENUE_TRIGGER_Y && !triggeredSectionsRef.current.revenue) {
      triggeredSectionsRef.current.revenue = true;
      if (!revenueByPeriod[activePeriod]) {
        void fetchRevenueSection(activePeriod);
      }
    }

    if (offsetY >= INSIGHT_TRIGGER_Y && !triggeredSectionsRef.current.insight) {
      triggeredSectionsRef.current.insight = true;
      if (!(activePeriod in insightByPeriod)) {
        void fetchInsightSection(activePeriod);
      }
    }

    if (offsetY >= RECENT_ACTIVITY_TRIGGER_Y && !triggeredSectionsRef.current.recentActivity) {
      triggeredSectionsRef.current.recentActivity = true;
      if (recentActivity === null) {
        void fetchRecentActivitySection();
      }
    }
  };

  const currentMetrics = metricsByPeriod[activePeriod];
  const currentCashManagement = cashByPeriod[activePeriod];
  const currentRevenue = revenueByPeriod[activePeriod];
  const currentInsight = insightByPeriod[activePeriod];
  const shellLoading = loading && !shellData;
  const metricsSectionLoading = (loading || metricsLoading) && !currentMetrics;
  const cashSectionLoading = (loading || cashLoading) && !currentCashManagement;
  const quickActionsLoading = (loading && !shellData?.quick_actions?.length);
  const vatSectionLoading = (loading || vatLoading) && vatBalance === null;

  const handleExport = async (format: "pdf" | "excel") => {
    const exportPayload = {
      metrics: currentMetrics,
      cashData: currentCashManagement,
      period: activePeriod,
    };

    if (format === "pdf") {
      await generatePdfExport(exportPayload);
    } else if (format === "excel") {
      await generateExcelExport(exportPayload);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          paddingTop: Math.max(insets.top + verticalScale(16), verticalScale(16)),
          paddingHorizontal: scale(20),
          backgroundColor: "#F9FAFB",
          zIndex: 10,
        }}
      >
        <HomeHeader
          greetingName={shellData?.greeting_name}
          restaurantName={shellData?.restaurant_name}
          preferredLanguage={shellData?.preferred_language}
        />
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: verticalScale(16),
            paddingBottom: Math.max(insets.bottom, verticalScale(0)),
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FA8C4C"]} />}
      >
        <ActionFilterBar
          activePeriod={activePeriod}
          availablePeriods={shellData?.available_periods || ["weekly", "monthly"]}
          onPeriodChange={(period) => setActivePeriod(period as PeriodKey)}
          onExport={handleExport}
        />
        <KPIGrid metrics={currentMetrics} loading={metricsSectionLoading} />
        <CashManagement cashData={currentCashManagement} loading={cashSectionLoading} />
        <QuickActions items={shellData?.quick_actions} loading={quickActionsLoading} />
        <VatBalance
          balance={vatBalance ?? undefined}
          loading={vatSectionLoading}
          onPress={() => router.push("/(tabs)/home/vat")}
        />
        <RevenueChart
          revenue={currentRevenue}
          period={activePeriod}
          loading={(shellLoading || revenueLoading) && !currentRevenue}
        />
        <AIInsightBox insight={currentInsight ?? undefined} loading={(shellLoading || insightLoading) && !(activePeriod in insightByPeriod)} />
        <RecentActivity activities={recentActivity ?? undefined} loading={(shellLoading || recentActivityLoading) && recentActivity === null} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(20),
  },
});
