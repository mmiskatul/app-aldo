import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';

export default function CoversCard() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="users" size={moderateScale(16)} color="#111827" style={styles.icon} />
        <Text style={styles.title}>Coperti</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Lunch Coperti</Text>
        <Text style={styles.value}>45</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Dinner Coperti</Text>
        <Text style={styles.value}>60</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.totalValue}>105</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: scale(16),
    padding: scale(16),
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
    marginBottom: verticalScale(8),
  },
  label: {
    fontSize: moderateScale(13, 0.3),
    color: '#6B7280',
    fontWeight: '500',
  },
  value: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: verticalScale(8),
  },
  totalLabel: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  totalValue: {
    fontSize: moderateScale(20, 0.3),
    fontWeight: '800',
    color: '#B45309', // Dark orange/brown
  },
});
