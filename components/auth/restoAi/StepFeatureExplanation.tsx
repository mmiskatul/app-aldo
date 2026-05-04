import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useTranslation } from "../../../utils/i18n";

interface StepFeatureExplanationProps {
  icon: keyof typeof Feather.glyphMap;
  titleKey?: string;
  descriptionKey?: string;
  pointKeys?: string[];
  title?: string;
  description?: string;
  points?: string[];
  onNext: () => void;
  isLast?: boolean;
  loading?: boolean;
}

export default function StepFeatureExplanation({
  icon,
  titleKey,
  descriptionKey,
  pointKeys,
  title,
  description,
  points,
  onNext,
  isLast = false,
  loading = false,
}: StepFeatureExplanationProps) {
  const { t } = useTranslation();
  const resolvedTitle = title || (titleKey ? t(titleKey as any) : "");
  const resolvedDescription = description || (descriptionKey ? t(descriptionKey as any) : "");
  const resolvedPoints = points || (pointKeys || []).map((pointKey) => t(pointKey as any));

  return (
    <View style={styles.stepContainer}>
      <View style={styles.iconWrap}>
        <Feather name={icon} size={moderateScale(34)} color="#FA8C4C" />
      </View>

      <Text style={styles.title}>{resolvedTitle}</Text>
      <Text style={styles.subtitle}>{resolvedDescription}</Text>

      <View style={styles.pointsContainer}>
        {resolvedPoints.map((point) => (
          <View key={point} style={styles.pointRow}>
            <View style={styles.pointIcon}>
              <Feather name="check" size={moderateScale(13)} color="#FA8C4C" />
            </View>
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={[styles.continueButton, loading ? styles.continueButtonDisabled : null]}
        onPress={onNext}
        disabled={loading}
      >
        <Text style={styles.continueButtonText}>
          {loading ? t("saving") : isLast ? t("finish_setup") : t("continue")}
        </Text>
        {!loading ? (
          <Feather
            name={isLast ? "check" : "arrow-right"}
            size={moderateScale(18)}
            color="#FFFFFF"
            style={{ marginLeft: scale(8) }}
          />
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: { flex: 1 },
  iconWrap: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(22),
    backgroundColor: "#FFF0E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(24),
  },
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
    marginBottom: verticalScale(24),
  },
  pointsContainer: {
    gap: verticalScale(12),
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pointIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: "#FFF0E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(12),
    marginTop: verticalScale(1),
  },
  pointText: {
    flex: 1,
    fontSize: moderateScale(14, 0.3),
    lineHeight: moderateScale(22, 0.3),
    color: "#374151",
    fontWeight: "600",
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
  continueButtonDisabled: {
    opacity: 0.75,
  },
  continueButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
