import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Header from "../../../components/ui/Header";

import ExpenseDistribution from "../../../components/home/expenses/ExpenseDistribution";
import QuickSummary from "../../../components/home/expenses/QuickSummary";
import RecentTransactions from "../../../components/home/expenses/RecentTransactions";

export default function ExpensesScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("Today");

  const filters = ["Today", "This Week", "This Month", "This Year"];
  
  return (
    <View style={styles.safeArea}>
      <Header title="Expenses" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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

        <QuickSummary />
        <ExpenseDistribution />
        <RecentTransactions />
      </ScrollView>
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
});
