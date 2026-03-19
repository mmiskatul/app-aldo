import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { ArrowTrendingUpIcon } from 'react-native-heroicons/solid';

export default function InsightSummaryCard() {
  const chartData = [
    { day: 'MON', height: verticalScale(50), color: '#E5E7EB' },
    { day: 'TUE', height: verticalScale(70), color: '#E5E7EB' },
    { day: 'WED', height: verticalScale(60), color: '#E5E7EB' },
    { day: 'THU', height: verticalScale(80), color: '#E5E7EB' },
    { day: 'FRI', height: verticalScale(90), color: '#E5E7EB' },
    { day: 'SAT', height: verticalScale(100), color: '#FDE68A' }, // Yellowish
    { day: 'SUN', height: verticalScale(120), color: '#FB923C' }, // Orange
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>HIGH PRIORITY</Text>
        </View>
        <View style={styles.trendIconContainer}>
          <ArrowTrendingUpIcon size={moderateScale(18)} color="#EF4444" />
        </View>
      </View>
      
      <Text style={styles.title}>Food Cost Increased</Text>
      <View style={styles.statsContainer}>
        <Text style={styles.percentage}>12%</Text>
        <Text style={styles.subtext}>increase this week</Text>
      </View>
      
      <View style={styles.chartContainer}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.barColumn}>
            <View 
              style={[
                styles.bar, 
                { height: item.height, backgroundColor: item.color }
              ]} 
            />
            <Text style={styles.dayLabel}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  badge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(4),
  },
  badgeText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '700',
    color: '#EF4444',
  },
  trendIconContainer: {
    backgroundColor: '#FEE2E2',
    padding: scale(8),
    borderRadius: scale(8),
  },
  title: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(8),
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: verticalScale(24),
  },
  percentage: {
    fontSize: moderateScale(32, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginRight: scale(8),
  },
  subtext: {
    fontSize: moderateScale(14, 0.3),
    color: '#6B7280',
    fontStyle: 'italic',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: verticalScale(140),
  },
  barColumn: {
    alignItems: 'center',
    width: scale(30),
  },
  bar: {
    width: scale(22),
    borderRadius: scale(4),
    marginBottom: verticalScale(8),
  },
  dayLabel: {
    fontSize: moderateScale(10, 0.3),
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
