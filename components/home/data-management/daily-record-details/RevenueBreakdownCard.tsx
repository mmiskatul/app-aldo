import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";

interface RevenueBreakdownItem {
  label: string;
  amount: number;
}

interface RevenueBreakdownCardProps {
  items: RevenueBreakdownItem[];
}

const DOT_COLORS = ["#A16207", "#475569", "#D4A373", "#FA8C4C"];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export default function RevenueBreakdownCard({ items }: RevenueBreakdownCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather
          name="credit-card"
          size={moderateScale(18)}
          color="#A16207"
          style={styles.icon}
        />
        <Text style={styles.title}>Revenue Breakdown</Text>
      </View>

      {items.map((item, index) => (
        <View
          key={`${item.label}-${index}`}
          style={[styles.row, index === items.length - 1 ? styles.lastRow : null]}
        >
          <View style={styles.labelGroup}>
            <View
              style={[
                styles.dot,
                { backgroundColor: DOT_COLORS[index % DOT_COLORS.length] },
              ]}
            />
            <Text style={styles.label}>{item.label}</Text>
          </View>
          <Text style={styles.value}>{formatCurrency(item.amount)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  icon: {
    marginRight: scale(8),
  },
  title: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  lastRow: {
    marginBottom: 0,
  },
  labelGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    marginRight: scale(12),
  },
  label: {
    flex: 1,
    fontSize: moderateScale(14, 0.3),
    color: "#374151",
    fontWeight: "500",
  },
  value: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
});
