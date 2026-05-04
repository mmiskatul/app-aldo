import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTranslation } from '../../utils/i18n';

interface RevenueComparisonChartProps {
  comparison: Array<{ label: string; value: number }>;
}

export default function RevenueComparisonChart({ comparison }: RevenueComparisonChartProps) {
  const maxValue = Math.max(...comparison.map((item) => item.value), 1);
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('revenue_comparison')}</Text>

      {comparison.slice(0, 2).map((item, index) => {
        const widthPercent = (item.value / maxValue) * 100;
        const color = index === 0 ? '#FF8748' : '#CBD5E1';

        return (
          <View key={`${item.label}-${index}`} style={styles.row}>
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
    borderRadius: scale(14),
    padding: scale(18),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: verticalScale(18),
  },
  title: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(18),
  },
  row: {
    marginBottom: verticalScale(14),
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(7),
  },
  label: {
    fontSize: moderateScale(11, 0.3),
    color: '#64748B',
    fontWeight: '600',
  },
  value: {
    fontSize: moderateScale(11, 0.3),
    color: '#111827',
    fontWeight: '800',
  },
  barContainer: {
    height: verticalScale(7),
    backgroundColor: '#EDF2F7',
    borderRadius: scale(4),
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: scale(4),
  },
});
