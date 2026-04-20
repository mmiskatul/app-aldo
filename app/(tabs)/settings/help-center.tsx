import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Linking
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '../../../components/ui/Header';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.faqContainer}>
      <TouchableOpacity 
        style={styles.faqHeader} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={[styles.faqQuestion, expanded && { color: '#0EA5E9' }]}>{question}</Text>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={moderateScale(18)} color="#9CA3AF" />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.faqBody}>
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function HelpCenterScreen() {
  const insets = useSafeAreaInsets();

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@tourmate.test');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+1234567890');
  };

  return (
    <View style={styles.safeArea}>
      <Header title="Help Center" showBack={true} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.content, { paddingBottom: verticalScale(40) + insets.bottom }]}
      >
        <Text style={styles.heroTitle}>How can we help you today?</Text>
        
        {/* Contact Actions */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={handleEmailSupport} activeOpacity={0.8}>
            <View style={[styles.iconBox, { backgroundColor: '#F0F9FF' }]}>
              <Feather name="mail" size={moderateScale(24)} color="#0EA5E9" />
            </View>
            <Text style={styles.contactCardTitle}>Email Us</Text>
            <Text style={styles.contactCardSubtitle}>support@tourmate.test</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleCallSupport} activeOpacity={0.8}>
            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
              <Feather name="phone-call" size={moderateScale(24)} color="#10B981" />
            </View>
            <Text style={styles.contactCardTitle}>Call Us</Text>
            <Text style={styles.contactCardSubtitle}>Mon-Fri, 9am - 5pm</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <FAQItem 
            question="How do I change my subscription plan?" 
            answer="You can modify your currently active plan anytime by navigating to 'Manage Subscription' under your main settings. Changes will be pro-rated immediately against your payment method."
          />
          <FAQItem 
            question="Where can I update my restaurant details?" 
            answer="Click on 'Edit Profile' from the main Settings dashboard. You can alter your restaurant's name, type, and seating capacities from there."
          />
          <FAQItem 
            question="Is my financial data secure?" 
            answer="Absolutely! Your invoice data and account metrics are fully encrypted. We never share raw financial components without explicit consent via our platform API agreements."
          />
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
  heroTitle: {
    fontSize: moderateScale(22, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(24),
    textAlign: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(16),
    marginBottom: verticalScale(32),
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: scale(16),
    padding: scale(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  contactCardTitle: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  contactCardSubtitle: {
    fontSize: moderateScale(11, 0.3),
    color: '#6B7280',
    textAlign: 'center',
  },
  faqSection: {
    marginTop: verticalScale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  faqContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: verticalScale(8),
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
  },
  faqQuestion: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    paddingRight: scale(16),
  },
  faqBody: {
    paddingBottom: verticalScale(16),
    paddingRight: scale(16),
  },
  faqAnswer: {
    fontSize: moderateScale(13, 0.3),
    color: '#6B7280',
    lineHeight: 20,
  },
});
