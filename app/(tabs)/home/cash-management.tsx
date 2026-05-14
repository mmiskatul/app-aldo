import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import apiClient from "../../../api/apiClient";
import Header from "../../../components/ui/Header";
import { ListRouteSkeleton } from "../../../components/ui/RouteSkeletons";
import StateCard from "../../../components/ui/StateCard";
import { useCachedFocusRefresh } from "../../../hooks/useCachedFocusRefresh";
import { useAppStore } from "../../../store/useAppStore";
import { getApiDisplayMessage, logApiError } from "../../../utils/apiErrors";
import { normalizeCashOverviewData } from "../../../utils/restaurantData";

import CashMetrics from "../../../components/home/cash/CashMetrics";
import RecentDeposits from "../../../components/home/cash/RecentDeposits";

type CashSummary = {
  total_collected: number;
  cash_available: number;
  pos_payments: number;
  withdrawals_total: number;
  bank_deposits: number;
  bank_deposits_total?: number;
};

const CASH_OVERVIEW_CACHE_TTL_MS = 60 * 1000;

const normalizeCashSummary = (summary?: Partial<CashSummary> | null): CashSummary | null => {
  if (!summary) {
    return null;
  }

  const posPayments = Number(summary.pos_payments ?? 0);
  const cashAvailable = Number(summary.cash_available ?? 0);
  const bankDeposits = Number(summary.bank_deposits ?? summary.bank_deposits_total ?? 0);
  const withdrawalsTotal = Number(summary.withdrawals_total ?? 0);
  const totalCollected = Number(summary.total_collected ?? cashAvailable + posPayments + bankDeposits);

  return {
    total_collected: totalCollected,
    cash_available: cashAvailable,
    pos_payments: posPayments,
    withdrawals_total: withdrawalsTotal,
    bank_deposits: bankDeposits,
    bank_deposits_total: Number(summary.bank_deposits_total ?? bankDeposits),
  };
};

export default function CashManagementScreen() {
  const router = useRouter();

  const cashOverviewData = useAppStore((state) => state.cashOverviewData);
  const setCashOverviewData = useAppStore((state) => state.setCashOverviewData);

  const [activeFilter, setActiveFilter] = useState("Today");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(!cashOverviewData?.periods?.today);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const filters = ["Today", "This Week", "This Month"];

  const filterToPeriodKey = (filter: string) => {
    switch (filter) {
      case "Today":
        return "today";
      case "This Week":
        return "this_week";
      case "This Month":
        return "this_month";
      default:
        return "today";
    }
  };

  const fetchCashOverview = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
    }
    try {
      const cashOverviewRes = await apiClient.get("/api/v1/restaurant/cash/overview");
      setCashOverviewData({
        ...normalizeCashOverviewData(cashOverviewRes.data),
        fetched_at: Date.now(),
      });
      setError(null);
    } catch (error) {
      logApiError("cash.overview", error);
      setError(getApiDisplayMessage(error, "Unable to load cash overview."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setCashOverviewData]);

  useEffect(() => {
    if (!cashOverviewData?.periods?.today) {
      void fetchCashOverview();
      return;
    }
    setLoading(false);
  }, [cashOverviewData?.periods?.today, fetchCashOverview]);

  useCachedFocusRefresh({
    hasCache: Boolean(cashOverviewData?.periods?.today),
    fetchedAt: cashOverviewData?.fetched_at ?? null,
    ttlMs: CASH_OVERVIEW_CACHE_TTL_MS,
    loadOnEmpty: () => {
      void fetchCashOverview();
    },
    refreshStale: () => {
      void fetchCashOverview({ silent: true });
    },
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchCashOverview({ silent: true });
  }, [fetchCashOverview]);

  const periodKey = filterToPeriodKey(activeFilter);
  const currentData = cashOverviewData?.periods?.[periodKey];
  const hasScreenData = Boolean(currentData);

  const currentSummary = normalizeCashSummary(currentData?.summary);

  const recentTransactions = currentData?.recent_deposits;

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    try {
      await fetchCashOverview();
    } finally {
      setRetrying(false);
    }
  }, [fetchCashOverview]);

  return (
    <View style={styles.safeArea}>
      <Header title="Cash Management" showBack={true} fallbackHref="/(tabs)/home" />

      {loading && !hasScreenData ? (
        <ListRouteSkeleton itemCount={3} />
      ) : error && !hasScreenData ? (
        <View style={styles.stateCardWrap}>
          <StateCard
            title="Unable to load cash overview"
            description={error}
            tone="error"
            actionLabel="Try Again"
            actionLoading={retrying}
            onAction={() => void handleRetry()}
          />
        </View>
      ) : !hasScreenData ? (
        <View style={styles.stateCardWrap}>
          <StateCard
            title="No cash data yet"
            description="Add a bank deposit or upload more daily data to start tracking cash activity here."
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FA8C4C"]}
            />
          }
        >
          <Text style={styles.pageSubtitle}>
            Track and manage your restaurant&apos;s physical cash flow and bank
            deposits.
          </Text>

          <TouchableOpacity
            style={styles.addDepositButton}
            onPress={() => router.push("/(tabs)/home/add-bank-deposit")}
          >
            <Feather
              name="plus"
              size={moderateScale(20)}
              color="#FFFFFF"
              style={{ marginRight: scale(8) }}
            />
            <Text style={styles.addDepositButtonText}>Add Bank Deposit</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterPill,
                    isActive && styles.filterPillActive,
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.filterTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {currentData && (
            <>
              {currentSummary ? <CashMetrics summary={currentSummary} status={currentData.status} /> : null}
              <RecentDeposits deposits={recentTransactions} />
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(16),
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
  },
  pageSubtitle: {
    fontSize: moderateScale(14, 0.3),
    color: "#6B7280",
    marginBottom: verticalScale(20),
    lineHeight: moderateScale(20),
  },
  addDepositButton: {
    flexDirection: "row",
    backgroundColor: "#FA8C4C",
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  addDepositButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16, 0.3),
    fontWeight: "600",
  },
  filtersContainer: {
    flexDirection: "row",
    marginBottom: verticalScale(24),
  },
  filterPill: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    marginRight: scale(8),
  },
  filterPillActive: {
    backgroundColor: "#FA8C4C",
    borderColor: "#FA8C4C",
  },
  filterText: {
    color: "#6B7280",
    fontSize: moderateScale(13, 0.3),
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  stateCardWrap: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
  },
});
