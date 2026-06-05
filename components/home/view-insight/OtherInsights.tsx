import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { BanknotesIcon, ReceiptPercentIcon } from 'react-native-heroicons/outline';
import { useTranslation } from '../../../utils/i18n';

interface Insight {
  label: string;
  value: string;
  subtitle?: string | null;
}

interface OtherInsightsProps {
  insights?: Insight[];
}

export default function OtherInsights({ insights = [] }: OtherInsightsProps) {
  const { t } = useTranslation();
  if (!insights || insights.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{t('other_related_insights')}</Text>
      
      <View style={styles.list}>
        {insights.map((insight, index) => {
          // Dynamic Icon assignment can be done here. Let's vary by index if we must, or default.
          const IconComponent = index % 2 === 0 
            ? <BanknotesIcon size={moderateScale(18)} color="#EF4444" /> 
            : <ReceiptPercentIcon size={moderateScale(18)} color="#FB923C" />;
            
          return (
            <View key={index} style={styles.card}>
              <View style={styles.iconContainer}>
                {IconComponent}
              </View>
              <Text style={styles.title}>{insight.label}</Text>
              <Text style={styles.value}>{insight.value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(32),
  },
  headerTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  list: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: verticalScale(12),
  },
  title: {
    fontSize: moderateScale(12, 0.3),
    color: '#6B7280',
    marginBottom: verticalScale(4),
  },
  value: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
});
