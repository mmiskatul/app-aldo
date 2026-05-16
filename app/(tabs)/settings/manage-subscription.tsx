import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import Header from '../../../components/ui/Header';
import { getCurrentUser } from '../../../api/auth';
import {
  BillingCycle,
  RestaurantSubscriptionSettings,
  UserSubscriptionPlan,
  cancelUserSubscription,
  getRestaurantSubscriptionSettings,
  getUserSubscriptionPlans,
  selectUserSubscriptionPlan,
} from '../../../api/settings';
import { useAppStore } from '../../../store/useAppStore';
import { formatReadableDate, formatSubscriptionStatus } from '../../../utils/date';
import { showDialog, showErrorMessage, showSuccessMessage } from '../../../utils/feedback';
import { useTranslation } from '../../../utils/i18n';

const LOCALIZED_PLAN_NAME_KEYS: Record<string, string> = {
  'Core Plan': 'subscription_plan_core_name',
};

const LOCALIZED_PLAN_FEATURE_KEYS: Record<string, string> = {
  'AI menu suggestions': 'subscription_feature_ai_menu_suggestions',
  'Basic sales analytics': 'subscription_feature_basic_sales_analytics',
  'Email support': 'subscription_feature_email_support',
  'Advanced AI insights': 'subscription_feature_advanced_ai_insights',
  'Revenue analytics': 'subscription_feature_revenue_analytics',
  'Enterprise reports': 'subscription_feature_enterprise_reports',
};

export default function ManageSubscriptionScreen() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activatingPlanId, setActivatingPlanId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('1_month');
  const [plans, setPlans] = useState<UserSubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<RestaurantSubscriptionSettings | null>(null);
  const user = useAppStore((state) => state.user);
  const tokens = useAppStore((state) => state.tokens);
  const setUser = useAppStore((state) => state.setUser);
  const clearHomeScreenCache = useAppStore((state) => state.clearHomeScreenCache);
  const clearAnalyticsScreenCache = useAppStore((state) => state.clearAnalyticsScreenCache);

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
      showErrorMessage(error?.message || i18n.t('subscription_manage_load_failed'));
    } finally {
      setLoading(false);
    }
  }, [i18n]);

  useEffect(() => {
    void loadSubscriptionData();
  }, [loadSubscriptionData]);

  const hasActiveSubscription =
    subscription?.selection_required === false &&
    ['active', 'trial'].includes(String(subscription?.status || ''));

  const isCurrentPlanForCycle = (plan: UserSubscriptionPlan) => (
    Boolean(plan.is_current) &&
    subscription?.billing_cycle === billingCycle &&
    ['active', 'trial'].includes(String(subscription?.status || ''))
  );

  const currentPlan = hasActiveSubscription ? plans.find((plan) => plan.is_current) : undefined;
  const currentPlanPrice = subscription?.billing_cycle === '1_year'
    ? currentPlan?.annual_price ?? 0
    : currentPlan?.monthly_price ?? 0;
  const switchablePlans = plans.filter((plan) => !isCurrentPlanForCycle(plan));

  const getLocalizedPlanName = (name?: string | null) => {
    if (!name) {
      return t('subscription_no_plan_selected');
    }
    const key = LOCALIZED_PLAN_NAME_KEYS[name.trim()];
    return key ? t(key as any) : name;
  };

  const getLocalizedFeature = (feature: string) => {
    const key = LOCALIZED_PLAN_FEATURE_KEYS[feature.trim()];
    return key ? t(key as any) : feature;
  };

  const getLocalizedBillingCycleLabel = (value: string | null | undefined) => {
    if (value === '1_year') return t('subscription_yearly');
    if (value === '1_month') return t('subscription_monthly');
    return t('subscription_not_selected');
  };

  const getLocalizedStatusLabel = (value: string | null | undefined) => {
    const normalized = String(value || '').toLowerCase();
    if (!normalized) return t('subscription_status_not_active');
    if (normalized === 'active') return t('subscription_status_active');
    if (normalized === 'trial') return t('subscription_status_trial');
    if (normalized === 'canceled') return t('subscription_status_canceled');
    if (normalized === 'expired') return t('subscription_status_expired');
    if (normalized === 'suspended') return t('subscription_status_suspended');
    return formatSubscriptionStatus(value);
  };

  const handleActivatePlan = async (plan: UserSubscriptionPlan) => {
    if (isCurrentPlanForCycle(plan)) {
      return;
    }

    setActivatingPlanId(plan.id);
    try {
      const response = await selectUserSubscriptionPlan(billingCycle, false, plan.id);
      showSuccessMessage(response.message || t('subscription_plan_activated_successfully'));
      const refreshedUser = await getCurrentUser();
      setUser(refreshedUser, tokens);
      await loadSubscriptionData();
    } catch (error: any) {
      showErrorMessage(error?.message || t('subscription_activate_failed'));
    } finally {
      setActivatingPlanId(null);
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

  const renderPlanCard = (plan: UserSubscriptionPlan) => {
    const currentForCycle = isCurrentPlanForCycle(plan);
    const activating = activatingPlanId === plan.id;
    const currentPrice = billingCycle === '1_year' ? plan.annual_price ?? 0 : plan.monthly_price ?? 0;

    return (
      <View key={plan.id} style={[styles.planCard, currentForCycle && styles.currentPlanCard]}>
        <View style={styles.planHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.planName}>{getLocalizedPlanName(plan.name || null)}</Text>
          </View>
          {plan.is_best_plan && !currentForCycle ? (
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>{t('subscription_best_value')}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceAmount}>{`\u20AC${currentPrice}`}</Text>
          <Text style={styles.pricePeriod}>{billingCycle === '1_year' ? t('subscription_per_year') : t('subscription_per_month')}</Text>
        </View>

        <View style={styles.featuresWrap}>
          {(plan.features || []).map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <MaterialCommunityIcons
                name="check-decagram-outline"
                size={moderateScale(18)}
                color="#D97706"
              />
              <Text style={styles.featureText}>{getLocalizedFeature(feature)}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, currentForCycle && styles.disabledPrimaryButton]}
          onPress={() => { void handleActivatePlan(plan); }}
          disabled={currentForCycle || activatingPlanId !== null}
        >
          {activating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.primaryButtonText, currentForCycle && styles.disabledPrimaryButtonText]}>
              {currentForCycle ? t('subscription_current_plan_button') : hasActiveSubscription ? t('subscription_switch_plan') : t('subscription_activate_plan')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

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
                  <Text style={styles.title}>{getLocalizedPlanName(subscription?.plan_name || null)}</Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                {currentPlan ? (
                  <View style={styles.currentPlanSummary}>
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>{t('subscription_current_plan_badge')}</Text>
                    </View>
                    <View style={styles.priceRowCompact}>
                      <Text style={styles.priceAmountCompact}>{`\u20AC${currentPlanPrice}`}</Text>
                      <Text style={styles.pricePeriod}>
                        {subscription?.billing_cycle === '1_year' ? t('subscription_per_year') : t('subscription_per_month')}
                      </Text>
                    </View>
                  </View>
                ) : null}
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('subscription_status_label')}</Text>
                  <Text style={styles.infoValue}>{getLocalizedStatusLabel(subscription?.status ?? null)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>{t('subscription_billing_label')}</Text>
                  <Text style={styles.infoValue}>{getLocalizedBillingCycleLabel(subscription?.billing_cycle ?? null)}</Text>
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
              <Text style={styles.sectionEyebrow}>{t('subscription_switch_section')}</Text>
              <Text style={styles.helperText}>
                {t('subscription_switch_helper')}
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

              {switchablePlans.length > 0 ? switchablePlans.map(renderPlanCard) : (
                <Text style={styles.helperText}>{t('subscription_no_other_plan_for_cycle')}</Text>
              )}
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
  currentPlanCard: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  currentPlanSummary: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(10),
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
  currentBadge: {
    alignSelf: 'flex-start',
    marginTop: verticalScale(8),
    backgroundColor: '#DCFCE7',
    borderRadius: scale(999),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
  },
  currentBadgeText: {
    color: '#166534',
    fontSize: moderateScale(10, 0.3),
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  bestBadge: {
    backgroundColor: '#111827',
    borderRadius: scale(999),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
  },
  bestBadgeText: {
    color: '#FFFFFF',
    fontSize: moderateScale(9, 0.3),
    fontWeight: '800',
    letterSpacing: 0.8,
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
  priceRowCompact: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: verticalScale(8),
  },
  priceAmount: {
    fontSize: moderateScale(32, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  priceAmountCompact: {
    fontSize: moderateScale(28, 0.3),
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
