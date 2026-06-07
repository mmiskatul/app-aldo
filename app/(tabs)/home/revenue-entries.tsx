import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
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

type RevenueEntry = {
  id: string;
  title: string;
  amount: number;
  revenue_date: string;
  created_at: string;
};

type RevenueEntryListResponse = {
  items: RevenueEntry[];
};

const formatShortDate = (value?: string) => {
  if (!value) {
    return "N/A";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export default function RevenueEntriesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRevenueEntries = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    try {
      const response = await apiClient.get<RevenueEntryListResponse>("/api/v1/restaurant/revenue-entries");
      setItems(response.data.items || []);
    } catch (error: any) {
      console.error("Error loading revenue entries:", error?.response?.data || error?.message || error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadRevenueEntries(true);
    }, [loadRevenueEntries]),
  );

  return (
    <View style={styles.safeArea}>
      <Header title="Revenue Entries" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadRevenueEntries(false);
            }}
            colors={["#FA8C4C"]}
          />
        }
      >
        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/(tabs)/home/add-revenue")}>
          <Feather name="plus" size={moderateScale(18)} color="#FFFFFF" style={styles.addButtonIcon} />
          <Text style={styles.addButtonText}>Add Revenue</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#FA8C4C" />
          </View>
        ) : items.length > 0 ? (
          items.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.meta}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.date}>{formatShortDate(item.revenue_date)}</Text>
              </View>
              <Text style={styles.amount}>
                €{Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No revenue entries yet</Text>
            <Text style={styles.emptySubtitle}>Add direct revenue from here and it will appear on home and cash management.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(28),
    gap: verticalScale(12),
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FA8C4C",
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
  },
  addButtonIcon: {
    marginRight: scale(8),
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15, 0.3),
    fontWeight: "700",
  },
  loadingWrap: {
    paddingVertical: verticalScale(32),
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: scale(14),
  },
  meta: {
    flex: 1,
    marginRight: scale(12),
  },
  title: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  date: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(12, 0.3),
    color: "#6B7280",
  },
  amount: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#16A34A",
  },
  emptyState: {
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    padding: scale(18),
  },
  emptyTitle: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  emptySubtitle: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(12, 0.3),
    color: "#6B7280",
    lineHeight: moderateScale(18, 0.3),
  },
});
