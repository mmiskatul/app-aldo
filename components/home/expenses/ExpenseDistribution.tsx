import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { useTranslation } from '../../../utils/i18n';

interface DistributionItem {
  label: string;
  percentage: number;
}

interface ExpenseDistributionProps {
  distribution: DistributionItem[];
}

const COLORS = ['#FA8C4C', '#94A3B8', '#E2E8F0', '#FDBA74', '#64748B'];

export default function ExpenseDistribution({ distribution = [] }: ExpenseDistributionProps) {
  const { t } = useTranslation();
  const size = moderateScale(100);
  const strokeWidth = moderateScale(12);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculate rotations and stroke lengths
  let currentRotation = -90;
  
  if (distribution.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('expense_distribution')}</Text>
        </View>
        <View style={[styles.content, { justifyContent: 'center', paddingVertical: verticalScale(20) }]}>
          <Text style={{ color: '#9CA3AF', fontSize: moderateScale(14) }}>{t('no_data_available')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('expense_distribution')}</Text>
        <Feather name="info" size={moderateScale(16)} color="#9CA3AF" />
      </View>

      <View style={styles.content}>
        <View style={styles.chartContainer}>
          <Svg width={size} height={size}>
            <G origin={`${size / 2}, ${size / 2}`}>
              {distribution.map((item, index) => {
                const strokeLength = (item.percentage / 100) * circumference;
                const rotation = currentRotation;
                currentRotation += (360 * (item.percentage / 100));
                
                return (
                  <Circle
                    key={index}
                    rotation={rotation}
                    origin={`${size / 2}, ${size / 2}`}
                    stroke={COLORS[index % COLORS.length]}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                  />
                );
              })}
            </G>
            <SvgText
              fill="#111827"
              fontSize={moderateScale(14, 0.3)}
              fontWeight="800"
              x={size / 2}
              y={size / 2 + moderateScale(4)}
              textAnchor="middle"
            >
              {distribution[0]?.percentage || 0}%
            </SvgText>
          </Svg>
        </View>

        <View style={styles.legendContainer}>
          {distribution.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={styles.legendLabelGroup}>
                <View style={[styles.dot, { backgroundColor: COLORS[index % COLORS.length] }]} />
                <Text style={styles.legendLabel} numberOfLines={1}>{item.label}</Text>
              </View>
              <Text style={styles.legendValue}>{item.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(24),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  title: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flex: 1,
    marginLeft: scale(24),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  legendLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    marginRight: scale(8),
  },
  legendLabel: {
    fontSize: moderateScale(12, 0.3),
    color: '#4B5563',
    fontWeight: '500',
  },
  legendValue: {
    fontSize: moderateScale(12, 0.3),
    color: '#111827',
    fontWeight: '700',
  },
});
