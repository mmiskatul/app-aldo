import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import {
  EyeIcon,
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from 'react-native-heroicons/outline';
import Skeleton, { SkeletonCard } from '../ui/Skeleton';
import { useTranslation } from '../../utils/i18n';

interface KPIItemProps {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  IconComponent: any;
  iconColor: string;
  iconBgColor: string;
}

const KPICard = ({
  title,
  value,
  trend,
  isPositive,
  IconComponent,
  iconColor,
  iconBgColor,
}: KPIItemProps) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <IconComponent size={moderateScale(14)} color={iconColor} />
        </View>
        <View style={styles.trendContainer}>
          {isPositive ? (
            <ArrowTrendingUpIcon size={moderateScale(10)} color="#10B981" />
          ) : (
            <ArrowTrendingDownIcon size={moderateScale(10)} color="#EF4444" />
          )}
          <Text
            style={[
              styles.trendText,
              { color: isPositive ? '#10B981' : '#EF4444' },
            ]}
          >
            {trend}
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
};

interface KPIGridProps {
  metrics?: {
    label: string;
    value: number;
    change_percent: number;
    currency: string;
  }[];
  loading?: boolean;
}

export default function KPIGrid({ metrics, loading = false }: KPIGridProps) {
  const { t } = useTranslation();

  const getIconData = (label: string) => {
    switch (label.toLowerCase()) {
      case 'revenue':
        return {
          IconComponent: EyeIcon,
          iconColor: '#FA8C4C',
          iconBgColor: '#FFF0E5',
        };
      case 'expenses':
        return {
          IconComponent: ClipboardDocumentListIcon,
          iconColor: '#EF4444',
          iconBgColor: '#FEE2E2',
        };
      case 'food cost':
        return {
          IconComponent: ShoppingBagIcon,
          iconColor: '#D97706',
          iconBgColor: '#FEF3C7',
        };
      case 'profit':
        return {
          IconComponent: ChartPieIcon,
          iconColor: '#10B981',
          iconBgColor: '#D1FAE5',
        };
      default:
        return {
          IconComponent: EyeIcon,
          iconColor: '#9CA3AF',
          iconBgColor: '#F3F4F6',
        };
    }
  };

  const getTranslatedMetricTitle = (label: string) => {
    switch (label.trim().toLowerCase()) {
      case 'revenue':
        return t('revenue');
      case 'expenses':
        return t('expenses');
      case 'food cost':
        return t('food_cost');
      case 'profit':
        return t('profit');
      default:
        return label;
    }
  };

  const parseCurrency = (currency: string) => {
    if (currency === 'USD') return '€';
    if (currency === 'EUR') return '€';
    return '€';
  };

  const kpiData: KPIItemProps[] =
    metrics && metrics.length > 0
      ? metrics.map((metric) => ({
          title: getTranslatedMetricTitle(metric.label),
          value: `${parseCurrency(metric.currency)}${metric.value.toLocaleString(
            undefined,
            { minimumFractionDigits: 1, maximumFractionDigits: 1 }
          )}`,
          trend: `${Math.abs(metric.change_percent)}%`,
          isPositive: metric.change_percent >= 0,
          ...getIconData(metric.label),
        }))
      : [];

  if (loading) {
    return (
      <View style={styles.gridContainer}>
        {[0, 1].map((rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {[0, 1].map((columnIndex) => (
              <SkeletonCard
                key={`${rowIndex}-${columnIndex}`}
                style={styles.skeletonCard}
              >
                <View style={styles.cardHeader}>
                  <Skeleton
                    width={scale(32)}
                    height={scale(32)}
                    borderRadius={8}
                  />
                  <Skeleton
                    width={scale(44)}
                    height={moderateScale(10)}
                    borderRadius={6}
                  />
                </View>
                <Skeleton
                  width="52%"
                  height={moderateScale(12)}
                  borderRadius={6}
                />
                <Skeleton
                  width="74%"
                  height={moderateScale(20)}
                  borderRadius={8}
                  style={styles.valueSkeleton}
                />
              </SkeletonCard>
            ))}
          </View>
        ))}
      </View>
    );
  }

  if (kpiData.length === 0) {
    return null;
  }

  return (
    <View style={styles.gridContainer}>
      <View style={styles.row}>
        {kpiData[0] && <KPICard {...kpiData[0]} />}
        {kpiData[1] && <KPICard {...kpiData[1]} />}
      </View>
      <View style={styles.row}>
        {kpiData[2] && <KPICard {...kpiData[2]} />}
        {kpiData[3] && <KPICard {...kpiData[3]} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    marginBottom: verticalScale(20),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(16),
    marginHorizontal: scale(4),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  iconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '700',
    marginLeft: scale(4),
  },
  cardTitle: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: verticalScale(4),
  },
  cardValue: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  skeletonCard: {
    flex: 1,
    marginHorizontal: scale(4),
    padding: scale(16),
  },
  valueSkeleton: {
    marginTop: verticalScale(10),
  },
});
