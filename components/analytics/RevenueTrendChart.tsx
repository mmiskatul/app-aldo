import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const DATA = [
  { day: 'M', height: 40, active: false },
  { day: 'T', height: 60, active: false },
  { day: 'W', height: 50, active: false },
  { day: 'T', height: 80, active: true },
  { day: 'F', height: 45, active: false },
  { day: 'S', height: 0, active: false },
  { day: 'S', height: 0, active: false },
];

export default function RevenueTrendChart() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Revenue Trend</Text>
          <Text style={styles.value}>$12,450</Text>
        </View>
        <Text style={styles.trend}>+12.5% <Text style={styles.trendSub}>Last Week</Text></Text>
      </View>

      <View style={styles.chartContainer}>
        {DATA.map((item, index) => (
          <View key={index} style={styles.barGroup}>
            <View style={styles.barBackground}>
              <View 
                style={[
                  styles.bar, 
                  { height: `${item.height}%` },
                  item.active ? styles.barActive : styles.barInactive
                ]} 
              />
            </View>
            <Text style={[styles.dayText, item.active && styles.dayTextActive]}>{item.day}</Text>
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
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  value: {
    fontSize: moderateScale(24, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  trend: {
    fontSize: moderateScale(12, 0.3),
    color: '#10B981',
    fontWeight: '700',
    textAlign: 'right',
  },
  trendSub: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: verticalScale(120),
    alignItems: 'flex-end',
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barBackground: {
    width: scale(30),
    height: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: scale(6),
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: verticalScale(12),
  },
  bar: {
    width: '100%',
    borderRadius: scale(6),
  },
  barInactive: {
    backgroundColor: '#FB923C',
    opacity: 0.3,
  },
  barActive: {
    backgroundColor: '#FB923C',
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  dayText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '700',
    color: '#9CA3AF',
  },
  dayTextActive: {
    color: '#FB923C',
  },
});
