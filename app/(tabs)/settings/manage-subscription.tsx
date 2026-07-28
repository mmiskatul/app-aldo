import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

import Header from '../../../components/ui/Header';
import { useSubscription } from '../../../store/SubscriptionContext';
import { REVENUECAT_CONSTANTS } from '../../../constants/revenuecat';
import { showDialog, showErrorMessage, showSuccessMessage } from '../../../utils/feedback';
import { useTranslation } from '../../../utils/i18n';
import { cancelUserSubscription } from '../../../api/settings';
import { useAppStore } from '../../../store/useAppStore';

export default function ManageSubscriptionScreen() {
  const { t } = useTranslation();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<'1_month' | '1_year'>('1_year');

  const {
    isPro,
    customerInfo,
    currentOffering,
    isPurchasing,
    isRestoring,
    purchasePackage,
    restorePurchases,
    refreshSubscription,
    syncUserSession,
  } = useSubscription();

  const user = useAppStore((state) => state.user);
  const tokens = useAppStore((state) => state.tokens);
  const setUser = useAppStore((state) => state.setUser);
  const clearHomeScreenCache = useAppStore((state) => state.clearHomeScreenCache);
  const clearAnalyticsScreenCache = useAppStore((state) => state.clearAnalyticsScreenCache);

  React.useEffect(() => {
    if (user?.id) {
      void syncUserSession(user.id);
    }
  }, [user?.id]);

  // Extract Packages from RevenueCat Offering
  const monthlyPackage = currentOffering?.availablePackages.find(
    (p) => p.identifier === REVENUECAT_CONSTANTS.PACKAGE_MONTHLY || p.packageType === 'MONTHLY'
  );
  const annualPackage = currentOffering?.availablePackages.find(
    (p) => p.identifier === REVENUECAT_CONSTANTS.PACKAGE_YEARLY || p.packageType === 'ANNUAL'
  );

  // Extract active entitlement strictly from RevenueCat CustomerInfo
  const activeEntitlement = customerInfo?.entitlements.active[REVENUECAT_CONSTANTS.ENTITLEMENT_ID];

  // Match active entitlement's product identifier against RevenueCat offering packages
  const activeRcPackage = currentOffering?.availablePackages.find(
    (pkg) => pkg.product.identifier === activeEntitlement?.productIdentifier
  );

  // Check if active plan is yearly directly from RevenueCat SDK entitlement fields
  const entitlementPlanId = (
    activeEntitlement?.productPlanIdentifier ||
    activeEntitlement?.productIdentifier ||
    ''
  ).toLowerCase();

  const isYearlyActive =
    activeRcPackage?.packageType === 'ANNUAL' ||
    activeRcPackage?.identifier === REVENUECAT_CONSTANTS.PACKAGE_YEARLY ||
    entitlementPlanId.includes('yearly') ||
    entitlementPlanId.includes('yearly-plan') ||
    entitlementPlanId.includes('annual') ||
    entitlementPlanId.includes('1_year');

  const activePackage = isYearlyActive ? annualPackage : (monthlyPackage || activeRcPackage);

  // Extract cancellation status from RevenueCat
  const willRenew = activeEntitlement?.willRenew ?? true;
  const isCanceledButActive = isPro && !willRenew;

  // Formatted Plan Name (RevenueCat strictly via SDK packageType or product title)
  const activePlanName = isPro
    ? isYearlyActive
      ? 'Yearly Plan'
      : 'Monthly Plan'
    : 'No Active Subscription';

  // Formatted Cost (RevenueCat strictly)
  const activeCost = isPro
    ? activePackage?.product.priceString || (isYearlyActive ? annualPackage?.product.priceString : monthlyPackage?.product.priceString) || 'Active'
    : 'Free Plan';

  // Formatted Renewal Date / Expiration Date (RevenueCat strictly)
  const renewalDate = activeEntitlement?.expirationDate
    ? new Date(activeEntitlement.expirationDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  const handlePurchaseRcPackage = async (pkg: PurchasesPackage) => {
    const success = await purchasePackage(pkg);
    if (success) {
      showSuccessMessage('Subscription plan upgraded successfully!');
      await refreshSubscription();
    }
  };

  const handleRestoreRcPurchases = async () => {
    const success = await restorePurchases();
    if (success) {
      await refreshSubscription();
    }
  };

  const submitCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const response = await cancelUserSubscription();
      showSuccessMessage(response.message || t('subscription_canceled_successfully'));
      if (user) {
        setUser(
          {
            ...user,
            subscription_status: 'canceled',
            subscription_selection_required: true,
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

  const handleManageSubscription = () => {
    if (customerInfo?.managementURL) {
      void Linking.openURL(customerInfo.managementURL);
    } else {
      void Linking.openURL(
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/account/subscriptions'
          : 'https://play.google.com/store/account/subscriptions'
      );
    }
  };

  // Calculate dynamic savings percentage from RevenueCat packages
  const monthlyPricePerYear = monthlyPackage ? monthlyPackage.product.price * 12 : 0;
  const annualPrice = annualPackage ? annualPackage.product.price : 0;
  const savingsPercent = monthlyPricePerYear > 0 && annualPrice > 0
    ? Math.round(((monthlyPricePerYear - annualPrice) / monthlyPricePerYear) * 100)
    : 0;
  const badgeLabel = savingsPercent > 0 ? `UPGRADE & SAVE ${savingsPercent}%` : 'BEST VALUE';

  return (
    <View style={styles.container}>
      <Header title="Subscription" showBack={true} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Member Status Card */}
        <View style={[styles.activeCard, isCanceledButActive && { borderColor: '#EAB308' }]}>
          <View style={styles.activeHeaderRow}>
            <MaterialCommunityIcons
              name={isCanceledButActive ? 'clock-outline' : 'check-circle'}
              size={scale(24)}
              color={isCanceledButActive ? '#EAB308' : '#22C55E'}
            />
            <Text style={styles.activeTitle}>
              {isPro
                ? isCanceledButActive
                  ? 'Subscription Canceled'
                  : 'Active Premium Member'
                : 'Free Member'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Plan Type</Text>
            <Text style={styles.rowValue}>{activePlanName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Cost</Text>
            <Text style={styles.rowValue}>{activeCost}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              {isCanceledButActive ? 'Access Expires On' : 'Renewal Date'}
            </Text>
            <Text style={[styles.rowValue, isCanceledButActive && { color: '#EAB308' }]}>
              {renewalDate}
            </Text>
          </View>
        </View>

        {/* Plan Selection Section */}
        {isPro && !isCanceledButActive ? (
          /* Active Auto-Renewing Pro Member: Show Upgrade to Yearly Card if on Monthly */
          !isYearlyActive && annualPackage && (
            <View style={styles.upgradeCard}>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badgeLabel}</Text>
                </View>
              </View>

              <Text style={styles.upgradeTitle}>Switch to Yearly Plan</Text>
              <Text style={styles.upgradeSubtitle}>
                {savingsPercent > 0
                  ? `Get the same premium features for a full year and save ${savingsPercent}% compared to the monthly plan.`
                  : 'Get the same premium features for a full year at our best available rate.'}
              </Text>

              <View style={styles.comparisonRow}>
                <View style={styles.planSide}>
                  <Text style={styles.planSideTitle}>Monthly</Text>
                  <Text style={styles.priceMain} numberOfLines={1} adjustsFontSizeToFit>
                    {monthlyPackage?.product.priceString || 'BDT 4,800.00'}
                  </Text>
                  <Text style={styles.priceSub}>/month</Text>
                </View>

                <Feather name="arrow-right" size={scale(18)} color="#9CA3AF" style={styles.arrowIcon} />

                <View style={[styles.planSide, styles.yearlySideActive]}>
                  <Text style={styles.yearlyTitleText}>Yearly</Text>
                  <Text style={styles.yearlyPriceMain} numberOfLines={1} adjustsFontSizeToFit>
                    {annualPackage.product.priceString}
                  </Text>
                  <Text style={styles.yearlyPriceSub}>/year</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => { void handlePurchaseRcPackage(annualPackage); }}
                disabled={isPurchasing}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.upgradeButtonText}>Upgrade to Yearly</Text>
                )}
              </TouchableOpacity>
            </View>
          )
        ) : (
          /* Unsubscribed or Canceled: Interactive Selection for both Monthly and Yearly Plans */
          <View style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>
              {isCanceledButActive ? 'Renew Your Subscription' : 'Choose a Premium Plan'}
            </Text>
            <Text style={styles.upgradeSubtitle}>
              {isCanceledButActive
                ? 'Your auto-renew is off. Select a plan below to keep uninterrupted access when your period ends.'
                : 'Unlock full access to AI restaurant management insights, automated demand forecasting, and advanced analytics.'}
            </Text>

            {/* Toggle Row */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, selectedCycle === '1_month' && styles.toggleButtonActive]}
                onPress={() => setSelectedCycle('1_month')}
              >
                <Text style={[styles.toggleText, selectedCycle === '1_month' && styles.toggleTextActive]}>
                  Monthly Plan
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, selectedCycle === '1_year' && styles.toggleButtonActive]}
                onPress={() => setSelectedCycle('1_year')}
              >
                <Text style={[styles.toggleText, selectedCycle === '1_year' && styles.toggleTextActive]}>
                  Yearly Plan {savingsPercent > 0 ? `(Save ${savingsPercent}%)` : ''}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Selected Package Card Details */}
            {selectedCycle === '1_month' ? (
              <View style={styles.selectedPlanCard}>
                <Text style={styles.selectedPlanTitle}>Monthly Plan</Text>
                <View style={styles.priceRowClean}>
                  <Text style={styles.selectedPlanPrice} numberOfLines={1} adjustsFontSizeToFit>
                    {monthlyPackage?.product.priceString || 'BDT 4,800.00'}
                  </Text>
                  <Text style={styles.selectedPlanPeriod}>/month</Text>
                </View>
                <Text style={styles.planDesc}>Billed monthly. Cancel anytime in Google Play Store settings.</Text>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => { if (monthlyPackage) void handlePurchaseRcPackage(monthlyPackage); }}
                  disabled={isPurchasing || !monthlyPackage}
                >
                  {isPurchasing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.upgradeButtonText}>Subscribe Monthly</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.selectedPlanCard, { borderColor: '#FA8C4C', backgroundColor: '#FFF7ED' }]}>
                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeLabel}</Text>
                  </View>
                </View>
                <Text style={[styles.selectedPlanTitle, { color: '#FA8C4C' }]}>Yearly Plan</Text>
                <View style={styles.priceRowClean}>
                  <Text style={[styles.selectedPlanPrice, { color: '#FA8C4C' }]} numberOfLines={1} adjustsFontSizeToFit>
                    {annualPackage?.product.priceString || 'BDT 48,000.00'}
                  </Text>
                  <Text style={[styles.selectedPlanPeriod, { color: '#FA8C4C' }]}>/year</Text>
                </View>
                <Text style={styles.planDesc}>
                  Only BDT {annualPackage ? (annualPackage.product.price / 12).toFixed(2) : '4,000.00'} / month. Billed annually.
                </Text>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => { if (annualPackage) void handlePurchaseRcPackage(annualPackage); }}
                  disabled={isPurchasing || !annualPackage}
                >
                  {isPurchasing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.upgradeButtonText}>Subscribe Yearly</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Footer Notice */}
        <Text style={styles.footerLegalText}>
          Payments will be charged to your store account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period. You can manage or cancel your subscription at any time in your store account settings.
        </Text>

        {/* Bottom Actions */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.actionOutlineButton}
            onPress={handleManageSubscription}
          >
            {cancelLoading ? (
              <ActivityIndicator color="#22C55E" />
            ) : (
              <Text style={styles.actionOutlineText}>Manage Subscription</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionOutlineButton}
            onPress={() => { void handleRestoreRcPurchases(); }}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator color="#22C55E" />
            ) : (
              <Text style={styles.actionOutlineText}>Restore Purchases</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Legal Links */}
        <View style={styles.legalLinksRow}>
          <TouchableOpacity onPress={() => void Linking.openURL('https://ristoai.com/privacy')}>
            <Text style={styles.legalLinkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>•</Text>
          <TouchableOpacity onPress={() => void Linking.openURL('https://ristoai.com/terms')}>
            <Text style={styles.legalLinkText}>Terms of Use</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
    gap: verticalScale(20),
  },
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(18),
    borderWidth: 1,
    borderColor: '#FA8C4C',
  },
  activeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginBottom: verticalScale(14),
  },
  activeTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: verticalScale(14),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(6),
  },
  rowLabel: {
    fontSize: moderateScale(14, 0.3),
    color: '#6B7280',
  },
  rowValue: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  upgradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(18),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(10),
  },
  badge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(6),
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  badgeText: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '800',
    color: '#FA8C4C',
    letterSpacing: 0.5,
  },
  upgradeTitle: {
    fontSize: moderateScale(20, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(6),
  },
  upgradeSubtitle: {
    fontSize: moderateScale(13, 0.3),
    color: '#6B7280',
    lineHeight: moderateScale(18, 0.3),
    marginBottom: verticalScale(16),
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(18),
    gap: scale(6),
  },
  planSide: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: scale(12),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(10),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  yearlySideActive: {
    borderColor: '#FA8C4C',
    backgroundColor: '#FFF7ED',
  },
  planSideTitle: {
    fontSize: moderateScale(12, 0.3),
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: verticalScale(2),
  },
  yearlyTitleText: {
    fontSize: moderateScale(12, 0.3),
    color: '#FA8C4C',
    fontWeight: '700',
    marginBottom: verticalScale(2),
  },
  priceMain: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  priceSub: {
    fontSize: moderateScale(10, 0.3),
    color: '#6B7280',
    marginBottom: verticalScale(2),
  },
  yearlyPriceMain: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '800',
    color: '#FA8C4C',
  },
  yearlyPriceSub: {
    fontSize: moderateScale(10, 0.3),
    color: '#FA8C4C',
    marginBottom: verticalScale(2),
  },
  priceNote: {
    fontSize: moderateScale(10, 0.3),
    color: '#9CA3AF',
    marginTop: verticalScale(2),
  },
  yearlySaveNote: {
    fontSize: moderateScale(10, 0.3),
    color: '#FA8C4C',
    fontWeight: '700',
    marginTop: verticalScale(2),
  },
  arrowIcon: {
    marginHorizontal: scale(1),
  },
  upgradeButton: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(12),
    height: verticalScale(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
  },
  footerLegalText: {
    fontSize: moderateScale(11, 0.3),
    color: '#9CA3AF',
    lineHeight: moderateScale(16, 0.3),
    textAlign: 'center',
    paddingHorizontal: scale(10),
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  actionOutlineButton: {
    flex: 1,
    height: verticalScale(44),
    borderRadius: scale(12),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOutlineText: {
    color: '#FA8C4C',
    fontSize: moderateScale(13, 0.3),
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    padding: scale(4),
    marginBottom: verticalScale(16),
  },
  toggleButton: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    borderRadius: scale(10),
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FA8C4C',
    fontWeight: '700',
  },
  selectedPlanCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: scale(14),
    padding: scale(16),
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: verticalScale(6),
  },
  selectedPlanTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  priceRowClean: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: verticalScale(8),
    gap: scale(4),
  },
  selectedPlanPrice: {
    fontSize: moderateScale(22, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  selectedPlanPeriod: {
    fontSize: moderateScale(13, 0.3),
    color: '#6B7280',
    fontWeight: '500',
  },
  planDesc: {
    fontSize: moderateScale(13, 0.3),
    color: '#6B7280',
    marginBottom: verticalScale(14),
  },
  legalLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
  },
  legalLinkText: {
    fontSize: moderateScale(12, 0.3),
    color: '#FA8C4C',
    fontWeight: '600',
  },
  legalDot: {
    color: '#9CA3AF',
  },
});
