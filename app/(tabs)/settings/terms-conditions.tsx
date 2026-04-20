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

export default function TermsConditionsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safeArea}>
      <Header title="Terms & Conditions" showBack={true} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.content, { paddingBottom: verticalScale(40) + insets.bottom }]}
      >
        <Text style={styles.lastUpdated}>Last updated: April 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>2. Application Use</Text>
          <Text style={styles.paragraph}>
            This application and its components are offered for informational and managerial purposes regarding restaurant operations. This app makes no representation whatsoever regarding the completeness of the data presented and shall not be responsible or liable for the accuracy or availability.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>3. Data Ownership</Text>
          <Text style={styles.paragraph}>
            Your financial data and user profiles remain your intellectual property. By uploading it, you grant us the necessary functional licenses to persist securely and display your information to properly render operational dashboard tasks outlined within the tool.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>4. Modifications</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms from time to time at our sole discretion. Therefore, you should review these pages periodically. Your continued use of the application after any such change constitutes your acceptance of the new Terms.
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
