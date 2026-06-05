import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTranslation } from '../../../utils/i18n';

interface QuickSummaryProps {
  todayTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
  topCategory: string;
}

export default function QuickSummary({ 
  todayTotal, 
  weeklyTotal, 
  monthlyTotal, 
  topCategory 
}: QuickSummaryProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('quick_summary').toUpperCase()}</Text>
      
      <View style={styles.grid}>
        <View style={styles.row}>
          <View style={[styles.card, styles.highlightCard]}>
            <Text style={styles.highlightTitle}>{t('today')}</Text>
            <Text style={styles.highlightValue}>€{todayTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('this_week')}</Text>
            <Text style={styles.cardValue}>€{weeklyTotal.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('this_month')}</Text>
            <Text style={styles.cardValue}>€{monthlyTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('top_category')}</Text>
            <Text style={styles.cardValue}>{topCategory || t('not_available')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
    marginBottom: verticalScale(16),
  },
  grid: {
    gap: scale(12),
  },
  row: {
    flexDirection: 'row',
    gap: scale(12),
    marginBottom: verticalScale(12),
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  highlightCard: {
    backgroundColor: '#FFF6F0',
    borderColor: '#FCE7D6',
  },
  highlightTitle: {
    fontSize: moderateScale(12, 0.3),
    color: '#FA8C4C',
    fontWeight: '600',
    marginBottom: verticalScale(8),
  },
  highlightValue: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  cardTitle: {
    fontSize: moderateScale(12, 0.3),
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: verticalScale(8),
  },
  cardValue: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
});
