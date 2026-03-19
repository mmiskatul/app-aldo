import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';

export default function RevenueBreakdownCard() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="credit-card" size={moderateScale(18)} color="#A16207" style={styles.icon} />
        <Text style={styles.title}>Revenue Breakdown</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.labelGroup}>
          <View style={[styles.dot, { backgroundColor: '#A16207' }]} />
          <Text style={styles.label}>POS Payments</Text>
        </View>
        <Text style={styles.value}>€800</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.labelGroup}>
          <View style={[styles.dot, { backgroundColor: '#475569' }]} />
          <Text style={styles.label}>Cash Payments</Text>
        </View>
        <Text style={styles.value}>€300</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.labelGroup}>
          <View style={[styles.dot, { backgroundColor: '#D4A373' }]} />
          <Text style={styles.label}>Bank Transfer</Text>
        </View>
        <Text style={styles.value}>€200</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  icon: {
    marginRight: scale(8),
  },
  title: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    marginRight: scale(12),
  },
  label: {
    fontSize: moderateScale(14, 0.3),
    color: '#374151',
    fontWeight: '500',
  },
  value: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
});
