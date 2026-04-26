import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../../../components/ui/Header';
import { ListRouteSkeleton } from '../../../components/ui/RouteSkeletons';
import { useAppStore } from '../../../store/useAppStore';
import {
  BillingCycle,
  RestaurantSubscriptionSettings,
  UserSubscriptionPlan,
  createCustomerPortalSession,
  createSubscriptionCheckoutSession,
  getRestaurantSubscriptionSettings,
  getUserSubscriptionPlans,
} from '../../../api/settings';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

const formatBackendDate = (value: string | null) => {
  if (!value) {
    return 'Not available';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const billingCycleLabel = (value: BillingCycle | null) =>
  value === '1_year' ? 'Yearly' : 'Monthly';

const subscriptionStatusLabel = (value: RestaurantSubscriptionSettings['status']) =>
  value ? value.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'Inactive';

export default function ManageSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const profile = useAppStore((state) => state.profile);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('1_month');
  const [subscription, setSubscription] =
    useState<RestaurantSubscriptionSettings | null>(null);
  const [plans, setPlans] = useState<UserSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'checkout' | 'portal' | null>(
    null
  );

  const fetchSubscriptionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subscriptionData, plansData] = await Promise.all([
        getRestaurantSubscriptionSettings(),
        getUserSubscriptionPlans(),
      ]);
      setSubscription(subscriptionData);
      setPlans(plansData.plans);
      if (subscriptionData.billing_cycle) {
        setBillingCycle(subscriptionData.billing_cycle);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          'Failed to load subscription settings.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const selectedPlan = useMemo<UserSubscriptionPlan | null>(() => {
    if (plans.length === 0) {
      return null;
    }

    if (subscription?.plan_name) {
      const currentPlan = plans.find((plan) => plan.name === subscription.plan_name);
      if (currentPlan) {
        return currentPlan;
      }
    }

    return plans.find((plan) => plan.is_best_plan) ?? plans[0];
  }, [plans, subscription?.plan_name]);

  const priceValue =
    billingCycle === '1_year'
      ? selectedPlan?.annual_price ?? 0
      : selectedPlan?.monthly_price ?? 0;

  const openUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      throw new Error('The checkout link could not be opened on this device.');
    }
    await Linking.openURL(url);
  };

  const handleCheckout = async () => {
    setActionLoading('checkout');
    try {
      const response = await createSubscriptionCheckoutSession(
        billingCycle,
        subscription?.selection_required ?? true,
        selectedPlan?.id
      );
      await openUrl(response.checkout_url);
    } catch (err: any) {
      Alert.alert(
        'Unable to open checkout',
        err?.response?.data?.message ??
          err?.message ??
          'Please try again in a moment.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenPortal = async () => {
    setActionLoading('portal');
    try {
      const response = await createCustomerPortalSession();
      await openUrl(response.portal_url);
    } catch (err: any) {
      Alert.alert(
        'Unable to open billing portal',
        err?.response?.data?.message ??
          err?.message ??
          'Please try again in a moment.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const AvatarRight = () => (
    <Image
      source={{
        uri:
          profile?.profile_image_url ||
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      }}
      style={styles.avatar}
    />
  );

  return (
    <View style={styles.safeArea}>
      <Header
        title="Manage Subscription"
        showBack={true}
        rightComponent={<AvatarRight />}
      />

      {loading ? (
        <ListRouteSkeleton itemCount={3} />
      ) : error ? (
        <View style={styles.centerState}>
          <Feather name="alert-circle" size={moderateScale(42)} color="#EF4444" />
          <Text style={styles.stateTitle}>Unable to load subscription</Text>
          <Text style={styles.stateDescription}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchSubscriptionData}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: verticalScale(40) + insets.bottom },
          ]}
        >
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                billingCycle === '1_month' && styles.toggleButtonActive,
              ]}
              onPress={() => setBillingCycle('1_month')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleText,
                  billingCycle === '1_month' && styles.toggleTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                billingCycle === '1_year' && styles.toggleButtonActive,
              ]}
              onPress={() => setBillingCycle('1_year')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleText,
                  billingCycle === '1_year' && styles.toggleTextActive,
                ]}
              >
                Yearly
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardContainer}>
            {selectedPlan?.is_best_plan ? (
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
            ) : null}

            <Text style={styles.planTitle}>
              {subscription?.plan_name || selectedPlan?.name || 'Subscription Plan'}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>{formatCurrency(priceValue)}</Text>
              <Text style={styles.pricePeriod}>
                {billingCycle === '1_year' ? '/ year' : '/ month'}
              </Text>
            </View>

            <Text style={styles.trialText}>
              {selectedPlan
                ? `${selectedPlan.trial_days}-day free trial included`
                : 'Your subscription details are ready to manage.'}
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Status</Text>
              <Text style={styles.metaValue}>
                {subscriptionStatusLabel(subscription?.status ?? null)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Billing Cycle</Text>
              <Text style={styles.metaValue}>
                {billingCycleLabel(subscription?.billing_cycle ?? billingCycle)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Started</Text>
              <Text style={styles.metaValue}>
                {formatBackendDate(subscription?.started_at ?? null)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Renews / Expires</Text>
              <Text style={styles.metaValue}>
                {formatBackendDate(subscription?.expires_at ?? null)}
              </Text>
            </View>

            <View style={styles.featuresList}>
              {(selectedPlan?.features ?? []).map((feature) => (
                <View key={feature} style={styles.featureItem}>
                  <View style={styles.checkIcon}>
                    <Feather
                      name="check"
                      size={moderateScale(12)}
                      color="#B45309"
                    />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCheckout}
              disabled={actionLoading !== null}
            >
              <Text style={styles.primaryButtonText}>
                {actionLoading === 'checkout'
                  ? 'Opening...'
                  : subscription?.selection_required
                    ? 'Start Subscription'
                    : 'Update Subscription'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                (subscription?.selection_required || actionLoading !== null) &&
                  styles.secondaryButtonDisabled,
              ]}
              disabled={subscription?.selection_required || actionLoading !== null}
              onPress={handleOpenPortal}
            >
              <Text style={styles.secondaryButtonText}>
                {actionLoading === 'portal'
                  ? 'Opening Portal...'
                  : 'Manage Billing'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Billing Transparency</Text>
            <Text style={styles.infoText}>
              {subscription?.selection_required
                ? 'No active subscription is attached to this restaurant yet. Choose a cycle above to start one.'
                : `Your current plan is ${subscription?.plan_name || 'active'} on ${billingCycleLabel(
                    subscription?.billing_cycle ?? billingCycle
                  ).toLowerCase()} billing. Open the billing portal to manage payment details.`}
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
  },
  content: {
    padding: scale(20),
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  stateTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginTop: verticalScale(12),
  },
  stateDescription: {
    fontSize: moderateScale(14, 0.3),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: verticalScale(8),
  },
  retryButton: {
    marginTop: verticalScale(20),
    backgroundColor: '#FA8B4F',
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(12),
    borderRadius: scale(12),
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: moderateScale(14, 0.3),
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    padding: scale(4),
    marginBottom: verticalScale(24),
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FA8C4C',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(24),
    borderWidth: 1.5,
    borderColor: '#111827',
    marginBottom: verticalScale(24),
    shadowColor: '#F59E0B',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: scale(16),
    backgroundColor: '#451A03',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderBottomLeftRadius: scale(8),
    borderBottomRightRadius: scale(8),
  },
  bestValueText: {
    color: '#FDE047',
    fontSize: moderateScale(10, 0.3),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: moderateScale(20, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(8),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: verticalScale(12),
  },
  priceValue: {
    fontSize: moderateScale(36, 0.3),
    fontWeight: '900',
    color: '#111827',
  },
  pricePeriod: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: scale(4),
  },
  trialText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#FA8C4C',
    marginBottom: verticalScale(20),
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  metaLabel: {
    fontSize: moderateScale(13, 0.3),
    color: '#6B7280',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: moderateScale(13, 0.3),
    color: '#111827',
    fontWeight: '700',
  },
  featuresList: {
    gap: verticalScale(16),
    marginVertical: verticalScale(28),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  featureText: {
    flex: 1,
    fontSize: moderateScale(14, 0.3),
    fontWeight: '500',
    color: '#4B5563',
  },
  primaryButton: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(12),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#374151',
    borderRadius: scale(12),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  secondaryButtonDisabled: {
    opacity: 0.5,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: scale(12),
    padding: scale(20),
    marginBottom: verticalScale(20),
  },
  infoTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(8),
  },
  infoText: {
    fontSize: moderateScale(14, 0.3),
    color: '#6B7280',
    lineHeight: 22,
  },
});
