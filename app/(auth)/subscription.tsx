import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import { getCurrentUser, hasCompletedOnboarding } from "../../api/auth";
import { BillingCycle, UserSubscriptionPlan, getUserSubscriptionPlans, selectUserSubscriptionPlan } from "../../api/settings";
import { ListRouteSkeleton } from "../../components/ui/RouteSkeletons";
import { useAppStore } from "../../store/useAppStore";
import { showErrorMessage, showSuccessMessage } from "../../utils/feedback";

// @ts-ignore
import SplashLogo from "../../assets/images/splash-logo.svg";

type CurrentSubscriptionState = {
  selection_required: boolean;
  plan_name: string | null;
  billing_cycle: BillingCycle | null;
  status: string | null;
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("1_month");
  const [plans, setPlans] = useState<UserSubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingPlanId, setSubmittingPlanId] = useState<string | null>(null);
  const tokens = useAppStore((state) => state.tokens);
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      try {
        const response = await getUserSubscriptionPlans();
        setPlans(response.plans);
        setCurrentSubscription(response.current_subscription);
      } catch (error: any) {
        showErrorMessage(
          error?.response?.data?.message || error?.message || "Please try again.",
          "Unable to load plans"
        );
      } finally {
        setLoading(false);
      }
    };

    void loadPlans();
  }, []);

  const hasActiveSubscription =
    currentSubscription?.selection_required === false &&
    ["active", "trial"].includes(String(currentSubscription?.status || ""));

  const isCurrentPlanForCycle = (plan: UserSubscriptionPlan) => (
    Boolean(plan.is_current) &&
    currentSubscription?.billing_cycle === billingCycle &&
    ["active", "trial"].includes(String(currentSubscription?.status || ""))
  );

  const handleSelectPlan = async (plan: UserSubscriptionPlan) => {
    if (isCurrentPlanForCycle(plan)) {
      return;
    }

    setSubmittingPlanId(plan.id);
    try {
      const response = await selectUserSubscriptionPlan(billingCycle, false, plan.id);
      setCurrentSubscription(response.subscription);
      const refreshedUser = await getCurrentUser();
      setUser(refreshedUser, tokens);
      showSuccessMessage("Subscription activated successfully.");
      router.replace((hasCompletedOnboarding(refreshedUser) ? "/(tabs)/home" : "/(auth)/setup") as any);
    } catch (error: any) {
      showErrorMessage(
        error?.response?.data?.message || error?.message || "Unable to activate subscription.",
      );
    } finally {
      setSubmittingPlanId(null);
    }
  };

  const renderPlanCard = (plan: UserSubscriptionPlan) => {
    const features = plan.features ?? [];
    const price = billingCycle === "1_year" ? plan.annual_price ?? 0 : plan.monthly_price ?? 0;
    const currentForCycle = isCurrentPlanForCycle(plan);
    const submitting = submittingPlanId === plan.id;

    return (
      <View key={plan.id} style={[styles.cardContainer, currentForCycle && styles.currentCardContainer]}>
        {plan.is_best_plan && !currentForCycle ? (
          <LinearGradient
            colors={["#160c03", "#c78b1e"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.ribbonContainer}
          >
            <Text style={styles.ribbonText}>BEST VALUE</Text>
          </LinearGradient>
        ) : null}

        {currentForCycle ? (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
          </View>
        ) : null}

        <Text style={styles.planTitle}>{plan.name || "Subscription Plan"}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>€{price}</Text>
          <Text style={styles.pricePeriod}>
            {billingCycle === "1_month" ? " / month" : " / year"}
          </Text>
        </View>

        <Text style={styles.trialText}>
          {plan.trial_days > 0 ? `${plan.trial_days}-day free trial included` : "Paid plan"}
        </Text>

        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <MaterialCommunityIcons
                name="check-decagram-outline"
                size={moderateScale(20)}
                color="#D97706"
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.startButton, currentForCycle && styles.currentButton]}
          onPress={() => { void handleSelectPlan(plan); }}
          disabled={currentForCycle || submittingPlanId !== null}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.startButtonText, currentForCycle && styles.currentButtonText]}>
              {currentForCycle ? "Current Plan" : hasActiveSubscription ? "Switch Plan" : "Continue Setup"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <SplashLogo width={scale(90)} height={scale(90)} />
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <Text style={styles.headerSubtitle}>
            Unlock powerful AI tools to manage your restaurant business.
          </Text>
        </View>

        {loading ? (
          <ListRouteSkeleton itemCount={2} />
        ) : (
          <>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, billingCycle === "1_month" ? styles.toggleButtonActive : null]}
                onPress={() => setBillingCycle("1_month")}
              >
                <Text style={[styles.toggleText, billingCycle === "1_month" ? styles.toggleTextActive : null]}>
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, billingCycle === "1_year" ? styles.toggleButtonActive : null]}
                onPress={() => setBillingCycle("1_year")}
              >
                <Text style={[styles.toggleText, billingCycle === "1_year" ? styles.toggleTextActive : null]}>
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>

            {plans.length > 0 ? plans.map(renderPlanCard) : (
              <View style={styles.emptyPlansContainer}>
                <Text style={styles.footerCancelText}>No subscription plan is available right now.</Text>
              </View>
            )}

            {hasActiveSubscription ? (
              <TouchableOpacity
                style={styles.secondaryContinueButton}
                onPress={() => router.push("/(auth)/setup" as any)}
              >
                <Text style={styles.secondaryContinueText}>Continue Setup</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}

        <View style={styles.footerContainer}>
          <Text style={styles.footerCancelText}>Plan information updates from the live subscription API.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(40),
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: verticalScale(30),
  },
  headerTitle: {
    fontSize: moderateScale(28, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(8),
  },
  headerSubtitle: {
    fontSize: moderateScale(15, 0.3),
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: scale(10),
    lineHeight: moderateScale(22, 0.3),
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: scale(12),
    padding: scale(4),
    marginBottom: verticalScale(30),
  },
  toggleButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: "center",
    borderRadius: scale(10),
  },
  toggleButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "600",
    color: "#6B7280",
  },
  toggleTextActive: {
    color: "#FA8C4C",
  },
  cardContainer: {
    borderWidth: 2,
    borderColor: "#D97706",
    borderRadius: scale(20),
    padding: scale(24),
    backgroundColor: "#FFFFFF",
    position: "relative",
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: verticalScale(30),
  },
  currentCardContainer: {
    borderColor: "#16A34A",
    shadowColor: "#16A34A",
  },
  ribbonContainer: {
    position: "absolute",
    top: -2,
    right: -2,
    borderTopRightRadius: scale(20),
    borderBottomLeftRadius: scale(24),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(6),
  },
  ribbonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(11, 0.3),
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  currentBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    borderRadius: scale(999),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(5),
    marginBottom: verticalScale(12),
  },
  currentBadgeText: {
    color: "#166534",
    fontSize: moderateScale(11, 0.3),
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  planTitle: {
    fontSize: moderateScale(22, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(4),
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: verticalScale(16),
  },
  priceAmount: {
    fontSize: moderateScale(38, 0.3),
    fontWeight: "800",
    color: "#111827",
    lineHeight: moderateScale(42, 0.3),
  },
  pricePeriod: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: verticalScale(6),
  },
  trialText: {
    color: "#FA8C4C",
    fontWeight: "700",
    fontSize: moderateScale(14, 0.3),
    marginBottom: verticalScale(20),
  },
  featuresContainer: {
    marginBottom: verticalScale(24),
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  featureText: {
    marginLeft: scale(12),
    fontSize: moderateScale(14, 0.3),
    color: "#4B5563",
    fontWeight: "500",
    flex: 1,
  },
  startButton: {
    backgroundColor: "#FA8C4C",
    borderRadius: scale(12),
    height: verticalScale(54),
    justifyContent: "center",
    alignItems: "center",
  },
  currentButton: {
    backgroundColor: "#E5E7EB",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: moderateScale(16, 0.3),
  },
  currentButtonText: {
    color: "#374151",
  },
  emptyPlansContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(14),
    padding: scale(18),
    marginBottom: verticalScale(24),
  },
  secondaryContinueButton: {
    height: verticalScale(52),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: "#FA8C4C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(24),
  },
  secondaryContinueText: {
    color: "#FA8C4C",
    fontSize: moderateScale(15, 0.3),
    fontWeight: "800",
  },
  footerContainer: {
    alignItems: "center",
    paddingBottom: verticalScale(20),
  },
  footerCancelText: {
    color: "#4B5563",
    fontSize: moderateScale(14, 0.3),
    textAlign: "center",
  },
});
