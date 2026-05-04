import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '../../utils/i18n';
import Skeleton from '../ui/Skeleton';

interface ActivityCostData {
  label: string;
  value: number | string;
}

interface ActivityCostSectionProps {
  coversActivity: ActivityCostData[];
  costBreakdown: ActivityCostData[];
  coversLoading?: boolean;
  costLoading?: boolean;
}

export default function ActivityCostSection({ coversActivity, costBreakdown, coversLoading = false, costLoading = false }: ActivityCostSectionProps) {
  const { t } = useTranslation();

  const formatPercent = (value: number | string) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return '0%';
    }

    const rounded = Math.round(numericValue * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
  };

  return (
    <View style={styles.container}>
      {/* Covers Activity */}
      <View style={styles.card}>
        <Text style={styles.title}>{t('covers_activity')}</Text>
        {coversLoading ? (
          <>
            {[0, 1].map((row) => (
              <View key={row} style={styles.row}>
                <View style={styles.subRow}>
                  <Skeleton width={moderateScale(14)} height={moderateScale(14)} borderRadius={7} />
                  <Skeleton width="48%" height={moderateScale(11)} borderRadius={6} style={styles.labelSkeleton} />
                </View>
                <Skeleton width="18%" height={moderateScale(12)} borderRadius={6} />
              </View>
            ))}
          </>
        ) : coversActivity.map((item, index) => (
          <View key={index} style={styles.row}>
            <View style={styles.subRow}>
              <Feather 
                name={index === 0 ? 'sun' : 'moon'} 
                size={moderateScale(14)} 
                color={index === 0 ? '#F59E0B' : '#6366F1'} 
              />
              <Text style={styles.label}>{item.label}</Text>
            </View>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Cost % */}
      <View style={styles.card}>
        <Text style={styles.title}>{t('cost_percentage')}</Text>
        {costLoading ? (
          <>
            {[0, 1].map((row) => (
              <View key={row} style={styles.row}>
                <Skeleton width="42%" height={moderateScale(11)} borderRadius={6} />
                <Skeleton width="18%" height={moderateScale(12)} borderRadius={6} />
              </View>
            ))}
          </>
        ) : costBreakdown.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={[styles.value, { color: index === 0 ? '#EF4444' : '#F59E0B' }]}>
              {formatPercent(item.value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: scale(-5),
    marginBottom: verticalScale(18),
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(14),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(15),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: scale(5),
    minHeight: verticalScale(104),
  },
  title: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(15),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: moderateScale(11, 0.3),
    color: '#64748B',
    fontWeight: '600',
    marginLeft: scale(6),
  },
  labelSkeleton: {
    marginLeft: scale(6),
  },
  value: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
});
