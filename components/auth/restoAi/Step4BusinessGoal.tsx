import { Feather } from "@expo/vector-icons";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const BUSINESS_GOALS = [
  "Increase revenue",
  "Reduce costs",
  "Optimize staff efficiency",
  "Improve customer experience",
  "Improve profit margins",
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
  const toggleGoal = (goal: string) => {
    if (businessGoals.includes(goal)) {
      setBusinessGoals(businessGoals.filter((selectedGoal) => selectedGoal !== goal));
      return;
    }

    setBusinessGoals([...businessGoals, goal]);
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>What is your main business goal?</Text>
      <Text style={styles.subtitle}>
        This helps Risto AI provide better recommendations tailored to your
        success.
      </Text>

      <View style={styles.radioListContainer}>
        {BUSINESS_GOALS.map((goal, index) => {
          const isSelected = businessGoals.includes(goal);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.radioRow,
                isSelected ? styles.radioRowSelected : null,
              ]}
              onPress={() => toggleGoal(goal)}
              activeOpacity={0.8}
            >
              <Text style={styles.radioText}>{goal}</Text>
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
        <Text style={styles.continueButtonText}>Continue</Text>
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
