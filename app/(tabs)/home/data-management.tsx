import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Header from "../../../components/ui/Header";
import DataHistoryList, {
  DataHistoryEntry,
  DataHistorySegment,
} from "../../../components/home/data-management/DataHistoryList";
import DataMetrics from "../../../components/home/data-management/DataMetrics";
import apiClient from "../../../api/apiClient";
import { showErrorMessage, showInfoMessage, showSuccessMessage } from "../../../utils/feedback";
import { useTranslation } from "../../../utils/i18n";
import { useAppStore } from "../../../store/useAppStore";

interface DailyDataListItem {
  id: string;
  record_id?: string | null;
  business_date: string;
  total_revenue: number;
  total_expenses: number;
  total_covers: number;
  avg_revenue_per_cover: number;
}

interface DailyDataListResponse {
  items: DailyDataListItem[];
}

const DAILY_DATA_CACHE_TTL_MS = 60 * 1000;

const isDailyDataCacheFresh = (timestamp?: number) =>
  typeof timestamp === "number" && Date.now() - timestamp < DAILY_DATA_CACHE_TTL_MS;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const formatBusinessDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const labelForSegment = (segment: DataHistorySegment, value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return segment.toUpperCase();
  }

  if (segment === "date") {
    return parsed.toLocaleDateString("en-GB", { weekday: "long" }).toUpperCase();
  }

  if (segment === "week") {
    return `WEEK OF ${parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase()}`;
  }

  return parsed.toLocaleDateString("en-GB", { month: "long", year: "numeric" }).toUpperCase();
};

export default function DataManagementScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const clearHomeScreenCache = useAppStore((state) => state.clearHomeScreenCache);
  const setCashOverviewData = useAppStore((state) => state.setCashOverviewData);
  const dailyDataScreenCache = useAppStore((state) => state.dailyDataScreenCache);
  const setDailyDataScreenCache = useAppStore((state) => state.setDailyDataScreenCache);
  const clearDailyDataScreenCache = useAppStore((state) => state.clearDailyDataScreenCache);
  const [selectedSegment, setSelectedSegment] = useState<DataHistorySegment>("date");
  const initialDateItems = dailyDataScreenCache.itemsBySegment.date || [];
  const initialDateFetchedAt = dailyDataScreenCache.fetchedAtBySegment.date;
  const [items, setItems] = useState<DailyDataListItem[]>(initialDateItems);
  const [loading, setLoading] = useState(
    typeof initialDateFetchedAt !== "number" && initialDateItems.length === 0,
  );
  const [refreshing, setRefreshing] = useState(false);

  const fetchDailyData = useCallback(async (segment: DataHistorySegment, silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const response = await apiClient.get<DailyDataListResponse>("/api/v1/restaurant/daily-data", {
        params: {
          page: 1,
          page_size: 60,
          view: segment,
        },
      });
      const nextItems = response.data.items || [];
      setItems(nextItems);
      const currentCache = useAppStore.getState().dailyDataScreenCache;
      setDailyDataScreenCache({
        itemsBySegment: {
          ...currentCache.itemsBySegment,
          [segment]: nextItems,
        },
        fetchedAtBySegment: {
          ...currentCache.fetchedAtBySegment,
          [segment]: Date.now(),
        },
      });
    } catch (error: any) {
      console.error("Error fetching daily data:", error.response?.data || error.message);
      setItems([]);
      const currentCache = useAppStore.getState().dailyDataScreenCache;
      setDailyDataScreenCache({
        itemsBySegment: {
          ...currentCache.itemsBySegment,
          [segment]: [],
        },
        fetchedAtBySegment: {
          ...currentCache.fetchedAtBySegment,
          [segment]: Date.now(),
        },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setDailyDataScreenCache]);

  useEffect(() => {
    const cachedItems = dailyDataScreenCache.itemsBySegment[selectedSegment] || [];
    const cacheTimestamp = dailyDataScreenCache.fetchedAtBySegment[selectedSegment];
    const hasCachedResult = typeof cacheTimestamp === "number";

    if (hasCachedResult) {
      setItems(cachedItems);
      setLoading(false);
      if (!isDailyDataCacheFresh(cacheTimestamp)) {
        void fetchDailyData(selectedSegment, true);
      }
      return;
    }

    setItems([]);
    void fetchDailyData(selectedSegment);
  }, [dailyDataScreenCache.fetchedAtBySegment, dailyDataScreenCache.itemsBySegment, fetchDailyData, selectedSegment]);

  const handleDelete = useCallback(async (deleteTarget: string) => {
    const separatorIndex = deleteTarget.indexOf(":");
    const deleteMode = separatorIndex > -1 ? deleteTarget.slice(0, separatorIndex) : "date";
    const deleteId = separatorIndex > -1 ? deleteTarget.slice(separatorIndex + 1) : deleteTarget;

    try {
      showInfoMessage(deleteMode === "record" ? "Deleting daily data record..." : "Deleting collected data for this date...");
      if (deleteMode === "record") {
        await apiClient.delete(`/api/v1/restaurant/daily-data/${deleteId}`);
        showSuccessMessage("Daily data record deleted.");
      } else {
        await apiClient.delete("/api/v1/restaurant/daily-data/by-date", {
          params: { business_date: deleteId },
        });
        showSuccessMessage("Collected data deleted for this date.");
      }
      clearHomeScreenCache();
      clearDailyDataScreenCache();
      setCashOverviewData(null);
      void fetchDailyData(selectedSegment, true);
    } catch (error: any) {
      console.error("Error deleting daily data collection:", error.response?.data || error.message);
      showErrorMessage(deleteMode === "record" ? "Failed to delete daily data record." : "Failed to delete collected data for this date.");
    }
  }, [clearDailyDataScreenCache, clearHomeScreenCache, fetchDailyData, selectedSegment, setCashOverviewData]);

  const metrics = useMemo(() => {
    const totalRevenue = items.reduce((sum, item) => sum + Number(item.total_revenue || 0), 0);
    const totalExpenses = items.reduce((sum, item) => sum + Number(item.total_expenses || 0), 0);
    const totalCovers = items.reduce((sum, item) => sum + Number(item.total_covers || 0), 0);
    const totalProfit = totalRevenue - totalExpenses;
    const averagePerCover = totalCovers > 0 ? totalRevenue / totalCovers : 0;

    return {
      revenue: formatCurrency(totalRevenue),
      expenses: formatCurrency(totalExpenses),
      profit: formatCurrency(totalProfit),
      covers: totalCovers.toLocaleString(),
      averagePerCover: formatCurrency(averagePerCover),
    };
  }, [items]);

  const historyItems: DataHistoryEntry[] = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        recordId: item.record_id ?? null,
        deleteId: item.record_id ?? item.business_date,
        deleteMode: item.record_id ? "record" : "date",
        label: labelForSegment(selectedSegment, item.business_date),
        date: formatBusinessDate(item.business_date),
        referenceDate: item.business_date,
        revenue: formatCurrency(Number(item.total_revenue || 0)),
        covers: Number(item.total_covers || 0).toLocaleString(),
        average: formatCurrency(Number(item.avg_revenue_per_cover || 0)),
        canDelete: selectedSegment === "date",
      })),
    [items, selectedSegment],
  );

  return (
    <View style={styles.safeArea}>
      <Header title={t("daily_data_dashboard")} showBack={true} showBell={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void fetchDailyData(selectedSegment, true);
            }}
            colors={["#FA8C4C"]}
          />
        }
      >
        <Text style={styles.pageTitle}>{t("daily_data_dashboard")}</Text>
        <Text style={styles.pageSubtitle}>
          Track and manage your restaurant performance
        </Text>

        <DataMetrics
          loading={loading}
          revenue={metrics.revenue}
          expenses={metrics.expenses}
          profit={metrics.profit}
          covers={metrics.covers}
          averagePerCover={metrics.averagePerCover}
        />
        <DataHistoryList
          items={historyItems}
          loading={loading}
          selectedSegment={selectedSegment}
          onSegmentChange={setSelectedSegment}
          onDelete={handleDelete}
          onDeleteUnavailable={() => showInfoMessage("Only date cards can be deleted from this dashboard.")}
        />
      </ScrollView>

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/(tabs)/home/add-daily-data")}
        >
          <Feather
            name="edit-3"
            size={moderateScale(18)}
            color="#FFFFFF"
            style={{ marginRight: scale(6) }}
          />
          <Text style={styles.fabText}>Add Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(150),
  },
  pageTitle: {
    fontSize: moderateScale(22, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(4),
  },
  pageSubtitle: {
    fontSize: moderateScale(12, 0.3),
    color: "#6B7280",
    marginBottom: verticalScale(24),
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: verticalScale(96),
    right: scale(20),
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FA8C4C",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(14),
    borderRadius: scale(12),
    shadowColor: "#FA8C4C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
