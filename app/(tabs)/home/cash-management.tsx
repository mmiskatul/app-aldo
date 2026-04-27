import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
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
import { useAppStore } from "../../../store/useAppStore";

import CashMetrics from "../../../components/home/cash/CashMetrics";
import RecentDeposits from "../../../components/home/cash/RecentDeposits";

interface HomeCashItem {
  label: string;
  amount: number;
  subtitle: string;
}

interface HomeCashDataResponse {
  available_periods?: string[];
  weekly?: {
    cash_management?: HomeCashItem[];
  };
  monthly?: {
    cash_management?: HomeCashItem[];
  };
  recent_activity?: Array<{
    kind?: string;
    title?: string;
    subtitle?: string;
    timestamp?: string;
  }>;
}

type CashSummary = {
  total_collected: number;
  cash_available: number;
  withdrawals_total: number;
  bank_deposits: number;
  bank_deposits_total?: number;
};

export default function CashManagementScreen() {
  const router = useRouter();

  const cashOverviewData = useAppStore((state) => state.cashOverviewData);
  const setCashOverviewData = useAppStore((state) => state.setCashOverviewData);

  const [activeFilter, setActiveFilter] = useState("Today");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [homeCashData, setHomeCashData] = useState<HomeCashDataResponse | null>(null);

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

  const fetchCashOverview = useCallback(async () => {
    try {
      const [cashOverviewRes, homeRes] = await Promise.all([
        apiClient.get("/api/v1/restaurant/cash/overview"),
        apiClient.get("/api/v1/restaurant/home"),
      ]);

      setCashOverviewData(cashOverviewRes.data);
      setHomeCashData(homeRes.data);
    } catch (error) {
      console.error("Error fetching cash overview:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setCashOverviewData]);

  useEffect(() => {
    fetchCashOverview();
  }, [fetchCashOverview]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCashOverview();
  }, [fetchCashOverview]);

  const periodKey = filterToPeriodKey(activeFilter);
  const currentData = cashOverviewData?.periods?.[periodKey];
  const homePeriodKey = activeFilter === "This Month" ? "monthly" : "weekly";
  const homeCashManagementData = homeCashData?.[homePeriodKey]?.cash_management;
  const hasScreenData = Boolean(currentData && homeCashData);

  const currentSummary: CashSummary | null = currentData?.summary
    ? {
        ...currentData.summary,
        total_collected:
          homeCashManagementData?.find((item) => item.label.toLowerCase() === "total cash collected")?.amount ??
          currentData.summary.total_collected,
        cash_available:
          homeCashManagementData?.find((item) => item.label.toLowerCase() === "cash available")?.amount ??
          currentData.summary.cash_available,
        bank_deposits:
          homeCashManagementData?.find((item) => item.label.toLowerCase() === "cash deposited")?.amount ??
          (currentData.summary as any).bank_deposits ??
          (currentData.summary as any).bank_deposits_total ??
          0,
      }
    : null;

  const recentTransactions = homeCashData?.recent_activity?.length
    ? homeCashData.recent_activity.map((item, index) => ({
        id: `${item.kind || "activity"}-${item.timestamp || index}-${index}`,
        display_title: item.title || "Transaction",
        deposit_date_formatted: item.subtitle || item.timestamp || "",
        amount_formatted: "",
        amount: item.kind === "expense" ? -1 : 1,
      }))
    : currentData?.recent_deposits;

  return (
    <View style={styles.safeArea}>
      <Header title="Cash Management" showBack={true} />

      {loading && !hasScreenData ? (
        <ListRouteSkeleton itemCount={3} />
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
            Track and manage your restaurant's physical cash flow and bank
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
              <CashMetrics
                summary={
                  currentSummary ?? {
                    ...currentData.summary,
                    bank_deposits:
                      (currentData.summary as any).bank_deposits ??
                      (currentData.summary as any).bank_deposits_total ??
                      0,
                  }
                }
                status={currentData.status}
              />
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
});
