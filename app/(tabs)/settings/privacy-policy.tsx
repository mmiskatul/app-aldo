import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../../../components/ui/Header';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safeArea}>
      <Header title="Privacy Policy" showBack={true} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.content, { paddingBottom: verticalScale(40) + insets.bottom }]}
      >
        <Text style={styles.lastUpdated}>Effective Date: April 2026</Text>

        <Text style={styles.heroText}>
          Your privacy is critically important to us. We have fundamental principles that we follow when it comes to preserving the integrity of your operational records.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Information We Collect</Text>
          <Text style={styles.paragraph}>
            We only collect information about you if we have a reason to do so—for example, to provide our Services, to communicate with you, or to make our Services better. We collect information tracking your provided email, operational locations, and uploaded documents strictly explicitly managed via your Settings dashboard.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>How We Use Information</Text>
          <Text style={styles.paragraph}>
            <Text style={{ fontWeight: '600' }}>• Subscriptions & Usage:</Text> To bill you for active Pro tiers and manage backend payment gateways.{'\n\n'}
            <Text style={{ fontWeight: '600' }}>• Artificial Intelligence:</Text> We aggregate analytical patterns via standard AI insight generators locally without compromising cross-account data isolation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Security Commitments</Text>
          <Text style={styles.paragraph}>
            While no online service is 100% secure, we work very hard to protect information about you against unauthorized access, use, alteration, or destruction, and take reasonable measures to do so, such as monitoring our Services for potential vulnerabilities.
          </Text>
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
  content: {
    padding: scale(20),
  },
  lastUpdated: {
    fontSize: moderateScale(13, 0.3),
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: verticalScale(20),
  },
  heroText: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '600',
    color: '#374151',
    lineHeight: 24,
    marginBottom: verticalScale(24),
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionHeader: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(8),
  },
  paragraph: {
    fontSize: moderateScale(14, 0.3),
    color: '#4B5563',
    lineHeight: 24,
  },
});
