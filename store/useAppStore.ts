import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthenticatedUser } from "../api/auth";

const DEFAULT_APP_LANGUAGE = "it" as const;

export type User = AuthenticatedUser;

export const getRestrictedAccessStatus = (user: User | null): "restricted" | "suspended" | null => {
  if (!user || user.is_active !== false) {
    return null;
  }

  if (user.account_status === "restricted" || user.account_status === "suspended") {
    return user.account_status;
  }

  // Backward compatibility for older persisted sessions that only stored subscription_status.
  if (user.subscription_status === "suspended") {
    return "suspended";
  }

  return null;
};

export const hasActiveSubscription = (user: User | null): boolean => {
  if (!user) {
    return false;
  }
  if (user.subscription_selection_required === true) {
    return false;
  }
  return (
    Boolean(user.subscription_plan_name) &&
    ["active", "trial"].includes(String(user.subscription_status || ""))
  );
};

export interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
  restaurant_name: string | null;
  restaurant_type: string | null;
  location: string | null;
  city_location: string | null;
  number_of_seats: string | number | null;
  average_spend_per_customer: number | null;
  main_business_goal: string | null;
  biggest_problem: string | null;
  improvement_focus: string | null;
  preferred_language: string;
  profile_image_url: string | null;
  interior_photo_url?: string | null;
  exterior_photo_url?: string | null;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface PendingRegistration {
  restaurant_name: string;
  owner_full_name: string;
  email: string;
  password: string;
}

export interface AnalyticsData {
  insight_banner: {
    title: string;
    subtitle: string;
  };
  revenue_total: number;
  revenue_change_percent: number;
  weekly_revenue: { label: string; value: number }[];
  metric_tiles: {
    label: string;
    value: number | string;
    change_percent?: number;
    subtitle?: string;
  }[];
  summary_stats: { label: string; value: number | string }[];
  revenue_comparison: { label: string; value: number }[];
  covers_total: number;
  covers_activity: { label: string; value: number }[];
  avg_revenue_per_cover: number;
  cost_breakdown: { label: string; value: number }[];
  supplier_price_alerts: Array<Record<string, unknown>>;
}

export interface CashOverviewData {
  active_period: string;
  fetched_at?: number | null;
  periods: {
    [key: string]: {
      summary: {
        total_collected: number;
        cash_available: number;
        pos_payments: number;
        withdrawals_total: number;
        bank_deposits?: number;
        bank_deposits_total: number;
      };
      status: {
        total_collected: string;
        cash_available: string;
        pos_payments: string;
        withdrawals: string;
        bank_deposits: string;
      };
      recent_deposits: any[];
    };
  };
}

export interface VatOverviewData {
  estimated_vat_balance: number;
  vat_payable: number;
  vat_receivable: number;
  filing_deadline: string | null;
  report_ready: boolean;
  fetched_at?: number | null;
}

export interface InventoryDetailCacheItem {
  id: string;
  product_name: string;
  category: string;
  stock_quantity: number;
  unit_type: string;
  supplier_name?: string | null;
  unit_price: number;
  alert_threshold: number;
  stock_status?: string;
  purchase_date?: string | null;
  current_stock_value?: number;
  history?: {
    kind: string;
    quantity_delta: number;
    occurred_at: string;
  }[];
}

export interface InventoryListCacheItem {
  id: string;
  name: string;
  supplier: string;
  status: string;
  statusColor: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lastPurchase: string;
  icon: string;
}

export interface ChatCacheMessage {
  id: string;
  role: string;
  message: string;
  message_translations?: {
    en?: string | null;
    it?: string | null;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
  edited_at?: string | null;
  reply_to_message_id?: string | null;
  attachment_name?: string | null;
  attachment_source?: string | null;
  attachment_summary?: string | null;
  attachment_summary_translations?: {
    en?: string | null;
    it?: string | null;
  } | null;
}

export interface LegalDocumentCacheItem {
  key: string;
  title: string;
  content: string;
  updated_at: string | null;
  updated_by: string | null;
}

export interface HomeMetricCacheItem {
  label: string;
  value: number;
  change_percent: number;
  currency: string;
}

export interface HomeCashCacheItem {
  label: string;
  amount: number;
  subtitle: string;
}

export interface HomeRevenueCacheItem {
  label: string;
  value: number;
}

export interface HomeInsightCacheItem {
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

export interface HomeActivityCacheItem {
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
  source_kind?: string;
  source_entity_id?: string;
}

export interface HomeShellCacheItem {
  greeting_name: string;
  restaurant_name: string;
  preferred_language: string;
  available_periods: string[];
  quick_actions: any[];
}

export interface HomeScreenCache {
  shellData: HomeShellCacheItem | null;
  metricsByPeriod: Partial<Record<'weekly' | 'monthly', HomeMetricCacheItem[]>>;
  cashByPeriod: Partial<Record<'weekly' | 'monthly', HomeCashCacheItem[]>>;
  revenueByPeriod: Partial<Record<'weekly' | 'monthly', HomeRevenueCacheItem[]>>;
  insightByPeriod: Partial<Record<'weekly' | 'monthly', HomeInsightCacheItem | null>>;
  recentActivity: HomeActivityCacheItem[] | null;
  vatBalance: number | null;
  fetchedAt: number | null;
}

export interface AnalyticsInsightCacheItem {
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
}

export interface AnalyticsMetricTileCacheItem {
  label: string;
  value: number | string;
  change_percent?: number;
  subtitle?: string;
}

export interface AnalyticsSummaryCacheItem {
  label: string;
  value: number | string;
}

export interface AnalyticsRevenueComparisonCacheItem {
  label: string;
  value: number;
}

export interface AnalyticsSupplierAlertCacheItem {
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
}

export interface AnalyticsRevenueTrendCacheItem {
  period: 'weekly' | 'monthly';
  revenue_total: number;
  change_percent: number;
  points: { label: string; value: number }[];
}

export interface AnalyticsScreenCache {
  businessInsight: AnalyticsInsightCacheItem | null;
  metricTilesByPeriod: Partial<Record<'weekly' | 'monthly', AnalyticsMetricTileCacheItem[]>>;
  revenueTrendByPeriod: Partial<Record<'weekly' | 'monthly', AnalyticsRevenueTrendCacheItem>>;
  summaryStatsByPeriod: Partial<Record<'weekly' | 'monthly', AnalyticsSummaryCacheItem[]>>;
  revenueComparisonByPeriod: Partial<Record<'weekly' | 'monthly', AnalyticsRevenueComparisonCacheItem[]>>;
  coversActivityByPeriod: Partial<Record<'weekly' | 'monthly', AnalyticsSummaryCacheItem[]>>;
  costBreakdownByPeriod: Partial<Record<'weekly' | 'monthly', AnalyticsSummaryCacheItem[]>>;
  supplierAlertsByPeriod: Partial<Record<'weekly' | 'monthly', AnalyticsSupplierAlertCacheItem[]>>;
  fetchedAt: number | null;
}

export interface DocumentListCacheItem {
  id: string;
  document_type?: string | null;
  document_label?: string | null;
  counterparty_name?: string | null;
  supplier_name?: string | null;
  document_number?: string | null;
  invoice_number?: string | null;
  document_date?: string | null;
  invoice_date?: string | null;
  invoice_date_formatted?: string | null;
  upload_date?: string | null;
  created_at?: string | null;
  total_amount?: number | null;
  line_item_count?: number | null;
  status?: string | null;
}

export interface DocumentsBannerData {
  title: string;
  subtitle: string;
}

export interface DocumentsScreenCache {
  documents: DocumentListCacheItem[];
  bannerData: DocumentsBannerData;
  fetchedAt: number | null;
}

export interface ExpensesScreenCache {
  data: Record<string, unknown> | null;
  fetchedAt: number | null;
}

export interface NotificationsScreenCache {
  items: Array<Record<string, unknown>>;
  fetchedAt: number | null;
}

export interface DailyDataListCacheItem {
  id: string;
  record_id?: string | null;
  business_date: string;
  total_revenue: number;
  total_expenses: number;
  total_covers: number;
  avg_revenue_per_cover: number;
  method?: string | null;
  profit?: number | null;
  lunch_covers?: number | null;
  dinner_covers?: number | null;
  pos_payments?: number | null;
  cash_withdrawals?: number | null;
  cash_in?: number | null;
  cash_out?: number | null;
  cash_payments?: number | null;
  bank_transfer_payments?: number | null;
  expenses_in_cash?: number | null;
  opening_cash?: number | null;
  closing_cash?: number | null;
  notes?: string | null;
  inventory_usage?: {
    inventory_item_id: string;
    product_name: string;
    quantity_used: number;
    unit_type: string;
    unit_cost?: number;
    total_cost?: number;
  }[];
  method_sections?: {
    key: string;
    title: string;
    fields: {
      key: string;
      label: string;
      value: number | string | null;
      value_type: "currency" | "integer" | "text";
    }[];
  }[];
}

export interface DailyDataScreenCache {
  itemsBySegment: Partial<Record<'date' | 'week' | 'month', DailyDataListCacheItem[]>>;
  fetchedAtBySegment: Partial<Record<'date' | 'week' | 'month', number>>;
}

interface AppState {
  hasHydrated: boolean;
  isDarkMode: boolean;
  setHasHydrated: (value: boolean) => void;
  toggleDarkMode: () => void;
  user: User | null;
  tokens: Tokens | null;
  analyticsData: AnalyticsData | null;
  cashOverviewData: CashOverviewData | null;
  vatOverviewData: VatOverviewData | null;
  profile: Profile | null;
  profileFetchedAt: number | null;
  pendingRegistration: PendingRegistration | null;
  inventoryRefreshToken: number;
  inventoryListCache: InventoryListCacheItem[];
  inventoryListFetchedAt: number | null;
  inventoryDetailCache: Record<string, InventoryDetailCacheItem>;
  chatMessagesCache: ChatCacheMessage[];
  chatMessagesFetchedAt: number | null;
  legalDocumentCache: Record<string, LegalDocumentCacheItem>;
  homeScreenCache: HomeScreenCache;
  analyticsScreenCache: AnalyticsScreenCache;
  documentsScreenCache: DocumentsScreenCache;
  expensesScreenCache: ExpensesScreenCache;
  notificationsScreenCache: NotificationsScreenCache;
  dailyDataScreenCache: DailyDataScreenCache;
  setUser: (user: User | null, tokens?: Tokens | null) => void;
  setTokens: (tokens: Tokens | null) => void;
  setAnalyticsData: (data: AnalyticsData | null) => void;
  setCashOverviewData: (data: CashOverviewData | null) => void;
  setVatOverviewData: (data: VatOverviewData | null) => void;
  setProfile: (profile: Profile | null) => void;
  setPendingRegistration: (payload: PendingRegistration | null) => void;
  bumpInventoryRefreshToken: () => void;
  setInventoryListCache: (items: InventoryListCacheItem[]) => void;
  clearInventoryListCache: () => void;
  setInventoryDetailCacheItem: (itemId: string, payload: InventoryDetailCacheItem) => void;
  removeInventoryDetailCacheItem: (itemId: string) => void;
  clearInventoryDetailCache: () => void;
  setChatMessagesCache: (messages: ChatCacheMessage[]) => void;
  clearChatMessagesCache: () => void;
  setLegalDocumentCacheItem: (cacheKey: string, document: LegalDocumentCacheItem) => void;
  clearLegalDocumentCache: () => void;
  setHomeScreenCache: (payload: Partial<HomeScreenCache>) => void;
  clearHomeScreenCache: () => void;
  setAnalyticsScreenCache: (payload: Partial<AnalyticsScreenCache>) => void;
  clearAnalyticsScreenCache: () => void;
  setDocumentsScreenCache: (payload: DocumentsScreenCache) => void;
  clearDocumentsScreenCache: () => void;
  setExpensesScreenCache: (payload: ExpensesScreenCache) => void;
  clearExpensesScreenCache: () => void;
  setNotificationsScreenCache: (payload: NotificationsScreenCache) => void;
  clearNotificationsScreenCache: () => void;
  setDailyDataScreenCache: (payload: Partial<DailyDataScreenCache>) => void;
  clearDailyDataScreenCache: () => void;
  appLanguage: 'en' | 'it';
  appLanguageWasSet: boolean;
  setAppLanguage: (lang: 'en' | 'it') => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      isDarkMode: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      user: null,
      tokens: null,
      analyticsData: null,
      cashOverviewData: null,
      vatOverviewData: null,
      profile: null,
      profileFetchedAt: null,
      pendingRegistration: null,
      inventoryRefreshToken: 0,
      inventoryListCache: [],
      inventoryListFetchedAt: null,
      inventoryDetailCache: {},
      chatMessagesCache: [],
      chatMessagesFetchedAt: null,
      legalDocumentCache: {},
      homeScreenCache: {
        shellData: null,
        metricsByPeriod: {},
        cashByPeriod: {},
        revenueByPeriod: {},
        insightByPeriod: {},
        recentActivity: null,
        vatBalance: null,
        fetchedAt: null,
      },
      analyticsScreenCache: {
        businessInsight: null,
        metricTilesByPeriod: {},
        revenueTrendByPeriod: {},
        summaryStatsByPeriod: {},
        revenueComparisonByPeriod: {},
        coversActivityByPeriod: {},
        costBreakdownByPeriod: {},
        supplierAlertsByPeriod: {},
        fetchedAt: null,
      },
      documentsScreenCache: {
        documents: [],
        bannerData: {
          title: '',
          subtitle: '',
        },
        fetchedAt: null,
      },
      expensesScreenCache: {
        data: null,
        fetchedAt: null,
      },
      notificationsScreenCache: {
        items: [],
        fetchedAt: null,
      },
      dailyDataScreenCache: {
        itemsBySegment: {},
        fetchedAtBySegment: {},
      },
      setUser: (user, tokens = null) => set({ user, tokens }),
      setTokens: (tokens: Tokens | null) => set({ tokens }),
      setAnalyticsData: (data) => set({ analyticsData: data }),
      setCashOverviewData: (data) => set({ cashOverviewData: data }),
      setVatOverviewData: (data) => set({ vatOverviewData: data }),
      setProfile: (profile) =>
        set({
          profile,
          profileFetchedAt: profile ? Date.now() : null,
        }),
      setPendingRegistration: (payload) => set({ pendingRegistration: payload }),
      bumpInventoryRefreshToken: () => set((state) => ({ inventoryRefreshToken: state.inventoryRefreshToken + 1 })),
      setInventoryListCache: (items) =>
        set({
          inventoryListCache: items,
          inventoryListFetchedAt: Date.now(),
        }),
      clearInventoryListCache: () =>
        set({
          inventoryListCache: [],
          inventoryListFetchedAt: null,
        }),
      setInventoryDetailCacheItem: (itemId, payload) =>
        set((state) => ({
          inventoryDetailCache: {
            ...state.inventoryDetailCache,
            [itemId]: payload,
          },
        })),
      removeInventoryDetailCacheItem: (itemId) =>
        set((state) => {
          const nextCache = { ...state.inventoryDetailCache };
          delete nextCache[itemId];
          return { inventoryDetailCache: nextCache };
        }),
      clearInventoryDetailCache: () => set({ inventoryDetailCache: {} }),
      setChatMessagesCache: (messages) =>
        set({
          chatMessagesCache: messages,
          chatMessagesFetchedAt: Date.now(),
        }),
      clearChatMessagesCache: () =>
        set({
          chatMessagesCache: [],
          chatMessagesFetchedAt: null,
        }),
      setLegalDocumentCacheItem: (cacheKey, document) =>
        set((state) => ({
          legalDocumentCache: {
            ...state.legalDocumentCache,
            [cacheKey]: document,
          },
        })),
      clearLegalDocumentCache: () => set({ legalDocumentCache: {} }),
      setHomeScreenCache: (payload) =>
        set((state) => ({
          homeScreenCache: {
            ...state.homeScreenCache,
            ...payload,
          },
        })),
      clearHomeScreenCache: () =>
        set({
          homeScreenCache: {
            shellData: null,
            metricsByPeriod: {},
            cashByPeriod: {},
            revenueByPeriod: {},
            insightByPeriod: {},
            recentActivity: null,
            vatBalance: null,
            fetchedAt: null,
          },
        }),
      setAnalyticsScreenCache: (payload) =>
        set((state) => ({
          analyticsScreenCache: {
            ...state.analyticsScreenCache,
            ...payload,
          },
        })),
      clearAnalyticsScreenCache: () =>
        set({
          analyticsScreenCache: {
            businessInsight: null,
            metricTilesByPeriod: {},
            revenueTrendByPeriod: {},
            summaryStatsByPeriod: {},
            revenueComparisonByPeriod: {},
            coversActivityByPeriod: {},
            costBreakdownByPeriod: {},
            supplierAlertsByPeriod: {},
            fetchedAt: null,
          },
        }),
      setDocumentsScreenCache: (payload) => set({ documentsScreenCache: payload }),
      clearDocumentsScreenCache: () =>
        set({
          documentsScreenCache: {
            documents: [],
            bannerData: {
              title: '',
              subtitle: '',
            },
            fetchedAt: null,
          },
        }),
      setExpensesScreenCache: (payload) => set({ expensesScreenCache: payload }),
      clearExpensesScreenCache: () =>
        set({
          expensesScreenCache: {
            data: null,
            fetchedAt: null,
          },
        }),
      setNotificationsScreenCache: (payload) => set({ notificationsScreenCache: payload }),
      clearNotificationsScreenCache: () =>
        set({
          notificationsScreenCache: {
            items: [],
            fetchedAt: null,
          },
        }),
      setDailyDataScreenCache: (payload) =>
        set((state) => ({
          dailyDataScreenCache: {
            ...state.dailyDataScreenCache,
            ...payload,
          },
        })),
      clearDailyDataScreenCache: () =>
        set({
          dailyDataScreenCache: {
            itemsBySegment: {},
            fetchedAtBySegment: {},
          },
        }),
      appLanguage: DEFAULT_APP_LANGUAGE,
      appLanguageWasSet: false,
      setAppLanguage: (lang) => set({ appLanguage: lang, appLanguageWasSet: true }),
      logout: () =>
        set({
          user: null,
          tokens: null,
          analyticsData: null,
          cashOverviewData: null,
          vatOverviewData: null,
          profile: null,
          profileFetchedAt: null,
          pendingRegistration: null,
          inventoryRefreshToken: 0,
          inventoryListCache: [],
          inventoryListFetchedAt: null,
          inventoryDetailCache: {},
          chatMessagesCache: [],
          chatMessagesFetchedAt: null,
          legalDocumentCache: {},
          homeScreenCache: {
            shellData: null,
            metricsByPeriod: {},
            cashByPeriod: {},
            revenueByPeriod: {},
            insightByPeriod: {},
            recentActivity: null,
            vatBalance: null,
            fetchedAt: null,
          },
          analyticsScreenCache: {
            businessInsight: null,
            metricTilesByPeriod: {},
            revenueTrendByPeriod: {},
            summaryStatsByPeriod: {},
            revenueComparisonByPeriod: {},
            coversActivityByPeriod: {},
            costBreakdownByPeriod: {},
            supplierAlertsByPeriod: {},
            fetchedAt: null,
          },
          documentsScreenCache: {
            documents: [],
            bannerData: {
              title: '',
              subtitle: '',
            },
            fetchedAt: null,
          },
          expensesScreenCache: {
            data: null,
            fetchedAt: null,
          },
          notificationsScreenCache: {
            items: [],
            fetchedAt: null,
          },
          dailyDataScreenCache: {
            itemsBySegment: {},
            fetchedAtBySegment: {},
          },
        }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState;
        }

        const state = persistedState as Partial<AppState>;
        if (!state.appLanguageWasSet) {
          return {
            ...state,
            appLanguage: DEFAULT_APP_LANGUAGE,
            appLanguageWasSet: false,
          };
        }

        return state;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        user: state.user,
        tokens: state.tokens,
        pendingRegistration: state.pendingRegistration,
        appLanguage: state.appLanguage,
        appLanguageWasSet: state.appLanguageWasSet,
        documentsScreenCache: state.documentsScreenCache,
      }),
    },
  ),
);
