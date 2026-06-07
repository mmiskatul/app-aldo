import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, RefreshControl, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale, verticalScale } from "react-native-size-matters";
import { useRouter } from "expo-router";
import apiClient from "../../../api/apiClient";
import { hasActiveSubscription, useAppStore } from "../../../store/useAppStore";

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
import { resolveLocalizedText } from "../../../utils/localizedContent";
import { formatApiDate } from "../../../utils/date";

interface MetricCard {
  label: string;
  value: number;
  change_percent: number;
  currency: string;
  comparison_label?: string | null;
  current_period_label?: string | null;
  previous_period_label?: string | null;
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
  title_translations?: {
    en?: string | null;
    it?: string | null;
  } | null;
  summary_translations?: {
    en?: string | null;
    it?: string | null;
  } | null;
}

interface ActivityItem {
  kind?: string;
  title?: string;
  subtitle?: string;
  title_translations?: {
    en?: string | null;
    it?: string | null;
  } | null;
  subtitle_translations?: {
    en?: string | null;
    it?: string | null;
  } | null;
  timestamp?: string;
  entity_id?: string;
  reference_date?: string;
  route?: string;
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

interface DailyDataInventoryUsageEntry {
  inventory_item_id: string;
  quantity_used?: number | null;
  unit_cost?: number | null;
  total_cost?: number | null;
}

interface DailyDataMetricItem {
  inventory_usage?: DailyDataInventoryUsageEntry[];
}

interface DailyDataMetricResponse {
  items: DailyDataMetricItem[];
}

interface InventoryMetricItem {
  id: string;
  unit_price?: number | null;
}

interface InventoryMetricResponse {
  items: InventoryMetricItem[];
}

interface ExpenseMetricItem {
  amount?: number | null;
  source_kind?: string | null;
}

interface ExpenseMetricPeriod {
  items?: ExpenseMetricItem[];
}

interface ExpensesMetricResponse {
  this_week?: ExpenseMetricPeriod;
  this_month?: ExpenseMetricPeriod;
}

interface CashOverviewPeriod {
  summary: {
    total_collected: number;
    pos_payments: number;
    cash_available: number;
    bank_deposits?: number;
    bank_deposits_total: number;
    withdrawals_total: number;
  };
  status: {
    total_collected: string;
    cash_available: string;
    pos_payments: string;
    withdrawals: string;
    bank_deposits: string;
  };
  recent_deposits: any[];
}

interface CashOverviewResponse {
  active_period: string;
  periods: {
    [key: string]: CashOverviewPeriod;
  };
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

interface HomeOverviewResponse {
  greeting_name: string;
  restaurant_name: string | null;
  preferred_language: string;
  available_periods: string[];
  weekly: {
    metrics: MetricCard[];
    cash_management?: CashItem[];
    vat_balance: number;
    revenue: RevenuePoint[];
    featured_insight?: FeaturedInsight | null;
  };
  monthly: {
    metrics: MetricCard[];
    cash_management?: CashItem[];
    vat_balance: number;
    revenue: RevenuePoint[];
    featured_insight?: FeaturedInsight | null;
  };
  quick_actions: any[];
  recent_activity: ActivityItem[];
}

type PeriodKey = "weekly" | "monthly";

const cashOverviewPeriodKey = (period: PeriodKey) => period === "weekly" ? "this_week" : "this_month";
const FOOD_COST_LABEL = "food cost";
const INVENTORY_EXPENSE_LABEL = "inventory expense";
const OTHER_EXPENSE_LABEL = "other expense";

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const shiftDateByDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const shiftDateByMonths = (date: Date, months: number) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

const previousReferenceDateForPeriod = (period: PeriodKey, referenceDate: Date) =>
  period === "weekly" ? shiftDateByDays(referenceDate, -7) : shiftDateByMonths(referenceDate, -1);

const viewForPeriod = (period: PeriodKey) => period === "weekly" ? "week" : "month";

const sumInventoryUsageCost = (
  items: DailyDataMetricItem[],
  inventoryUnitPriceById: Map<string, number>,
) =>
  items.reduce((total, record) => total + (record.inventory_usage || []).reduce((usageTotal, usageItem) => {
    const explicitTotalCost = Number(usageItem.total_cost);
    if (Number.isFinite(explicitTotalCost)) {
      return usageTotal + explicitTotalCost;
    }

    const quantityUsed = Number(usageItem.quantity_used || 0);
    const explicitUnitCost = Number(usageItem.unit_cost);
    const resolvedUnitCost = Number.isFinite(explicitUnitCost)
      ? explicitUnitCost
      : Number(inventoryUnitPriceById.get(usageItem.inventory_item_id) || 0);

    return usageTotal + (quantityUsed * resolvedUnitCost);
  }, 0), 0);

const calculateChangePercent = (currentValue: number, previousValue: number) => {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
};

const mergeFoodCostMetric = (metrics: MetricCard[], foodCostMetric: MetricCard) => {
  const existingIndex = metrics.findIndex((item) => item.label.trim().toLowerCase() === FOOD_COST_LABEL);
  if (existingIndex === -1) {
    return [...metrics, foodCostMetric];
  }

  return metrics.map((item, index) => index === existingIndex ? foodCostMetric : item);
};

const mergeMetric = (metrics: MetricCard[], nextMetric: MetricCard) => {
  const existingIndex = metrics.findIndex((item) => item.label.trim().toLowerCase() === nextMetric.label.trim().toLowerCase());
  if (existingIndex === -1) {
    return [...metrics, nextMetric];
  }

  return metrics.map((item, index) => index === existingIndex ? nextMetric : item);
};

const sumExpenseAmount = (items: ExpenseMetricItem[], matcher: (item: ExpenseMetricItem) => boolean) =>
  items.reduce((total, item) => matcher(item) ? total + Number(item.amount || 0) : total, 0);

const isInventoryLinkedExpense = (item: ExpenseMetricItem) =>
  item.source_kind === "inventory" || item.source_kind === "document";

const orderHomeMetrics = (metrics: MetricCard[]) => {
  const order = ["revenue", "expenses", OTHER_EXPENSE_LABEL, FOOD_COST_LABEL, "profit", INVENTORY_EXPENSE_LABEL];
  const orderIndex = new Map(order.map((label, index) => [label, index]));

  return [...metrics].sort((left, right) => {
    const leftIndex = orderIndex.get(left.label.trim().toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = orderIndex.get(right.label.trim().toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
};

const cashOverviewToHomeItems = (overview: CashOverviewResponse, period: PeriodKey): CashItem[] => {
  const summary = overview.periods[cashOverviewPeriodKey(period)]?.summary;

  if (!summary) {
    return [];
  }

  const cashDeposit = Number(summary.bank_deposits ?? summary.bank_deposits_total ?? 0);
  const posPayments = Number(summary.pos_payments ?? 0);
  const cashAvailable = Number(summary.cash_available ?? 0);
  const totalCollection = Number(summary.total_collected ?? 0);

  return [
    {
      label: "Total Collection",
      amount: totalCollection,
      subtitle: "Available cash plus POS payments",
    },
    {
      label: "POS Payments",
      amount: posPayments,
      subtitle: "Card and POS settlements",
    },
    {
      label: "Available Cash",
      amount: cashAvailable,
      subtitle: "Cash remaining after expenses and withdrawals",
    },
    {
      label: "Cash Deposit",
      amount: cashDeposit,
      subtitle: "Bank transfers and recorded deposits",
    },
  ];
};

const REVENUE_TRIGGER_Y = 260;
const INSIGHT_TRIGGER_Y = 520;
const RECENT_ACTIVITY_TRIGGER_Y = 760;
const HOME_SECTION_LOAD_DELAY_MS = 160;
const SUPPORTING_DATA_TTL_MS = 120_000;
export default function TabsIndex() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const appLanguage = useAppStore((state) => state.appLanguage);
  const user = useAppStore((state) => state.user);
  const hasSubscription = hasActiveSubscription(user);

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
  const [topCardsRefreshing, setTopCardsRefreshing] = useState(false);

  const triggeredSectionsRef = useRef({
    revenue: false,
    insight: false,
    recentActivity: false,
  });
  const hasInitializedLanguageRef = useRef(false);
  const hasFocusedRef = useRef(false);
  const previousPeriodRef = useRef<PeriodKey>("weekly");
  const lastSupportingDataRefreshRef = useRef(0);

  const calculateInventoryFoodCostMetric = useCallback(async (period: PeriodKey, currency = "EUR"): Promise<MetricCard> => {
    const referenceDate = startOfDay(new Date());
    const previousReferenceDate = previousReferenceDateForPeriod(period, referenceDate);
    const paramsForDate = (date: Date) => ({
      page: 1,
      page_size: 100,
      view: viewForPeriod(period),
      reference_date: formatApiDate(date),
    });

    const [currentPeriodResponse, previousPeriodResponse, inventoryResponse] = await Promise.all([
      apiClient.get<DailyDataMetricResponse>("/api/v1/restaurant/daily-data", {
        params: paramsForDate(referenceDate),
      }),
      apiClient.get<DailyDataMetricResponse>("/api/v1/restaurant/daily-data", {
        params: paramsForDate(previousReferenceDate),
      }),
      apiClient.get<InventoryMetricResponse>("/api/v1/restaurant/inventory", {
        params: {
          page: 1,
          page_size: 200,
        },
      }),
    ]);

    const inventoryUnitPriceById = new Map<string, number>(
      (inventoryResponse.data.items || []).map((item) => [item.id, Number(item.unit_price || 0)]),
    );
    const currentValue = sumInventoryUsageCost(currentPeriodResponse.data.items || [], inventoryUnitPriceById);
    const previousValue = sumInventoryUsageCost(previousPeriodResponse.data.items || [], inventoryUnitPriceById);

    return {
      label: FOOD_COST_LABEL,
      value: currentValue,
      change_percent: calculateChangePercent(currentValue, previousValue),
      currency,
    };
  }, []);

  const calculateSeparatedExpenseMetrics = useCallback(async (period: PeriodKey, currency = "EUR") => {
    const referenceDate = startOfDay(new Date());
    const previousReferenceDate = previousReferenceDateForPeriod(period, referenceDate);
    const periodKey = period === "weekly" ? "this_week" : "this_month";

    const [currentExpensesResponse, previousExpensesResponse] = await Promise.all([
      apiClient.get<ExpensesMetricResponse>("/api/v1/restaurant/expenses", {
        params: {
          reference_date: formatApiDate(referenceDate),
        },
      }),
      apiClient.get<ExpensesMetricResponse>("/api/v1/restaurant/expenses", {
        params: {
          reference_date: formatApiDate(previousReferenceDate),
        },
      }),
    ]);

    const currentItems = currentExpensesResponse.data[periodKey]?.items || [];
    const previousItems = previousExpensesResponse.data[periodKey]?.items || [];

    const currentInventoryExpense = sumExpenseAmount(currentItems, isInventoryLinkedExpense);
    const previousInventoryExpense = sumExpenseAmount(previousItems, isInventoryLinkedExpense);
    const currentOtherExpense = sumExpenseAmount(currentItems, (item) => !isInventoryLinkedExpense(item));
    const previousOtherExpense = sumExpenseAmount(previousItems, (item) => !isInventoryLinkedExpense(item));

    return {
      inventoryExpenseMetric: {
        label: INVENTORY_EXPENSE_LABEL,
        value: currentInventoryExpense,
        change_percent: calculateChangePercent(currentInventoryExpense, previousInventoryExpense),
        currency,
      } satisfies MetricCard,
      otherExpenseMetric: {
        label: OTHER_EXPENSE_LABEL,
        value: currentOtherExpense,
        change_percent: calculateChangePercent(currentOtherExpense, previousOtherExpense),
        currency,
      } satisfies MetricCard,
    };
  }, []);

  const applyDerivedMetricsToMetrics = useCallback(async (period: PeriodKey, metrics: MetricCard[]) => {
    return orderHomeMetrics(metrics);
  }, []);

  const hydrateSupportingData = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastSupportingDataRefreshRef.current < SUPPORTING_DATA_TTL_MS) {
      return;
    }
    const [analyticsRes, profileRes] = await Promise.allSettled([
      apiClient.get("/api/v1/restaurant/analytics/overview"),
      apiClient.get("/api/v1/restaurant/settings/profile"),
    ]);

    if (analyticsRes.status === "fulfilled") {
      setAnalyticsData(analyticsRes.value.data);
    } else {
      console.log("Analytics preload error:", analyticsRes.reason?.response?.data || analyticsRes.reason?.message);
    }

    if (profileRes.status === "fulfilled") {
      setProfile(profileRes.value.data);
    } else {
      console.log("Profile preload error:", profileRes.reason?.response?.data || profileRes.reason?.message);
    }
    lastSupportingDataRefreshRef.current = now;
  }, [setAnalyticsData, setProfile]);

  const fetchHomeShell = useCallback(async () => {
    try {
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
    } catch (error: any) {
      console.log("Home shell preload error:", error?.response?.data || error?.message);
    }
  }, [setHomeScreenCache]);

  const applyHomeOverview = useCallback(async (data: HomeOverviewResponse, period: PeriodKey, includeFeaturedInsight = false) => {
    const nextShellData = {
      greeting_name: data.greeting_name,
      restaurant_name: data.restaurant_name || "",
      preferred_language: data.preferred_language,
      available_periods: data.available_periods,
      quick_actions: data.quick_actions,
    };
    const [weeklyMetrics, monthlyMetrics] = await Promise.all([
      applyDerivedMetricsToMetrics("weekly", data.weekly.metrics || []),
      applyDerivedMetricsToMetrics("monthly", data.monthly.metrics || []),
    ]);
    const nextMetricsByPeriod = {
      weekly: weeklyMetrics,
      monthly: monthlyMetrics,
    };
    const nextRevenueByPeriod = {
      weekly: data.weekly.revenue,
      monthly: data.monthly.revenue,
    };
    const nextInsightByPeriod: Partial<Record<PeriodKey, FeaturedInsight | null>> = {};

    if (includeFeaturedInsight && data.weekly.featured_insight !== undefined) {
      nextInsightByPeriod.weekly = data.weekly.featured_insight;
    }
    if (includeFeaturedInsight && data.monthly.featured_insight !== undefined) {
      nextInsightByPeriod.monthly = data.monthly.featured_insight;
    }

    setShellData(nextShellData);
    setMetricsByPeriod(nextMetricsByPeriod);
    setRevenueByPeriod(nextRevenueByPeriod);
    setVatBalance(data[period].vat_balance);
    if (data.recent_activity?.length) {
      setRecentActivity(data.recent_activity);
    }
    if (Object.keys(nextInsightByPeriod).length > 0) {
      setInsightByPeriod((current) => ({ ...current, ...nextInsightByPeriod }));
    }

    setHomeScreenCache({
      shellData: nextShellData,
      metricsByPeriod: nextMetricsByPeriod,
      revenueByPeriod: nextRevenueByPeriod,
      vatBalance: data[period].vat_balance,
      fetchedAt: Date.now(),
      ...(data.recent_activity?.length ? { recentActivity: data.recent_activity } : {}),
      ...(Object.keys(nextInsightByPeriod).length > 0 ? { insightByPeriod: nextInsightByPeriod } : {}),
    });

    if (data.available_periods?.length > 0) {
      setActivePeriod((currentPeriod) =>
        data.available_periods.includes(currentPeriod)
          ? currentPeriod
          : data.available_periods[0] as PeriodKey
      );
    }
  }, [applyDerivedMetricsToMetrics, setHomeScreenCache]);

  const fetchHomeOverview = useCallback(async (period: PeriodKey) => {
    const includeFeaturedInsight = false;
    const response = await apiClient.get<HomeOverviewResponse>("/api/v1/restaurant/home", {
      params: {
        period,
        include_metrics: true,
        include_cash_management: false,
        include_revenue: true,
        include_featured_insight: includeFeaturedInsight,
        include_recent_activity: false,
      },
    });
    await applyHomeOverview(response.data, period, includeFeaturedInsight);
  }, [applyHomeOverview]);

  const fetchMetricsSection = useCallback(async (period: PeriodKey, options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setMetricsLoading(true);
    }
    try {
      const response = await apiClient.get<HomeSectionMetricResponse>("/api/v1/restaurant/home/metrics", {
        params: { period },
      });
      const nextItems = await applyDerivedMetricsToMetrics(period, response.data.items || []);
      let nextMetricsByPeriod: Partial<Record<PeriodKey, MetricCard[]>> | null = null;
      setMetricsByPeriod((current) => {
        nextMetricsByPeriod = { ...current, [period]: nextItems };
        return nextMetricsByPeriod;
      });
      if (nextMetricsByPeriod) {
        setHomeScreenCache({ metricsByPeriod: nextMetricsByPeriod });
      }
    } catch (error: any) {
      console.log("Home metrics error:", error.response?.data || error.message);
    } finally {
      if (!silent) {
        setMetricsLoading(false);
      }
    }
  }, [applyDerivedMetricsToMetrics, setHomeScreenCache]);

  const fetchCashSection = useCallback(async (period: PeriodKey, options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setCashLoading(true);
    }
    try {
      const response = await apiClient.get<CashOverviewResponse>("/api/v1/restaurant/cash/overview");
      setCashOverviewData(response.data);
      const items = cashOverviewToHomeItems(response.data, period);
      let nextCashByPeriod: Partial<Record<PeriodKey, CashItem[]>> | null = null;
      setCashByPeriod((current) => {
        nextCashByPeriod = { ...current, [period]: items };
        return nextCashByPeriod;
      });
      if (nextCashByPeriod) {
        setHomeScreenCache({ cashByPeriod: nextCashByPeriod });
      }
    } catch (error: any) {
      console.log("Home cash section error:", error.response?.data || error.message);
    } finally {
      if (!silent) {
        setCashLoading(false);
      }
    }
  }, [setCashOverviewData, setHomeScreenCache]);

  const fetchVatSection = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setVatLoading(true);
    }
    try {
      const response = await apiClient.get<HomeSectionVatBalanceResponse>("/api/v1/restaurant/home/vat-balance");
      setVatBalance(response.data.balance);
      setHomeScreenCache({ vatBalance: response.data.balance });
    } catch (error: any) {
      console.log("Home VAT error:", error.response?.data || error.message);
    } finally {
      if (!silent) {
        setVatLoading(false);
      }
    }
  }, []);

  const fetchRevenueSection = useCallback(async (period: PeriodKey, options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setRevenueLoading(true);
    }
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
      if (!silent) {
        setRevenueLoading(false);
      }
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

  const fetchRecentActivitySection = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setRecentActivityLoading(true);
    }
    try {
      const response = await apiClient.get<HomeSectionRecentActivityResponse>("/api/v1/restaurant/home/recent-activity");
      setRecentActivity(response.data.items);
      setHomeScreenCache({ recentActivity: response.data.items });
    } catch (error: any) {
      console.log("Home recent activity error:", error.response?.data || error.message);
    } finally {
      if (!silent) {
        setRecentActivityLoading(false);
      }
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
        if (!force) {
          await waitForDelay(order * HOME_SECTION_LOAD_DELAY_MS);
        }
        await fetcher();
      })());
    };

    scheduleSection(force || !metricsByPeriod[period], 0, () => fetchMetricsSection(period));
    scheduleSection(force || !cashByPeriod[period], 1, () => fetchCashSection(period));
    scheduleSection(force || vatBalance === null, 2, () => fetchVatSection());
    scheduleSection(force || !revenueByPeriod[period], 3, () => fetchRevenueSection(period));

    if (tasks.length > 0) {
      await Promise.allSettled(tasks);
    }
  }, [cashByPeriod, fetchCashSection, fetchMetricsSection, fetchRevenueSection, fetchVatSection, metricsByPeriod, revenueByPeriod, vatBalance, waitForDelay]);

  const fetchHomeData = useCallback(async (period: PeriodKey, silent = false, force = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      if (force) {
        setCashByPeriod({});
        setHomeScreenCache({ cashByPeriod: {} });
      }
      triggeredSectionsRef.current = {
        revenue: false,
        insight: false,
        recentActivity: false,
      };
      await Promise.allSettled([
        fetchHomeOverview(period),
        fetchCashSection(period, { silent: true }),
        fetchRecentActivitySection({ silent: true }),
        hydrateSupportingData(force),
      ]);
    } catch (error: any) {
      console.log("Home shell error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchHomeOverview, fetchRecentActivitySection, hydrateSupportingData, recentActivity, setHomeScreenCache]);

  useFocusEffect(
    useCallback(() => {
      if (!hasSubscription) {
        return () => {};
      }
      hasFocusedRef.current = true;
      previousPeriodRef.current = activePeriod;
      const hasCachedShell = !!homeScreenCache.shellData;

      if (!hasCachedShell) {
        void fetchHomeData(activePeriod, false, true);
        return () => {};
      }

      void fetchHomeData(activePeriod, true, false);
      return () => {
      };
    }, [activePeriod, fetchHomeData, hasSubscription, homeScreenCache.shellData])
  );

  useEffect(() => {
    if (!hasSubscription || !hasFocusedRef.current || loading || previousPeriodRef.current === activePeriod) {
      return;
    }
    previousPeriodRef.current = activePeriod;
    void fetchTopPrioritySections(activePeriod);
  }, [activePeriod, fetchTopPrioritySections, hasSubscription, loading]);

  useEffect(() => {
    if (hasSubscription && !loading) {
      void fetchTopPrioritySections(activePeriod);
      if (triggeredSectionsRef.current.revenue && !revenueByPeriod[activePeriod]) {
        void fetchRevenueSection(activePeriod);
      }
      if (triggeredSectionsRef.current.insight && !(activePeriod in insightByPeriod)) {
        void fetchInsightSection(activePeriod);
      }
    }
  }, [activePeriod, fetchInsightSection, fetchRevenueSection, fetchTopPrioritySections, hasSubscription, insightByPeriod, loading, revenueByPeriod]);

  useEffect(() => {
    if (!hasSubscription) {
      return;
    }
    if (!hasInitializedLanguageRef.current) {
      hasInitializedLanguageRef.current = true;
      return;
    }
    void fetchHomeShell();
  }, [appLanguage, fetchHomeShell, hasSubscription]);

  const onRefresh = async () => {
    if (!hasSubscription) {
      return;
    }
    setRefreshing(true);
    setLoading(true);
    setTopCardsRefreshing(true);
    try {
      await Promise.allSettled([
        fetchHomeOverview(activePeriod),
        fetchTopPrioritySections(activePeriod, true),
        fetchRecentActivitySection(),
        hydrateSupportingData(true),
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setTopCardsRefreshing(false);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!hasSubscription) {
      return;
    }
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
  const localizedCurrentInsight = currentInsight
    ? {
        ...currentInsight,
        title: resolveLocalizedText(appLanguage, currentInsight.title_translations, currentInsight.title),
        summary: resolveLocalizedText(appLanguage, currentInsight.summary_translations, currentInsight.summary),
      }
    : null;
  const shellLoading = loading && !shellData;
  const metricsSectionLoading = (loading || metricsLoading || topCardsRefreshing) && !currentMetrics;
  const cashSectionLoading = refreshing || loading || cashLoading;
  const quickActionsLoading = refreshing || (loading && !shellData?.quick_actions?.length);
  const vatSectionLoading = (refreshing || loading || vatLoading) && vatBalance === null;

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

  const navigateFromHome = useCallback((route: string) => {
    router.push(route as any);
  }, [router]);

  const handleCashCardPress = useCallback((keyName: "total_collected" | "pos_payments" | "cash_available" | "cash_deposit") => {
    switch (keyName) {
      case "cash_deposit":
        navigateFromHome("/(tabs)/home/add-bank-deposit");
        return;
      case "pos_payments":
      case "total_collected":
      case "cash_available":
      default:
        navigateFromHome("/(tabs)/home/cash-management");
        return;
    }
  }, [navigateFromHome]);

  const handleMetricPress = useCallback((metric: MetricCard) => {
    router.push({
      pathname: "/(tabs)/home/metric-details",
      params: {
        label: metric.label,
        period: activePeriod,
        value: String(metric.value),
        changePercent: String(metric.change_percent),
        currency: metric.currency,
        comparisonLabel: metric.comparison_label || "",
        currentPeriodLabel: metric.current_period_label || "",
        previousPeriodLabel: metric.previous_period_label || "",
      },
    } as any);
  }, [activePeriod, router]);

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
          availablePeriods={shellData?.available_periods || []}
          onPeriodChange={(period) => setActivePeriod(period as PeriodKey)}
          onExport={handleExport}
        />
        <KPIGrid
          metrics={currentMetrics}
          loading={metricsSectionLoading || topCardsRefreshing}
          onMetricPress={handleMetricPress}
        />
        <CashManagement
          cashData={currentCashManagement}
          loading={cashSectionLoading}
          onItemPress={handleCashCardPress}
        />
        <QuickActions items={shellData?.quick_actions} loading={quickActionsLoading} onNavigate={navigateFromHome} />
        <VatBalance
          balance={vatBalance ?? undefined}
          loading={vatSectionLoading}
          onPress={() => navigateFromHome("/(tabs)/home/vat")}
        />
        <RevenueChart
          revenue={currentRevenue}
          period={activePeriod}
          loading={refreshing || ((shellLoading || revenueLoading) && !currentRevenue)}
          onPress={() => navigateFromHome("/(tabs)/home/revenue-entries")}
        />
        <AIInsightBox
          insight={localizedCurrentInsight ?? undefined}
          loading={refreshing || ((shellLoading || insightLoading) && !(activePeriod in insightByPeriod))}
          onNavigate={navigateFromHome}
        />
        <RecentActivity
          activities={recentActivity ?? undefined}
          loading={refreshing || ((shellLoading || recentActivityLoading) && recentActivity === null)}
          onNavigate={navigateFromHome}
          onSeeAll={() => navigateFromHome("/(tabs)/home/recent-activity")}
        />
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
