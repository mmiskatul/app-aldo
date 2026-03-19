import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cash01Icon, ShoppingCart01Icon, Wallet01Icon } from '@hugeicons/core-free-icons';

export default function DataMetrics() {
  return (
    <View style={styles.container}>
      {/* Revenue Card */}
      <View style={styles.metricCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Today's Revenue</Text>
          <HugeiconsIcon icon={Cash01Icon} size={moderateScale(16)} color="#FA8C4C" />
        </View>
        <Text style={styles.amountText}>€ 1,240.50</Text>
      </View>

      {/* Expenses Card */}
      <View style={styles.metricCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Total Expenses</Text>
          <HugeiconsIcon icon={ShoppingCart01Icon} size={moderateScale(16)} color="#FA8C4C" />
        </View>
        <Text style={styles.amountText}>€ 600.50</Text>
      </View>

      {/* Profit Card */}
      <View style={styles.metricCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Profit</Text>
          <HugeiconsIcon icon={Wallet01Icon} size={moderateScale(16)} color="#FA8C4C" />
        </View>
        <Text style={styles.amountText}>€ 640.50</Text>
      </View>

      {/* Split Row for Covers & Avg Rev */}
      <View style={styles.splitRow}>
        <View style={[styles.metricCard, { flex: 1, marginRight: scale(6), marginBottom: 0 }]}>
          <Text style={styles.cardTitleSmall}>Total Covers</Text>
          <Text style={styles.amountTextSmall}>42</Text>
        </View>
        
        <View style={[styles.metricCard, { flex: 1, marginLeft: scale(6), marginBottom: 0 }]}>
          <Text style={styles.cardTitleSmall}>Avg. Rev/Cover</Text>
          <Text style={styles.amountTextSmall}>$29.53</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(20),
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  cardTitle: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '600',
    color: '#6B7280',
  },
  amountText: {
    fontSize: moderateScale(22, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitleSmall: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: verticalScale(8),
  },
  amountTextSmall: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
});
