import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import Header from "../../../components/ui/Header";
import { useTranslation } from "../../../utils/i18n";

type SupportedMetricLabel = "revenue" | "expenses" | "food cost" | "profit";

const getFirstParam = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

const parseMetricLabel = (value?: string | string[]): SupportedMetricLabel => {
  const normalized = (getFirstParam(value) || "").trim().toLowerCase();

  switch (normalized) {
    case "expenses":
      return "expenses";
    case "food cost":
      return "food cost";
    case "profit":
      return "profit";
    case "revenue":
    default:
      return "revenue";
  }
};

export default function MetricDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  const metricLabel = parseMetricLabel(params.label);
  const period = getFirstParam(params.period) === "monthly" ? "monthly" : "weekly";
  const value = Number(getFirstParam(params.value) || 0);
  const changePercent = Number(getFirstParam(params.changePercent) || 0);
  const currency = getFirstParam(params.currency) || "EUR";

  const metricTitle = useMemo(() => {
    switch (metricLabel) {
      case "expenses":
        return t("expenses");
      case "food cost":
        return t("food_cost");
      case "profit":
        return t("profit");
      case "revenue":
      default:
        return t("revenue");
    }
  }, [metricLabel, t]);

  const formattedValue = useMemo(() => {
    const safeCurrency = currency === "USD" ? "USD" : "EUR";
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(Number.isFinite(value) ? value : 0);
  }, [currency, value]);

  const detailContent = useMemo(() => {
    switch (metricLabel) {
      case "expenses":
        return {
          title: t("metric_formula_expenses_title"),
          description: t("metric_formula_expenses_description"),
          bullets: [
            t("metric_formula_expenses_line_1"),
            t("metric_formula_expenses_line_2"),
            t("metric_formula_expenses_line_3"),
          ],
        };
      case "food cost":
        return {
          title: t("metric_formula_food_cost_title"),
          description: t("metric_formula_food_cost_description"),
          bullets: [
            t("metric_formula_food_cost_line_1"),
            t("metric_formula_food_cost_line_2"),
            t("metric_formula_food_cost_line_3"),
          ],
        };
      case "profit":
        return {
          title: t("metric_formula_profit_title"),
          description: t("metric_formula_profit_description"),
          bullets: [
            t("metric_formula_profit_line_1"),
            t("metric_formula_profit_line_2"),
            t("metric_formula_profit_line_3"),
          ],
        };
      case "revenue":
      default:
        return {
          title: t("metric_formula_revenue_title"),
          description: t("metric_formula_revenue_description"),
          bullets: [
            t("metric_formula_revenue_line_1"),
            t("metric_formula_revenue_line_2"),
            t("metric_formula_revenue_line_3"),
          ],
        };
    }
  }, [metricLabel, t]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerWrap,
          { paddingTop: Math.max(insets.top + verticalScale(12), verticalScale(16)) },
        ]}
      >
        <Header title={t("metric_details_title")} showBack={true} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + verticalScale(20), verticalScale(28)) },
        ]}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>{metricTitle}</Text>
          <Text style={styles.heroValue}>{formattedValue}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>{t("selected_period_label")}</Text>
              <Text style={styles.metaValue}>{period === "monthly" ? t("monthly") : t("weekly")}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>{t("change_vs_previous_label")}</Text>
              <Text
                style={[
                  styles.metaValue,
                  { color: changePercent >= 0 ? "#10B981" : "#EF4444" },
                ]}
              >
                {`${changePercent >= 0 ? "+" : "-"}${Math.abs(changePercent).toFixed(1)}%`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t("how_this_is_calculated")}</Text>
          <Text style={styles.sectionBody}>{detailContent.description}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{detailContent.title}</Text>
          {detailContent.bullets.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t("comparison_note_title")}</Text>
          <Text style={styles.sectionBody}>
            {period === "monthly" ? t("comparison_note_monthly") : t("comparison_note_weekly")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerWrap: {
    paddingHorizontal: scale(20),
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingHorizontal: scale(20),
    gap: verticalScale(16),
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(20),
    padding: scale(20),
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  heroLabel: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: verticalScale(8),
  },
  heroValue: {
    fontSize: moderateScale(28, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(16),
  },
  metaRow: {
    flexDirection: "row",
    gap: scale(12),
  },
  metaCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: scale(14),
    padding: scale(14),
  },
  metaLabel: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: verticalScale(4),
  },
  metaValue: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(18),
    padding: scale(18),
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginBottom: verticalScale(8),
  },
  sectionBody: {
    fontSize: moderateScale(13, 0.3),
    lineHeight: moderateScale(20, 0.3),
    color: "#4B5563",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: verticalScale(10),
  },
  bulletDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: "#FA8C4C",
    marginTop: verticalScale(7),
    marginRight: scale(10),
  },
  bulletText: {
    flex: 1,
    fontSize: moderateScale(13, 0.3),
    lineHeight: moderateScale(20, 0.3),
    color: "#374151",
  },
});
