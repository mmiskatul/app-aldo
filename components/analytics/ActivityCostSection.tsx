import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';

export default function ActivityCostSection() {
  return (
    <View style={styles.container}>
      {/* Covers Activity */}
      <View style={styles.card}>
        <Text style={styles.title}>Covers Activity</Text>
        <View style={styles.row}>
          <View style={styles.subRow}>
            <Feather name="sun" size={moderateScale(14)} color="#F59E0B" />
            <Text style={styles.label}>Lunch</Text>
          </View>
          <Text style={styles.value}>312</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.subRow}>
            <Feather name="moon" size={moderateScale(14)} color="#6366F1" />
            <Text style={styles.label}>Dinner</Text>
          </View>
          <Text style={styles.value}>530</Text>
        </View>
      </View>

      {/* Cost % */}
      <View style={styles.card}>
        <Text style={styles.title}>Cost %</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Food Cost</Text>
          <Text style={[styles.value, { color: '#EF4444' }]}>28%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Staff Cost</Text>
          <Text style={[styles.value, { color: '#F59E0B' }]}>32%</Text>
        </View>
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
  title: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: moderateScale(11, 0.3),
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: scale(6),
  },
  value: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
});
