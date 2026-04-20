import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import React, { useState } from 'react';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../../../components/ui/Header';
import { useAppStore } from '../../../store/useAppStore';

export default function ManageSubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((state) => state.profile);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const AvatarRight = () => (
    <Image 
      source={{ uri: profile?.profile_image_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' }} 
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

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.content, { paddingBottom: verticalScale(40) + insets.bottom }]}
      >
        {/* Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, billingCycle === 'monthly' && styles.toggleButtonActive]}
            onPress={() => setBillingCycle('monthly')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, billingCycle === 'monthly' && styles.toggleTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, billingCycle === 'yearly' && styles.toggleButtonActive]}
            onPress={() => setBillingCycle('yearly')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, billingCycle === 'yearly' && styles.toggleTextActive]}>
              Yearly (2 months free)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Plan Card */}
        <View style={styles.cardContainer}>
          {/* BEST VALUE Badge overlaps top right */}
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>

          <Text style={styles.planTitle}>Pro Plan</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>{billingCycle === 'monthly' ? '$29' : '$290'}</Text>
            <Text style={styles.pricePeriod}>{billingCycle === 'monthly' ? '/ month' : '/ year'}</Text>
          </View>
          
          <Text style={styles.trialText}>7-day free trial included</Text>

          <View style={styles.featuresList}>
            {[
              'Unlimited invoice scanning',
              'Advanced AI insights',
              'Revenue and cost analytics',
              'Performance reports',
              'Supplier price alerts'
            ].map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <View style={styles.checkIcon}>
                  <Feather name="check" size={moderateScale(12)} color="#B45309" />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Upgrade Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Manage Payment Methods</Text>
          </TouchableOpacity>
        </View>

        {/* Billing Transparency */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Billing Transparency</Text>
          <Text style={styles.infoText}>
            Subscriptions are billed {billingCycle === 'monthly' ? 'monthly' : 'annually'}. You will be notified 3 days before your trial ends on April 17, 2026.
          </Text>
        </View>

        <TouchableOpacity style={styles.cancelButton}>
          <Feather name="x-circle" size={moderateScale(18)} color="#DC2626" />
          <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Need help with your plan? </Text>
          <TouchableOpacity>
            <Text style={styles.supportText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    // Orange shadow layout
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
    marginBottom: verticalScale(16),
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
    marginBottom: verticalScale(24),
  },
  featuresList: {
    gap: verticalScale(16),
    marginBottom: verticalScale(32),
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
  secondaryButtonText: {
    color: '#374151',
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: scale(12),
    padding: scale(20),
    marginBottom: verticalScale(40),
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
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    marginBottom: verticalScale(40),
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: verticalScale(20)
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: moderateScale(14, 0.3),
  },
  supportText: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: moderateScale(14, 0.3),
  },
});
