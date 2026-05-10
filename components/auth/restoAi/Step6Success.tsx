import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTranslation } from "../../../utils/i18n";

export default function Step6Success() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleEnterDashboard = () => {
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Feather name="check" size={moderateScale(32)} color="#FFFFFF" />
        </View>
        <View style={styles.line1} />
        <View style={styles.line2} />
      </View>

      <Text style={styles.title}>
        {t("onboarding_success_title")}
      </Text>
      <Text style={styles.subtitle}>
        {t("onboarding_success_subtitle")}
      </Text>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleEnterDashboard}
      >
        <Text style={styles.continueButtonText}>{t("onboarding_enter_dashboard")}</Text>
        <Feather
          name="arrow-right"
          size={moderateScale(18)}
          color="#ffffffff"
          style={{ marginLeft: scale(8) }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: verticalScale(20),
  },
  card: {
    width: scale(220),
    height: scale(220),
    backgroundColor: "#FFF9F5",
    borderRadius: scale(24),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFEDD5",
    marginBottom: verticalScale(40),
  },
  iconWrapper: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    backgroundColor: "#FA8C4C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(24),
    shadowColor: "#FA8C4C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  line1: {
    width: "50%",
    height: verticalScale(6),
    backgroundColor: "#FFEDD5",
    borderRadius: scale(4),
    marginBottom: verticalScale(12),
  },
  line2: {
    width: "35%",
    height: verticalScale(6),
    backgroundColor: "#FFEDD5",
    borderRadius: scale(4),
  },
  title: {
    fontSize: moderateScale(28, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(12),
    textAlign: "center",
    lineHeight: moderateScale(34, 0.3),
  },
  subtitle: {
    fontSize: moderateScale(15, 0.3),
    color: "#4B5563",
    lineHeight: moderateScale(24, 0.3),
    textAlign: "center",
    paddingHorizontal: scale(20),
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
    width: "100%",
  },
  continueButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#ffffffff",
  },
});
