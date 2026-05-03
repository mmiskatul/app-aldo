import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTranslation } from '../../utils/i18n';

interface RevenueComparisonChartProps {
  comparison: Array<{ label: string; value: number }>;
}

export default function RevenueComparisonChart({ comparison }: RevenueComparisonChartProps) {
  const maxValue = Math.max(...comparison.map(item => item.value), 1);
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('revenue_comparison')}</Text>
      
      {comparison.map((item, index) => {
        const widthPercent = (item.value / maxValue) * 100;
        const color = index === 0 ? '#FB923C' : '#CBD5E1';
        
        return (
          <View key={index} style={styles.row}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>€{item.value.toLocaleString()}</Text>
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { width: `${widthPercent}%`, backgroundColor: color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(20),
  },
  row: {
    marginBottom: verticalScale(16),
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  label: {
    fontSize: moderateScale(12, 0.3),
    color: '#6B7280',
    fontWeight: '500',
  },
  value: {
    fontSize: moderateScale(12, 0.3),
    color: '#111827',
    fontWeight: '700',
  },
  barContainer: {
    height: verticalScale(8),
    backgroundColor: '#F1F5F9',
    borderRadius: scale(4),
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: scale(4),
  },
});
