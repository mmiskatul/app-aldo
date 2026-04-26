import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Header from "../../../components/ui/Header";
import { useFocusEffect } from "@react-navigation/native";
import apiClient from "../../../api/apiClient";

import ExpenseDistribution from "../../../components/home/expenses/ExpenseDistribution";
import QuickSummary from "../../../components/home/expenses/QuickSummary";
import RecentTransactions from "../../../components/home/expenses/RecentTransactions";
import { ListRouteSkeleton } from "../../../components/ui/RouteSkeletons";

export default function ExpensesScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("Today");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenseData, setExpenseData] = useState<any>(null);

  const filters = ["Today", "This Week", "This Month", "This Year"];

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/v1/restaurant/expenses");
      setExpenseData(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const getActiveData = () => {
    if (!expenseData) return null;
    
    switch (activeFilter) {
      case "Today": return expenseData.today;
      case "This Week": return expenseData.this_week;
      case "This Month": return expenseData.this_month;
      case "This Year": return expenseData.this_month; // Fallback
      default: return expenseData.today;
    }
  };

  const activeData = getActiveData();

  return (
    <View style={styles.safeArea}>
      <Header title="Expenses" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FA8C4C" />
        }
      >
        <Text style={styles.pageSubtitle}>
          Track and manage all restaurant operational costs
        </Text>

        <TouchableOpacity 
          style={styles.addExpenseButton}
          onPress={() => router.push('/(tabs)/home/add-expense')}
        >
          <Feather name="plus" size={moderateScale(20)} color="#FFFFFF" style={{ marginRight: scale(8) }} />
          <Text style={styles.addExpenseButtonText}>Add Expense</Text>
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
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading && !refreshing ? (
          <ListRouteSkeleton withAction={false} itemCount={3} />
        ) : expenseData ? (
          <>
            <QuickSummary 
              todayTotal={expenseData.today?.total || 0}
              weeklyTotal={expenseData.this_week?.total || 0}
              monthlyTotal={expenseData.this_month?.total || 0}
              topCategory={activeData?.top_category || "N/A"}
            />
            <ExpenseDistribution distribution={activeData?.distribution || []} />
            <RecentTransactions items={activeData?.items || []} />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No data available</Text>
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
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
  },
  pageSubtitle: {
    fontSize: moderateScale(14, 0.3),
    color: "#4B5563",
    marginBottom: verticalScale(20),
  },
  addExpenseButton: {
    flexDirection: "row",
    backgroundColor: "#FA8C4C",
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  addExpenseButtonText: {
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
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    marginRight: scale(8),
    height: verticalScale(36),
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#FA8C4C',
    borderColor: '#FA8C4C',
  },
  filterText: {
    color: '#6B7280',
    fontSize: moderateScale(13, 0.3),
    fontWeight: "500",
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: verticalScale(100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: '#9CA3AF',
  },
});
