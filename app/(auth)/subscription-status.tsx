import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import { useAppStore } from "../../store/useAppStore";
import { useTranslation } from "../../utils/i18n";

const getSubscriptionMessageKey = (status: string | null | undefined) => {
  const normalizedStatus = String(status || "").toLowerCase();
  if (normalizedStatus === "expired") {
    return "subscription_expired_message";
  }
  return "subscription_canceled_message";
};

export default function SubscriptionStatusScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAppStore((state) => state.user);
  const subscriptionMessageKey = getSubscriptionMessageKey(user?.subscription_status);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Feather name="alert-circle" size={moderateScale(42)} color="#FA8C4C" />
          </View>

          <Text style={styles.title}>{t("subscription_status_title")}</Text>
          <Text style={styles.subtitle}>{t(subscriptionMessageKey as any)}</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(auth)/subscription" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>{t("purchase_subscription")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F0",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: scale(24),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(24),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(30),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FDE7D8",
    shadowColor: "#B45309",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  iconWrap: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0E5",
    marginBottom: verticalScale(18),
  },
  title: {
    fontSize: moderateScale(24, 0.3),
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: verticalScale(10),
  },
  subtitle: {
    fontSize: moderateScale(15, 0.3),
    lineHeight: moderateScale(23, 0.3),
    color: "#6B7280",
    textAlign: "center",
    marginBottom: verticalScale(24),
  },
  primaryButton: {
    width: "100%",
    height: verticalScale(54),
    borderRadius: scale(16),
    backgroundColor: "#FA8C4C",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16, 0.3),
    fontWeight: "800",
  },
});
