import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import { getCurrentUser } from "../../api/auth";
import { useAppStore } from "../../store/useAppStore";
import { showErrorMessage, showSuccessMessage } from "../../utils/feedback";

export default function SubscriptionSuccessScreen() {
  const router = useRouter();
  const tokens = useAppStore((state) => state.tokens);
  const setUser = useAppStore((state) => state.setUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const refreshUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!isMounted) {
          return;
        }
        setUser(user, tokens);
        showSuccessMessage("Subscription updated successfully.");
      } catch (error: any) {
        if (!isMounted) {
          return;
        }
        showErrorMessage(error?.message || "Payment completed, but the app could not refresh your subscription yet.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void refreshUser();

    return () => {
      isMounted = false;
    };
  }, [setUser, tokens]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Feather name="check-circle" size={moderateScale(40)} color="#16A34A" />
        </View>
        <Text style={styles.title}>Payment Successful</Text>
        <Text style={styles.subtitle}>
          Your subscription payment has been completed. You can return to the app and continue.
        </Text>

        {loading ? (
          <ActivityIndicator color="#FA8C4C" style={styles.loader} />
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace("/(tabs)/settings/manage-subscription" as any)}
            >
              <Text style={styles.primaryButtonText}>View Subscription</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace("/(tabs)/home" as any)}
            >
              <Text style={styles.secondaryButtonText}>Go To Home</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: scale(24),
  },
  card: {
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(28),
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  iconWrap: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(18),
  },
  title: {
    fontSize: moderateScale(24, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(8),
    textAlign: "center",
  },
  subtitle: {
    fontSize: moderateScale(14, 0.3),
    lineHeight: moderateScale(22, 0.3),
    color: "#6B7280",
    textAlign: "center",
    marginBottom: verticalScale(20),
  },
  loader: {
    marginTop: verticalScale(8),
  },
  primaryButton: {
    width: "100%",
    height: verticalScale(52),
    borderRadius: scale(14),
    backgroundColor: "#FA8C4C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(12),
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
  },
  secondaryButton: {
    width: "100%",
    height: verticalScale(52),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: moderateScale(15, 0.3),
    fontWeight: "700",
  },
});
