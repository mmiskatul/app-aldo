import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import Header from '../../../components/ui/Header';
import {
  BillingCycle,
  RestaurantSubscriptionSettings,
  SubscriptionStatus,
  UserSubscriptionPlan,
  cancelUserSubscription,
  createCustomerPortalSession,
  getRestaurantSubscriptionSettings,
  getUserSubscriptionPlans,
  selectUserSubscriptionPlan,
} from '../../../api/settings';
import { showDialog, showErrorMessage, showSuccessMessage } from '../../../utils/feedback';

const formatBillingCycle = (billingCycle: BillingCycle | null) => {
  if (billingCycle === '1_year') return 'Yearly';
  if (billingCycle === '1_month') return 'Monthly';
  return 'Not selected';
};

const formatStatus = (status: SubscriptionStatus | null) => {
  if (!status) return 'Not active';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (value: string | null) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function ManageSubscriptionScreen() {
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('1_month');
  const [plans, setPlans] = useState<UserSubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<RestaurantSubscriptionSettings | null>(null);

  const loadSubscriptionData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [subscriptionSettings, plansResponse] = await Promise.all([
        getRestaurantSubscriptionSettings(),
        getUserSubscriptionPlans(),
      ]);
      setSubscription(subscriptionSettings);
      setPlans(plansResponse.plans);
      if (subscriptionSettings.billing_cycle) {
        setBillingCycle(subscriptionSettings.billing_cycle);
      }
    } catch (error: any) {
      showErrorMessage(error?.message || 'Unable to load subscription details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubscriptionData();
  }, [loadSubscriptionData]);

  const selectedPlan = useMemo<UserSubscriptionPlan | null>(() => {
    if (plans.length === 0) {
      return null;
    }
    return plans.find((plan) => plan.is_best_plan) ?? plans[0];
  }, [plans]);

  const currentPrice = billingCycle === '1_year'
    ? selectedPlan?.annual_price ?? 0
    : selectedPlan?.monthly_price ?? 0;

  const handleUpgradeOrUpdate = async () => {
    if (!selectedPlan) {
      showErrorMessage('No subscription plan is available right now.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await selectUserSubscriptionPlan(
        billingCycle,
        false,
        selectedPlan.id,
      );
      showSuccessMessage(response.message || 'Subscription updated successfully.');
      await loadSubscriptionData();
    } catch (error: any) {
      showErrorMessage(error?.message || 'Unable to update subscription.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const response = await createCustomerPortalSession();
      await openBrowserAsync(response.portal_url, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } catch (error: any) {
      showErrorMessage(error?.message || 'Unable to open billing portal.');
    } finally {
      setPortalLoading(false);
    }
  };

  const submitCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const response = await cancelUserSubscription();
      showSuccessMessage(response.message || 'Subscription canceled successfully.');
      await loadSubscriptionData();
    } catch (error: any) {
      showErrorMessage(error?.message || 'Unable to cancel subscription.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    showDialog(
      'Cancel Subscription',
      'Are you sure you want to cancel this subscription?',
      [
        { text: 'Keep Plan', style: 'cancel' },
        { text: 'Cancel Subscription', style: 'destructive', onPress: () => { void submitCancelSubscription(); } },
      ],
    );
  };

  const showPortalActions = Boolean(subscription?.plan_name);

  return (
    <View style={styles.safeArea}>
      <Header title="Manage Subscription" showBack={true} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#FA8C4C" />
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <Feather name="credit-card" size={moderateScale(22)} color="#FA8C4C" />
                </View>
                <View style={styles.cardHeaderCopy}>
                  <Text style={styles.sectionEyebrow}>Current Subscription</Text>
                  <Text style={styles.title}>{subscription?.plan_name || 'No plan selected'}</Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <Text style={styles.infoValue}>{formatStatus(subscription?.status ?? null)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Billing</Text>
                  <Text style={styles.infoValue}>{formatBillingCycle(subscription?.billing_cycle ?? null)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Started</Text>
                  <Text style={styles.infoValue}>{formatDate(subscription?.started_at ?? null)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Next renewal</Text>
                  <Text style={styles.infoValue}>{formatDate(subscription?.expires_at ?? null)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionEyebrow}>Update Plan</Text>
              <Text style={styles.planName}>{selectedPlan?.name || 'Subscription Plan'}</Text>

              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleButton, billingCycle === '1_month' ? styles.toggleButtonActive : null]}
                  onPress={() => setBillingCycle('1_month')}
                >
                  <Text style={[styles.toggleText, billingCycle === '1_month' ? styles.toggleTextActive : null]}>
                    Monthly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, billingCycle === '1_year' ? styles.toggleButtonActive : null]}
                  onPress={() => setBillingCycle('1_year')}
                >
                  <Text style={[styles.toggleText, billingCycle === '1_year' ? styles.toggleTextActive : null]}>
                    Yearly
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>${currentPrice}</Text>
                <Text style={styles.pricePeriod}>{billingCycle === '1_year' ? ' / year' : ' / month'}</Text>
              </View>

              <View style={styles.featuresWrap}>
                {(selectedPlan?.features || []).map((feature) => (
                  <View key={feature} style={styles.featureRow}>
                    <MaterialCommunityIcons
                      name="check-decagram-outline"
                      size={moderateScale(18)}
                      color="#D97706"
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => { void handleUpgradeOrUpdate(); }}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {subscription?.plan_name ? 'Update Plan' : 'Activate Subscription'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {showPortalActions ? (
              <View style={styles.card}>
                <Text style={styles.sectionEyebrow}>Billing Actions</Text>
                <Text style={styles.helperText}>
                  Open the billing portal to manage payment details or cancel your subscription.
                </Text>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => { void openBillingPortal(); }}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <ActivityIndicator color="#111827" />
                  ) : (
                    <Text style={styles.secondaryButtonText}>Open Billing Portal</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={handleCancelSubscription}
                  disabled={portalLoading || cancelLoading}
                >
                  {cancelLoading ? (
                    <ActivityIndicator color="#B91C1C" />
                  ) : (
                    <Text style={styles.dangerButtonText}>Cancel Subscription</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(40),
    gap: verticalScale(16),
  },
  loadingWrap: {
    paddingTop: verticalScale(80),
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(18),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(18),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  cardHeaderCopy: {
    flex: 1,
  },
  iconWrap: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  sectionEyebrow: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: verticalScale(4),
  },
  title: {
    fontSize: moderateScale(22, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  planName: {
    fontSize: moderateScale(20, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(14),
  },
  infoGrid: {
    gap: verticalScale(12),
  },
  infoItem: {
    paddingVertical: verticalScale(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: moderateScale(12, 0.3),
    color: '#6B7280',
    marginBottom: verticalScale(4),
  },
  infoValue: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    padding: scale(4),
    marginBottom: verticalScale(18),
  },
  toggleButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    borderRadius: scale(10),
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FA8C4C',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: verticalScale(16),
  },
  priceAmount: {
    fontSize: moderateScale(32, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  pricePeriod: {
    fontSize: moderateScale(15, 0.3),
    color: '#6B7280',
    marginLeft: scale(4),
    marginBottom: verticalScale(4),
  },
  featuresWrap: {
    gap: verticalScale(10),
    marginBottom: verticalScale(18),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    marginLeft: scale(10),
    color: '#374151',
    fontSize: moderateScale(14, 0.3),
    lineHeight: moderateScale(20, 0.3),
  },
  helperText: {
    fontSize: moderateScale(14, 0.3),
    lineHeight: moderateScale(22, 0.3),
    color: '#6B7280',
    marginBottom: verticalScale(16),
  },
  primaryButton: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(14),
    height: verticalScale(54),
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    height: verticalScale(52),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
  },
  dangerButton: {
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    height: verticalScale(52),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    color: '#B91C1C',
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
  },
});
