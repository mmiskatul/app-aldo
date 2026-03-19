import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';

export default function SummaryCards() {
  return (
    <View style={styles.container}>
      {/* Estimated Profit */}
      <View style={styles.card}>
        <Text style={styles.label}>Estimated Profit</Text>
        <Text style={styles.value}>$4,820</Text>
        <View style={styles.trendContainer}>
          <Feather name="trending-up" size={moderateScale(14)} color="#10B981" />
          <Text style={styles.trendText}>+8.2%</Text>
        </View>
      </View>

      {/* Peak Hour */}
      <View style={styles.card}>
        <Text style={styles.label}>Peak Hour</Text>
        <Text style={styles.value}>7:00 PM</Text>
        <Text style={styles.subtext}>92% Capacity Avg</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(24),
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginHorizontal: scale(4),
  },
  label: {
    fontSize: moderateScale(12, 0.3),
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: verticalScale(8),
  },
  value: {
    fontSize: moderateScale(20, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: moderateScale(11, 0.3),
    color: '#10B981',
    fontWeight: '700',
    marginLeft: scale(4),
  },
  subtext: {
    fontSize: moderateScale(11, 0.3),
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
