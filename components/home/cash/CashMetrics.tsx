import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

interface CashMetricsProps {
  summary: {
    total_collected: number;
    cash_available: number;
    withdrawals_total: number;
    bank_deposits: number;
  };
  status: {
    total_collected: string;
    cash_available: string;
    withdrawals: string;
    bank_deposits: string;
  };
}

const formatCurrency = (value: number | string | null | undefined) => {
  if (value === undefined || value === null) {
    return "\u20AC0.00";
  }

  const normalizedValue =
    typeof value === "string"
      ? value.replace(/,/g, "").replace("$", "").replace("\u20AC", "")
      : value;

  const amount = Number(normalizedValue);
  return `\u20AC${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}`;
};

export default function CashMetrics({ summary, status }: CashMetricsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Collection</Text>
          <Text style={styles.cardValue}>{formatCurrency(summary.total_collected)}</Text>
          <Text style={styles.tagGreen}>{status.total_collected}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cash Available</Text>
          <Text style={styles.cardValue}>{formatCurrency(summary.cash_available)}</Text>
          <Text style={styles.tagOrange}>{status.cash_available}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Withdrawals</Text>
          <Text style={styles.cardValue}>{formatCurrency(summary.withdrawals_total)}</Text>
          <Text style={styles.tagGrey}>{status.withdrawals}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cash Deposit</Text>
          <Text style={styles.cardValue}>{formatCurrency(summary.bank_deposits)}</Text>
          <Text style={styles.tagGrey}>{status.bank_deposits}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: scale(12),
    marginBottom: verticalScale(24),
  },
  row: {
    flexDirection: "row",
    gap: scale(12),
    marginBottom: verticalScale(12),
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: {
    fontSize: moderateScale(12, 0.3),
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: verticalScale(8),
  },
  cardValue: {
    fontSize: moderateScale(20, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(12),
  },
  tagGreen: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: "800",
    color: "#10B981",
    letterSpacing: 0.5,
  },
  tagOrange: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: "800",
    color: "#FA8C4C",
    letterSpacing: 0.5,
  },
  tagGrey: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },
});
