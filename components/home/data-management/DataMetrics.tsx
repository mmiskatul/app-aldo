import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cash01Icon, ShoppingCart01Icon, Wallet01Icon } from '@hugeicons/core-free-icons';
import Skeleton, { SkeletonCard } from '../../ui/Skeleton';

interface DataMetricsProps {
  loading?: boolean;
  revenue: string;
  expenses: string;
  profit: string;
  covers: string;
  averagePerCover: string;
}

export default function DataMetrics({
  loading = false,
  revenue,
  expenses,
  profit,
  covers,
  averagePerCover,
}: DataMetricsProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        {[0, 1, 2].map((item) => (
          <SkeletonCard key={item} style={styles.metricCard}>
            <View style={styles.cardHeader}>
              <Skeleton width={scale(110)} height={moderateScale(10)} borderRadius={5} />
              <Skeleton width={moderateScale(16)} height={moderateScale(16)} borderRadius={8} />
            </View>
            <Skeleton width={scale(120)} height={moderateScale(22)} borderRadius={8} />
          </SkeletonCard>
        ))}

        <View style={styles.splitRow}>
          {[0, 1].map((item) => (
            <SkeletonCard key={item} style={styles.splitCard}>
              <Skeleton width={scale(90)} height={moderateScale(10)} borderRadius={5} />
              <Skeleton width={scale(70)} height={moderateScale(18)} borderRadius={8} style={styles.gap8} />
            </SkeletonCard>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.metricCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Total Revenue</Text>
          <HugeiconsIcon icon={Cash01Icon} size={moderateScale(16)} color="#FA8C4C" />
        </View>
        <Text style={styles.amountText}>{revenue}</Text>
      </View>

      <View style={styles.metricCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Total Expenses</Text>
          <HugeiconsIcon icon={ShoppingCart01Icon} size={moderateScale(16)} color="#FA8C4C" />
        </View>
        <Text style={styles.amountText}>{expenses}</Text>
      </View>

      <View style={styles.metricCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Net Profit</Text>
          <HugeiconsIcon icon={Wallet01Icon} size={moderateScale(16)} color="#FA8C4C" />
        </View>
        <Text style={styles.amountText}>{profit}</Text>
      </View>

      <View style={styles.splitRow}>
        <View style={styles.splitCard}>
          <Text style={styles.cardTitleSmall}>Total Coperti</Text>
          <Text style={styles.amountTextSmall}>{covers}</Text>
        </View>

        <View style={styles.splitCard}>
          <Text style={styles.cardTitleSmall}>Avg. Rev/Cover</Text>
          <Text style={styles.amountTextSmall}>{averagePerCover}</Text>
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
  splitCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: 0,
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
  gap8: {
    marginTop: verticalScale(8),
  },
});
