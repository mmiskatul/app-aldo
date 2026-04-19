import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  restaurant_name: string;
  [key: string]: any; // Allow other fields from the API
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AnalyticsData {
  insight_banner: {
    title: string;
    subtitle: string;
  };
  revenue_total: number;
  revenue_change_percent: number;
  weekly_revenue: Array<{ label: string; value: number }>;
  metric_tiles: Array<{
    label: string;
    value: any;
    change_percent?: number;
    subtitle?: string;
  }>;
  summary_stats: Array<{ label: string; value: any }>;
  revenue_comparison: Array<{ label: string; value: number }>;
  covers_total: number;
  covers_activity: Array<{ label: string; value: number }>;
  avg_revenue_per_cover: number;
  cost_breakdown: Array<{ label: string; value: number }>;
  supplier_price_alerts: any[];
}

export interface CashOverviewData {
  active_period: string;
  periods: {
    [key: string]: {
      summary: {
        total_collected: number;
        cash_available: number;
        withdrawals_total: number;
        bank_deposits_total: number;
      };
      status: {
        total_collected: string;
        cash_available: string;
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
  filing_deadline: string;
  report_ready: boolean;
}

interface AppState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
  tokens: Tokens | null;
  analyticsData: AnalyticsData | null;
  cashOverviewData: CashOverviewData | null;
  vatOverviewData: VatOverviewData | null;
  setUser: (user: User | null, tokens?: Tokens | null) => void;
  setTokens: (tokens: Tokens | null) => void;
  setAnalyticsData: (data: AnalyticsData | null) => void;
  setCashOverviewData: (data: CashOverviewData | null) => void;
  setVatOverviewData: (data: VatOverviewData | null) => void;
  appLanguage: 'en' | 'it';
  setAppLanguage: (lang: 'en' | 'it') => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      user: null,
      tokens: null,
      analyticsData: null,
      cashOverviewData: null,
      vatOverviewData: null,
      setUser: (user, tokens = null) => set({ user, tokens }),
      setTokens: (tokens: Tokens | null) => set({ tokens }),
      setAnalyticsData: (data) => set({ analyticsData: data }),
      setCashOverviewData: (data) => set({ cashOverviewData: data }),
      setVatOverviewData: (data) => set({ vatOverviewData: data }),
      appLanguage: 'en',
      setAppLanguage: (lang) => set({ appLanguage: lang }),
      logout: () =>
        set({
          user: null,
          tokens: null,
          analyticsData: null,
          cashOverviewData: null,
          vatOverviewData: null,
        }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
