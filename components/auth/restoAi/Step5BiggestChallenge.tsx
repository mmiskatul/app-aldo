import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

interface Step5Props {
  biggestProblem: string;
  setBiggestProblem: (val: string) => void;
  improvementGoal: string;
  setImprovementGoal: (val: string) => void;
  onNext: () => void;
}

export default function Step5BiggestChallenge({
  biggestProblem,
  setBiggestProblem,
  improvementGoal,
  setImprovementGoal,
  onNext,
}: Step5Props) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Tell us about your biggest challenge.</Text>
      <Text style={styles.subtitle}>
        Risto AI will use this information to personalize insights and suggestions.
      </Text>

      <Text style={styles.inputLabel}>Biggest problem you currently face</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="Describe your current restaurant challenges..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          value={biggestProblem}
          onChangeText={setBiggestProblem}
          textAlignVertical="top"
        />
      </View>

      <Text style={styles.inputLabel}>What would you like to improve the most</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="E.g. Table turnover, food waste, staff scheduling..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          value={improvementGoal}
          onChangeText={setImprovementGoal}
          textAlignVertical="top"
        />
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
  inputLabel: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginBottom: verticalScale(8),
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(12),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    marginBottom: verticalScale(24),
    minHeight: verticalScale(120),
  },
  textArea: {
    flex: 1,
    fontSize: moderateScale(15, 0.3),
    color: "#111827",
  },
});
