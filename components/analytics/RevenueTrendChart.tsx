import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTranslation } from '../../utils/i18n';

interface RevenueTrendChartProps {
  weeklyRevenue: { label: string; value: number }[];
  totalRevenue: number;
  changePercent: number;
}

const formatCurrency = (value: number) => `€${Math.round(value).toLocaleString()}`;

export default function RevenueTrendChart({
  weeklyRevenue,
  totalRevenue,
  changePercent,
}: RevenueTrendChartProps) {
  const { t } = useTranslation();
  const maxValue = Math.max(...weeklyRevenue.map((item) => item.value), 1);
  const peakValue = Math.max(...weeklyRevenue.map((item) => item.value), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('revenue_trend')}</Text>
          <Text style={styles.value}>{formatCurrency(totalRevenue)}</Text>
        </View>
        <View style={styles.changeBlock}>
          <Text style={[styles.trend, { color: changePercent >= 0 ? '#10B981' : '#EF4444' }]}>
            {changePercent >= 0 ? '+' : ''}
            {changePercent}%
          </Text>
          <Text style={styles.trendSub}>{t('last_week')}</Text>
        </View>
      </View>

      <View style={styles.chartArea}>
        {weeklyRevenue.map((item, index) => {
          const barHeight = Math.max(verticalScale(18), (item.value / maxValue) * verticalScale(104));
          const isActive = item.value === peakValue && peakValue > 0;

          return (
            <View key={`${item.label}-${index}`} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: isActive ? '#FF8748' : '#F7C9AD',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.axisLabel, isActive ? styles.axisLabelActive : null]}>
                {item.label.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(14),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: verticalScale(18),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(18),
  },
  title: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(6),
  },
  value: {
    fontSize: moderateScale(24, 0.3),
    fontWeight: '900',
    color: '#111827',
  },
  changeBlock: {
    alignItems: 'flex-end',
    paddingTop: verticalScale(21),
  },
  trend: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '800',
  },
  trendSub: {
    fontSize: moderateScale(10, 0.3),
    color: '#A3ADBC',
    fontWeight: '600',
  },
  chartArea: {
    height: verticalScale(158),
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: scale(2),
  },
  barColumn: {
    width: scale(28),
    alignItems: 'center',
  },
  barTrack: {
    height: verticalScale(124),
    width: scale(28),
    borderRadius: scale(6),
    backgroundColor: '#F1F5F9',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: scale(6),
    borderTopRightRadius: scale(6),
  },
  axisLabel: {
    marginTop: verticalScale(10),
    fontSize: moderateScale(9, 0.3),
    color: '#94A3B8',
    fontWeight: '800',
  },
  axisLabelActive: {
    color: '#FF8748',
  },
});
