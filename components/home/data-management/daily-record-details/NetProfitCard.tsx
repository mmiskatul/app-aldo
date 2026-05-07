import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "../../../../utils/i18n";

interface NetProfitCardProps {
  profit: string;
  revenue: string;
  expenses: string;
}

export default function NetProfitCard({ profit, revenue, expenses }: NetProfitCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.netProfitLabel}>{t("net_profit")}</Text>
      <Text style={styles.netProfitValue}>{profit}</Text>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.subLabel}>{t("revenue")}</Text>
          <Text style={styles.subValue}>{revenue}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.subLabel}>{t("expenses")}</Text>
          <Text style={styles.subValue}>{expenses}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#AD7B09",
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(16),
    shadowColor: "#AD7B09",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  netProfitLabel: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: "700",
    color: "#FDE68A",
    letterSpacing: 1,
    marginBottom: verticalScale(8),
  },
  netProfitValue: {
    fontSize: moderateScale(40, 0.3),
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: verticalScale(16),
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: verticalScale(16),
  },
  row: {
    flexDirection: "row",
  },
  col: {
    flex: 1,
  },
  subLabel: {
    fontSize: moderateScale(11, 0.3),
    color: "#FDE68A",
    marginBottom: verticalScale(4),
  },
  subValue: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
