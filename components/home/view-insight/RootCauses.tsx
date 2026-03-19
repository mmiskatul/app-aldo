import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { ChartBarSquareIcon } from 'react-native-heroicons/outline';

const causes = [
  "Supplier price increase (Poultry & Dairy)",
  "Higher ingredient usage in main courses",
  "Increased food waste in prep station"
];

export default function RootCauses() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ChartBarSquareIcon size={moderateScale(20)} color="#D97706" />
        <Text style={styles.headerTitle}>Root Causes</Text>
      </View>
      
      {causes.map((cause, index) => (
        <View key={index} style={styles.causeItem}>
          <View style={styles.bullet} />
          <Text style={styles.causeText}>{cause}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  headerTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginLeft: scale(8),
  },
  causeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: scale(16),
    borderRadius: scale(12),
    marginBottom: verticalScale(12),
  },
  bullet: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#D97706',
    marginRight: scale(12),
  },
  causeText: {
    fontSize: moderateScale(14, 0.3),
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
});
