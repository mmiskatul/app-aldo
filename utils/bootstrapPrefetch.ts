import apiClient from "../api/apiClient";
import {
  getPrivacyPolicy,
  getRestaurantNotificationSettings,
  getRestaurantSubscriptionSettings,
  getTermsOfService,
  getUserSubscriptionPlans,
} from "../api/settings";
import { useAppStore } from "../store/useAppStore";
import { isCacheFresh } from "./cache";
import {
  normalizeAnalyticsInsight,
  normalizeAnalyticsOverview,
  normalizeCashOverviewData,
  normalizeDocumentsResponse,
} from "./restaurantData";

const PREFETCH_TTL_MS = 60 * 1000;

let inFlightPrefetch: Promise<void> | null = null;

type PeriodKey = "weekly" | "monthly";

type HomeOverviewResponse = {
  greeting_name: string;
  restaurant_name: string | null;
  preferred_language: string;
  available_periods: string[];
  weekly: {
    metrics: { label: string; value: number; change_percent: number; currency: string }[];
    cash_management?: { label: string; amount: number; subtitle: string }[];
    vat_balance: number;
    revenue: { label: string; value: number }[];
    featured_insight?: any;
  };
  monthly: {
    metrics: { label: string; value: number; change_percent: number; currency: string }[];
    cash_management?: { label: string; amount: number; subtitle: string }[];
    vat_balance: number;
    revenue: { label: string; value: number }[];
    featured_insight?: any;
  };
  quick_actions: any[];
  recent_activity: any[];
};

type AnalyticsOverviewResponse = {
  insight_banner?: any;
  revenue_total: number;
  revenue_change_percent: number;
  weekly_revenue: { label: string; value: number }[];
  metric_tiles: { label: string; value: number | string; change_percent?: number; subtitle?: string }[];
  summary_stats: { label: string; value: number | string }[];
  revenue_comparison: { label: string; value: number }[];
  covers_activity: { label: string; value: number | string }[];
  cost_breakdown: { label: string; value: number }[];
  supplier_price_alerts: any[];
};

type InventoryResponse = {
  items: Array<{
    id: string;
    product_name: string;
    supplier_name?: string | null;
    stock_status: string;
    stock_quantity: number;
    unit_type: string;
    unit_price: number;
    purchase_date?: string | null;
    category: string;
    alert_threshold: number;
  }>;
};

const iconForCategory = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes("sauce")) return "🧴";
  if (normalized.includes("grain") || normalized.includes("flour")) return "🌾";
  if (normalized.includes("egg") || normalized.includes("dairy")) return "🥚";
  if (normalized.includes("oil")) return "🫒";
  if (normalized.includes("meat")) return "🥩";
  if (normalized.includes("vegetable") || normalized.includes("produce")) return "🥬";
  return "📦";
};

const statusColorFor = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("alert")) return "#DC2626";
  switch (normalized) {
    case "in_stock":
      return "#16A34A";
    case "low_stock":
    case "out_of_stock":
      return "#DC2626";
    default:
      return "#6B7280";
  }
};

const formatShortDate = (value?: string | null) => {
  if (!value) {
    return "N/A";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const orderHomeMetrics = (
  metrics: { label: string; value: number; change_percent: number; currency: string }[],
) => {
  const order = ["revenue", "expenses", "other expense", "food cost", "profit", "inventory expense"];
  const orderIndex = new Map(order.map((label, index) => [label, index]));
  return [...metrics].sort((left, right) => {
    const leftIndex = orderIndex.get(left.label.trim().toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = orderIndex.get(right.label.trim().toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
};

const shouldPrefetch = (fetchedAt: number | null) => !isCacheFresh(fetchedAt, PREFETCH_TTL_MS);

export const prefetchAppTabData = async (force = false) => {
  if (!force && inFlightPrefetch) {
    return inFlightPrefetch;
  }

  inFlightPrefetch = (async () => {
    const store = useAppStore.getState();

    const tasks: Promise<void>[] = [];

    if (force || shouldPrefetch(store.homeScreenCache.fetchedAt)) {
      tasks.push((async () => {
        const response = await apiClient.get<HomeOverviewResponse>("/api/v1/restaurant/home", {
          params: {
            period: "weekly",
            include_metrics: true,
            include_cash_management: true,
            include_revenue: true,
            include_featured_insight: false,
            include_recent_activity: true,
          },
        });
        const data = response.data;
        const fetchedAt = Date.now();
        useAppStore.getState().setHomeScreenCache({
          shellData: {
            greeting_name: data.greeting_name,
            restaurant_name: data.restaurant_name || "",
            preferred_language: data.preferred_language,
            available_periods: data.available_periods,
            quick_actions: data.quick_actions,
          },
          metricsByPeriod: {
            weekly: orderHomeMetrics(data.weekly.metrics || []),
            monthly: orderHomeMetrics(data.monthly.metrics || []),
          },
          cashByPeriod: {
            weekly: data.weekly.cash_management || [],
            monthly: data.monthly.cash_management || [],
          },
          revenueByPeriod: {
            weekly: data.weekly.revenue || [],
            monthly: data.monthly.revenue || [],
          },
          recentActivity: data.recent_activity || [],
          vatBalance: data.weekly.vat_balance ?? 0,
          fetchedAt,
        });
      })().catch((error: any) => {
        console.log("Bootstrap home prefetch error:", error?.response?.data || error?.message);
      }));
    }

    if (force || shouldPrefetch(store.analyticsScreenCache.fetchedAt)) {
      const periods: PeriodKey[] = ["weekly", "monthly"];
      tasks.push((async () => {
        const results = await Promise.allSettled(
          periods.map((period) =>
            Promise.all([
              apiClient.get<AnalyticsOverviewResponse>("/api/v1/restaurant/analytics/overview", {
                params: { period, include_insight: false },
              }),
              apiClient.get("/api/v1/restaurant/analytics/business-insight", {
                params: { period },
              }),
            ]).then(([overview, insight]) => ({ period, overview: overview.data, insight: insight.data })),
          ),
        );

        const nextMetricTilesByPeriod: Record<string, any> = {};
        const nextRevenueTrendByPeriod: Record<string, any> = {};
        const nextSummaryStatsByPeriod: Record<string, any> = {};
        const nextRevenueComparisonByPeriod: Record<string, any> = {};
        const nextCoversActivityByPeriod: Record<string, any> = {};
        const nextCostBreakdownByPeriod: Record<string, any> = {};
        const nextSupplierAlertsByPeriod: Record<string, any> = {};
        let businessInsight: any = null;

        for (const result of results) {
          if (result.status !== "fulfilled") {
            continue;
          }
          const normalizedOverview = normalizeAnalyticsOverview(result.value.overview);
          const normalizedInsight = normalizeAnalyticsInsight(result.value.insight);
          if (result.value.period === "weekly" && normalizedInsight) {
            businessInsight = normalizedInsight;
          }
          nextMetricTilesByPeriod[result.value.period] = normalizedOverview.metric_tiles;
          nextRevenueTrendByPeriod[result.value.period] = {
            period: result.value.period,
            revenue_total: normalizedOverview.revenue_total,
            change_percent: normalizedOverview.revenue_change_percent,
            points: normalizedOverview.weekly_revenue,
          };
          nextSummaryStatsByPeriod[result.value.period] = normalizedOverview.summary_stats;
          nextRevenueComparisonByPeriod[result.value.period] = normalizedOverview.revenue_comparison;
          nextCoversActivityByPeriod[result.value.period] = normalizedOverview.covers_activity;
          nextCostBreakdownByPeriod[result.value.period] = normalizedOverview.cost_breakdown;
          nextSupplierAlertsByPeriod[result.value.period] = normalizedOverview.supplier_price_alerts;
        }

        useAppStore.getState().setAnalyticsScreenCache({
          businessInsight,
          metricTilesByPeriod: nextMetricTilesByPeriod,
          revenueTrendByPeriod: nextRevenueTrendByPeriod,
          summaryStatsByPeriod: nextSummaryStatsByPeriod,
          revenueComparisonByPeriod: nextRevenueComparisonByPeriod,
          coversActivityByPeriod: nextCoversActivityByPeriod,
          costBreakdownByPeriod: nextCostBreakdownByPeriod,
          supplierAlertsByPeriod: nextSupplierAlertsByPeriod,
          fetchedAt: Date.now(),
        });
      })().catch((error: any) => {
        console.log("Bootstrap analytics prefetch error:", error?.response?.data || error?.message);
      }));
    }

    if (force || shouldPrefetch(store.inventoryListFetchedAt)) {
      tasks.push((async () => {
        const response = await apiClient.get<InventoryResponse>("/api/v1/restaurant/inventory", {
          params: { page: 1, page_size: 50 },
        });
        const nextItems = response.data.items.map((item) => ({
          id: item.id,
          name: item.product_name,
          supplier: item.supplier_name || "Unknown supplier",
          status: item.stock_status,
          statusColor: statusColorFor(item.stock_status),
          quantity: item.stock_quantity,
          unit: item.unit_type,
          unitPrice: item.unit_price,
          lastPurchase: formatShortDate(item.purchase_date),
          icon: iconForCategory(item.category),
        }));

        const currentStore = useAppStore.getState();
        currentStore.setInventoryListCache(nextItems);
        for (const item of response.data.items) {
          currentStore.setInventoryDetailCacheItem(item.id, {
            id: item.id,
            product_name: item.product_name,
            category: item.category,
            stock_quantity: item.stock_quantity,
            unit_type: item.unit_type,
            supplier_name: item.supplier_name,
            unit_price: item.unit_price,
            alert_threshold: item.alert_threshold,
            stock_status: item.stock_status,
            purchase_date: item.purchase_date,
          });
        }
      })().catch((error: any) => {
        console.log("Bootstrap inventory prefetch error:", error?.response?.data || error?.message);
      }));
    }

    if (force || shouldPrefetch(store.documentsScreenCache.fetchedAt)) {
      tasks.push((async () => {
        const response = await apiClient.get("/api/v1/restaurant/documents", {
          params: { page: 1, page_size: 50 },
        });
        const normalized = normalizeDocumentsResponse(response.data);
        useAppStore.getState().setDocumentsScreenCache({
          documents: normalized.items,
          bannerData: normalized.bannerData,
          fetchedAt: Date.now(),
        });
      })().catch((error: any) => {
        console.log("Bootstrap documents prefetch error:", error?.response?.data || error?.message);
      }));
    }

    if (force || shouldPrefetch(store.chatMessagesFetchedAt)) {
      tasks.push((async () => {
        const response = await apiClient.get("/api/v1/restaurant/chat/messages");
        useAppStore.getState().setChatMessagesCache(response.data.messages || []);
      })().catch((error: any) => {
        console.log("Bootstrap chat prefetch error:", error?.response?.data || error?.message);
      }));
    }

    if (force || shouldPrefetch(store.profileFetchedAt)) {
      tasks.push((async () => {
        const response = await apiClient.get("/api/v1/restaurant/settings/profile");
        useAppStore.getState().setProfile(response.data);
      })().catch((error: any) => {
        console.log("Bootstrap profile prefetch error:", error?.response?.data || error?.message);
      }));
    }

    if (force || shouldPrefetch(store.settingsSubscriptionCache.fetchedAt)) {
      tasks.push((async () => {
        const [subscription, plansResponse] = await Promise.all([
          getRestaurantSubscriptionSettings(),
          getUserSubscriptionPlans(),
        ]);
        useAppStore.getState().setSettingsSubscriptionCache({
          subscription,
          plans: plansResponse.plans,
          fetchedAt: Date.now(),
        });
      })().catch((error: any) => {
        console.log("Bootstrap settings subscription prefetch error:", error?.response?.data || error?.message);
      }));
    }

    if (force || shouldPrefetch(store.settingsNotificationsCache.fetchedAt)) {
      tasks.push((async () => {
        const settings = await getRestaurantNotificationSettings();
        useAppStore.getState().setSettingsNotificationsCache({
          settings,
          fetchedAt: Date.now(),
        });
      })().catch((error: any) => {
        console.log("Bootstrap settings notifications prefetch error:", error?.response?.data || error?.message);
      }));
    }

    tasks.push((async () => {
      const legalStore = useAppStore.getState();
      const legalTasks: Promise<void>[] = [];
      if (force || !legalStore.legalDocumentCache["terms-of-service"]) {
        legalTasks.push(
          getTermsOfService().then((document) => {
            useAppStore.getState().setLegalDocumentCacheItem("terms-of-service", document);
          }),
        );
      }
      if (force || !legalStore.legalDocumentCache["privacy-policy"]) {
        legalTasks.push(
          getPrivacyPolicy().then((document) => {
            useAppStore.getState().setLegalDocumentCacheItem("privacy-policy", document);
          }),
        );
      }
      await Promise.allSettled(legalTasks);
    })().catch((error: any) => {
      console.log("Bootstrap legal documents prefetch error:", error?.response?.data || error?.message);
    }));

    if (force || shouldPrefetch(store.cashOverviewData?.fetched_at ?? null)) {
      tasks.push((async () => {
        const response = await apiClient.get("/api/v1/restaurant/cash/overview");
        useAppStore.getState().setCashOverviewData({
          ...normalizeCashOverviewData(response.data),
          fetched_at: Date.now(),
        });
      })().catch((error: any) => {
        console.log("Bootstrap cash prefetch error:", error?.response?.data || error?.message);
      }));
    }

    await Promise.allSettled(tasks);
  })().finally(() => {
    inFlightPrefetch = null;
  });

  return inFlightPrefetch;
};
