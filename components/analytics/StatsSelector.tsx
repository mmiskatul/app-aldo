import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const TABS = [
  { label: 'Revenue', value: '$12.4k', active: true },
  { label: 'Covers', value: '842', active: false },
  { label: 'Avg Rev', value: '$14.78', active: false },
];

export default function StatsSelector() {
  return (
    <View style={styles.container}>
      {TABS.map((tab, index) => (
        <TouchableOpacity 
          key={index} 
          style={[styles.tab, tab.active && styles.tabActive]}
          activeOpacity={0.7}
        >
          <Text style={[styles.label, tab.active && styles.labelActive]}>{tab.label}</Text>
          <Text style={[styles.value, tab.active && styles.valueActive]}>{tab.value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(24),
  },
  tab: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    padding: scale(12),
    marginHorizontal: scale(4),
  },
  tabActive: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  label: {
    fontSize: moderateScale(10, 0.3),
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: verticalScale(4),
    textTransform: 'uppercase',
  },
  labelActive: {
    color: '#FB923C',
  },
  value: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  valueActive: {
    color: '#111827',
  },
});
