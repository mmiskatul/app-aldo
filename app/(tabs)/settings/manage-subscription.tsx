import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { PurchasesPackage } from 'react-native-purchases';

import Header from '../../../components/ui/Header';
import { getCurrentUser } from '../../../api/auth';
import {
  BillingCycle,
  RestaurantSubscriptionSettings,
  UserSubscriptionPlan,
  cancelUserSubscription,
  getRestaurantSubscriptionSettings,
  getUserSubscriptionPlans,
} from '../../../api/settings';
import { useAppStore } from '../../../store/useAppStore';
import { useSubscription } from '../../../store/SubscriptionContext';
import { REVENUECAT_CONSTANTS } from '../../../constants/revenuecat';
import { formatReadableDate, formatSubscriptionStatus } from '../../../utils/date';
import { showDialog, showErrorMessage, showSuccessMessage } from '../../../utils/feedback';
import { useTranslation } from '../../../utils/i18n';
import { isCacheFresh } from '../../../utils/cache';

const SETTINGS_SUBSCRIPTION_CACHE_TTL_MS = 5 * 60 * 1000;

export default function ManageSubscriptionScreen() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('1_month');
  const [, setPlans] = useState<UserSubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<RestaurantSubscriptionSettings | null>(null);

  const {
    isPro,
    currentOffering,
    isPurchasing,
    isRestoring,
    purchasePackage,
    restorePurchases,
    refreshSubscription,
  } = useSubscription();

  const user = useAppStore((state) => state.user);
  const tokens = useAppStore((state) => state.tokens);
  const setUser = useAppStore((state) => state.setUser);
  const clearHomeScreenCache = useAppStore((state) => state.clearHomeScreenCache);
  const clearAnalyticsScreenCache = useAppStore((state) => state.clearAnalyticsScreenCache);
  const settingsSubscriptionCache = useAppStore((state) => state.settingsSubscriptionCache);
  const setSettingsSubscriptionCache = useAppStore((state) => state.setSettingsSubscriptionCache);

  const loadSubscriptionData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [subscriptionSettings, plansResponse] = await Promise.all([
        getRestaurantSubscriptionSettings(),
        getUserSubscriptionPlans(),
      ]);
      setSubscription(subscriptionSettings);
      setPlans(plansResponse.plans);
      setSettingsSubscriptionCache({
        subscription: subscriptionSettings,
        plans: plansResponse.plans,
        fetchedAt: Date.now(),
      });
      if (subscriptionSettings.billing_cycle) {
        setBillingCycle(subscriptionSettings.billing_cycle);
      }
    } catch (error: any) {
      showErrorMessage(error?.message || i18n.t('subscription_manage_load_failed'));
    } finally {
      setLoading(false);
    }
  }, [i18n, setSettingsSubscriptionCache]);

  useEffect(() => {
    if (settingsSubscriptionCache.subscription) {
      setSubscription(settingsSubscriptionCache.subscription);
      setPlans(settingsSubscriptionCache.plans);
      if (settingsSubscriptionCache.subscription.billing_cycle) {
        setBillingCycle(settingsSubscriptionCache.subscription.billing_cycle);
      }
      setLoading(false);
      if (isCacheFresh(settingsSubscriptionCache.fetchedAt, SETTINGS_SUBSCRIPTION_CACHE_TTL_MS)) {
        return;
      }
      void loadSubscriptionData();
      return;
    }
    void loadSubscriptionData();
  }, [loadSubscriptionData, settingsSubscriptionCache]);

  const hasActiveSubscription =
    isPro ||
    (subscription?.selection_required === false &&
      ['active', 'trial'].includes(String(subscription?.status || '')));

  const handlePurchaseRcPackage = async (pkg: PurchasesPackage) => {
    const success = await purchasePackage(pkg);
    if (success) {
      const refreshedUser = await getCurrentUser();
      setUser(refreshedUser, tokens);
      await loadSubscriptionData();
    }
  };

  const handleRestoreRcPurchases = async () => {
    const success = await restorePurchases();
    if (success) {
      const refreshedUser = await getCurrentUser();
      setUser(refreshedUser, tokens);
      await loadSubscriptionData();
    }
  };

  const submitCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const response = await cancelUserSubscription();
      showSuccessMessage(response.message || t('subscription_canceled_successfully'));
      setSubscription((current) => ({
        selection_required: response.subscription.selection_required,
        plan_name: response.subscription.plan_name,
        billing_cycle: response.subscription.billing_cycle,
        status: response.subscription.status,
        started_at: response.subscription.started_at,
        expires_at: response.subscription.expires_at,
        plans_endpoint: current?.plans_endpoint || '/api/v1/subscriptions/user/plans',
        checkout_endpoint: current?.checkout_endpoint || '/api/v1/subscriptions/user/checkout-session',
        customer_portal_endpoint: current?.customer_portal_endpoint || '/api/v1/subscriptions/user/customer-portal',
      }));
      if (user) {
        setUser(
          {
            ...user,
            subscription_plan_name: response.subscription.plan_name,
            subscription_plan: response.subscription.billing_cycle,
            subscription_status: response.subscription.status,
            subscription_started_at: response.subscription.started_at,
            subscription_expires_at: response.subscription.expires_at,
            subscription_selection_required: response.subscription.selection_required,
          },
          tokens
        );
      }
      clearHomeScreenCache();
      clearAnalyticsScreenCache();
      await refreshSubscription();
    } catch (error: any) {
      showErrorMessage(error?.message || t('subscription_cancel_failed'));
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    showDialog(
      t('subscription_cancel_title'),
      t('subscription_cancel_message'),
      [
        { text: t('subscription_keep_plan'), style: 'cancel' },
        { text: t('subscription_cancel_action'), style: 'destructive', onPress: () => { void submitCancelSubscription(); } },
      ],
    );
  };

  const monthlyPackage = currentOffering?.availablePackages.find(
    (p) => p.identifier === REVENUECAT_CONSTANTS.PACKAGE_MONTHLY || p.packageType === 'MONTHLY'
  );
  const annualPackage = currentOffering?.availablePackages.find(
    (p) => p.identifier === REVENUECAT_CONSTANTS.PACKAGE_YEARLY || p.packageType === 'ANNUAL'
  );

  const selectedRcPackage = billingCycle === '1_year' ? annualPackage : monthlyPackage;

  return (
    <View style={styles.safeArea}>
      <Header title={t('manage_subscription')} showBack={true} />

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
                  <Text style={styles.sectionEyebrow}>{t('subscription_current_section')}</Text>
                  <Text style={styles.title}>
                    {isPro ? 'RistoAI Premium' : (subscription?.plan_name || t('subscription_no_plan_selected'))}
                  </Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('subscription_status_label')}</Text>
                  <Text style={styles.infoValue}>
                    {isPro ? 'Active (RevenueCat Pro)' : formatSubscriptionStatus(subscription?.status)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('subscription_started_label')}</Text>
                  <Text style={styles.infoValue}>{formatReadableDate(subscription?.started_at ?? null, undefined, t('not_available'))}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('subscription_next_renewal_label')}</Text>
                  <Text style={styles.infoValue}>{formatReadableDate(subscription?.expires_at ?? null, undefined, t('not_available'))}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionEyebrow}>In-App Subscription Plans</Text>
              <Text style={styles.helperText}>
                Choose a plan below to subscribe via Google Play / App Store.
              </Text>

              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleButton, billingCycle === '1_month' ? styles.toggleButtonActive : null]}
                  onPress={() => setBillingCycle('1_month')}
                >
                  <Text style={[styles.toggleText, billingCycle === '1_month' ? styles.toggleTextActive : null]}>
                    {t('subscription_monthly')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, billingCycle === '1_year' ? styles.toggleButtonActive : null]}
                  onPress={() => setBillingCycle('1_year')}
                >
                  <Text style={[styles.toggleText, billingCycle === '1_year' ? styles.toggleTextActive : null]}>
                    {t('subscription_yearly')}
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedRcPackage ? (
                <View style={styles.planCard}>
                  <View style={styles.planHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.planName}>{selectedRcPackage.product.title || 'RistoAI Premium'}</Text>
                    </View>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceAmount}>{selectedRcPackage.product.priceString}</Text>
                    <Text style={styles.pricePeriod}>
                      {billingCycle === '1_year' ? t('subscription_per_year') : t('subscription_per_month')}
                    </Text>
                  </View>

                  <Text style={[styles.helperText, { marginBottom: verticalScale(14) }]}>
                    {selectedRcPackage.product.description || 'Full access to AI menu insights, analytics, and business tools.'}
                  </Text>

                  <TouchableOpacity
                    style={[styles.primaryButton, isPro && styles.disabledPrimaryButton]}
                    onPress={() => { void handlePurchaseRcPackage(selectedRcPackage); }}
                    disabled={isPro || isPurchasing}
                  >
                    {isPurchasing ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.primaryButtonText, isPro && styles.disabledPrimaryButtonText]}>
                        {isPro ? 'Subscribed' : 'Subscribe Now'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={[styles.helperText, { marginTop: verticalScale(10) }]}>
                  Loading offerings from App Store / Play Store...
                </Text>
              )}

              <TouchableOpacity
                style={[styles.dangerButton, { marginTop: verticalScale(16), borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }]}
                onPress={() => { void handleRestoreRcPurchases(); }}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <ActivityIndicator color="#374151" />
                ) : (
                  <Text style={[styles.dangerButtonText, { color: '#374151' }]}>Restore Purchases</Text>
                )}
              </TouchableOpacity>
            </View>

            {hasActiveSubscription ? (
              <View style={styles.card}>
                <Text style={styles.sectionEyebrow}>{t('subscription_actions_section')}</Text>
                <Text style={styles.helperText}>
                  {t('subscription_actions_helper')}
                </Text>

                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={handleCancelSubscription}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? (
                    <ActivityIndicator color="#B91C1C" />
                  ) : (
                    <Text style={styles.dangerButtonText}>{t('subscription_cancel_action')}</Text>
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
  planCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(16),
    padding: scale(16),
    marginTop: verticalScale(14),
  },
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(10),
    marginBottom: verticalScale(10),
  },
  planName: {
    fontSize: moderateScale(20, 0.3),
    fontWeight: '800',
    color: '#111827',
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
    marginTop: verticalScale(14),
    marginBottom: verticalScale(8),
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
  helperText: {
    fontSize: moderateScale(14, 0.3),
    lineHeight: moderateScale(22, 0.3),
    color: '#6B7280',
  },
  primaryButton: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(14),
    height: verticalScale(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledPrimaryButton: {
    backgroundColor: '#E5E7EB',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
  },
  disabledPrimaryButtonText: {
    color: '#374151',
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
