import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function RevenueComparisonChart() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Revenue Comparison</Text>
      
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>This Week Revenue</Text>
          <Text style={styles.value}>$12,450</Text>
        </View>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: '100%', backgroundColor: '#FB923C' }]} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Last Week Revenue</Text>
          <Text style={styles.value}>$11,060</Text>
        </View>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: '85%', backgroundColor: '#CBD5E1' }]} />
        </View>
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
