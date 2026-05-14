import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { AppState, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { getRestrictedAccessStatus, useAppStore } from "../../../store/useAppStore";
import { getCurrentUser } from "../../../api/auth";
import { showSuccessMessage } from "../../../utils/feedback";
import { buildSettingsHref, normalizeOrigin } from "../../../utils/settingsNavigation";

const ACCESS_REFRESH_INTERVAL_MS = 8000;

export default function RestrictedAccessScreen() {
  const router = useRouter();
  const { origin } = useLocalSearchParams<{ origin?: string | string[] }>();
  const settingsOrigin = normalizeOrigin(origin);
  const user = useAppStore((state) => state.user);
  const tokens = useAppStore((state) => state.tokens);
  const setUser = useAppStore((state) => state.setUser);
  const accessStatus = getRestrictedAccessStatus(user);
  const isSuspended = accessStatus === "suspended";
  const eyebrow = isSuspended ? "Account Suspended" : "Account Restricted";
  const title = isSuspended ? "Your account is suspended" : "Your account is restricted";
  const description = isSuspended
    ? "This account has been suspended by the admin team. Contact support to request a review."
    : "This account has been restricted by the admin team. Contact support to request a review.";
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAccess = useCallback(async (showRestoredMessage = false) => {
    if (!tokens?.access_token) {
      return;
    }

    setIsRefreshing(true);
    try {
      const refreshedUser = await getCurrentUser();
      setUser(refreshedUser, tokens);

      if (getRestrictedAccessStatus(refreshedUser) === null) {
        if (showRestoredMessage) {
          showSuccessMessage("Your account access has been restored.", "Access Restored");
        }
        router.replace("/(tabs)/home" as any);
      }
    } catch (error: any) {
      console.log("Restricted access refresh error:", error?.response?.data || error?.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [router, setUser, tokens]);

  useEffect(() => {
    void refreshAccess(false);
  }, [refreshAccess]);

  useEffect(() => {
    if (accessStatus === null && user?.is_active) {
      router.replace("/(tabs)/home" as any);
    }
  }, [accessStatus, router, user?.is_active]);

  useEffect(() => {
    const interval = setInterval(() => {
      void refreshAccess(false);
    }, ACCESS_REFRESH_INTERVAL_MS);

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshAccess(false);
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [refreshAccess]);

  if (accessStatus === null && user?.is_active) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refreshAccess(true)} colors={["#FA8B4F"]} />
      }
    >
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Feather name="slash" size={moderateScale(26)} color="#C25D11" />
        </View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <TouchableOpacity
          style={styles.helpButton}
          activeOpacity={0.85}
          onPress={() => router.push(buildSettingsHref('/(tabs)/settings/help-center', settingsOrigin))}
        >
          <Text style={styles.helpButtonText}>Go To Help Center</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.refreshButton}
          activeOpacity={0.85}
          onPress={() => void refreshAccess(true)}
          disabled={isRefreshing}
        >
          <Text style={styles.refreshButtonText}>
            {isRefreshing ? "Checking..." : "Check Access Again"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: scale(24),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(28),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(28),
    borderWidth: 1,
    borderColor: "#FED7AA",
    shadowColor: "#9A3412",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  iconWrap: {
    width: scale(54),
    height: scale(54),
    borderRadius: scale(27),
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(18),
  },
  eyebrow: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: "800",
    letterSpacing: 1,
    color: "#C25D11",
    textTransform: "uppercase",
  },
  title: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(28, 0.3),
    fontWeight: "800",
    color: "#111827",
  },
  description: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(15, 0.3),
    lineHeight: moderateScale(23, 0.3),
    color: "#4B5563",
  },
  helpButton: {
    marginTop: verticalScale(24),
    height: verticalScale(54),
    borderRadius: scale(14),
    backgroundColor: "#FA8B4F",
    alignItems: "center",
    justifyContent: "center",
  },
  helpButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  refreshButton: {
    marginTop: verticalScale(12),
    height: verticalScale(50),
    borderRadius: scale(14),
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButtonText: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: "700",
    color: "#C25D11",
  },
});
