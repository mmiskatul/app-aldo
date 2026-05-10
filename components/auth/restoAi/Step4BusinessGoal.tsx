import { Feather } from "@expo/vector-icons";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "../../../utils/i18n";

const BUSINESS_GOALS = [
  { value: "Increase revenue", labelKey: "onboarding_goal_increase_revenue" },
  { value: "Reduce costs", labelKey: "onboarding_goal_reduce_costs" },
  { value: "Optimize staff efficiency", labelKey: "onboarding_goal_optimize_staff_efficiency" },
  { value: "Improve customer experience", labelKey: "onboarding_goal_improve_customer_experience" },
  { value: "Improve profit margins", labelKey: "onboarding_goal_improve_profit_margins" },
];

interface Step4Props {
  businessGoals: string[];
  setBusinessGoals: (val: string[]) => void;
  onNext: () => void;
}

export default function Step4BusinessGoal({
  businessGoals,
  setBusinessGoals,
  onNext,
}: Step4Props) {
  const { t } = useTranslation();

  const toggleGoal = (goal: string) => {
    if (businessGoals.includes(goal)) {
      setBusinessGoals(businessGoals.filter((selectedGoal) => selectedGoal !== goal));
      return;
    }

    setBusinessGoals([...businessGoals, goal]);
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>{t("onboarding_goal_title")}</Text>
      <Text style={styles.subtitle}>
        {t("onboarding_goal_subtitle")}
      </Text>

      <View style={styles.radioListContainer}>
        {BUSINESS_GOALS.map((goal, index) => {
          const isSelected = businessGoals.includes(goal.value);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.radioRow,
                isSelected ? styles.radioRowSelected : null,
              ]}
              onPress={() => toggleGoal(goal.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.radioText}>{t(goal.labelKey as any)}</Text>
              <View
                style={[
                  styles.radioOuter,
                  isSelected ? styles.radioOuterSelected : null,
                ]}
              >
                {isSelected ? (
                  <Feather name="check" size={moderateScale(14)} color="#FFFFFF" />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity style={styles.continueButton} onPress={onNext}>
        <Text style={styles.continueButtonText}>{t("continue")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: { flex: 1 },
  title: {
    fontSize: moderateScale(28, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(34, 0.3),
  },
  subtitle: {
    fontSize: moderateScale(15, 0.3),
    color: "#4B5563",
    lineHeight: moderateScale(24, 0.3),
    marginBottom: verticalScale(30),
  },
  spacer: { flex: 1, minHeight: verticalScale(30) },
  continueButton: {
    flexDirection: "row",
    backgroundColor: "#FA8C4C",
    height: verticalScale(56),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  continueButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  radioListContainer: {
    flex: 1,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(12),
    paddingHorizontal: scale(20),
    height: verticalScale(56),
    marginBottom: verticalScale(16),
    backgroundColor: "#FFFFFF",
  },
  radioRowSelected: {
    borderColor: "#FA8C4C",
  },
  radioText: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: "600",
    color: "#111827",
  },
  radioOuter: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(6),
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#FA8C4C",
    backgroundColor: "#FA8C4C",
  },
});
