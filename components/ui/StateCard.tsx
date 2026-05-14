import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

type StateTone = "neutral" | "error";

interface StateCardProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionLoading?: boolean;
  tone?: StateTone;
  onAction?: () => void;
}

const toneStyles: Record<StateTone, { borderColor: string; backgroundColor: string; titleColor: string; descriptionColor: string }> = {
  neutral: {
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    titleColor: "#111827",
    descriptionColor: "#6B7280",
  },
  error: {
    borderColor: "#FECACA",
    backgroundColor: "#FFF7F7",
    titleColor: "#991B1B",
    descriptionColor: "#7F1D1D",
  },
};

export default function StateCard({
  title,
  description,
  actionLabel,
  actionLoading = false,
  tone = "neutral",
  onAction,
}: StateCardProps) {
  const palette = toneStyles[tone];

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: palette.borderColor,
          backgroundColor: palette.backgroundColor,
        },
      ]}
    >
      <Text style={[styles.title, { color: palette.titleColor }]}>{title}</Text>
      <Text style={[styles.description, { color: palette.descriptionColor }]}>{description}</Text>

      {actionLabel && onAction ? (
        <TouchableOpacity
          style={[styles.button, actionLoading && styles.buttonDisabled]}
          onPress={onAction}
          disabled={actionLoading}
          activeOpacity={0.85}
        >
          {actionLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>{actionLabel}</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: scale(16),
    borderWidth: 1,
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(18),
    alignItems: "center",
  },
  title: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(13, 0.3),
    lineHeight: moderateScale(20, 0.3),
    textAlign: "center",
  },
  button: {
    marginTop: verticalScale(16),
    minWidth: scale(132),
    borderRadius: scale(12),
    backgroundColor: "#FA8C4C",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(13, 0.3),
    fontWeight: "700",
  },
});
