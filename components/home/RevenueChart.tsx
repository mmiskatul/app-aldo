import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Svg, { Defs, Line, LinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { useTranslation } from '../../utils/i18n';

interface RevenuePoint {
  label: string;
  value: number;
}

interface RevenueChartProps {
  revenue?: RevenuePoint[];
  period?: string;
}

const CHART_WIDTH = scale(286);
const CHART_HEIGHT = verticalScale(176);
const PADDING_TOP = verticalScale(12);
const PADDING_RIGHT = scale(12);
const PADDING_BOTTOM = verticalScale(30);
const PADDING_LEFT = scale(8);
const GRID_LINES = 4;

const formatCompactCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${Math.round(value)}`;
};

const normalizeLabel = (label: string, period: string) => {
  if (period === 'monthly' && label.startsWith('Week ')) return label.replace('Week ', 'W');
  return label.length > 4 && period === 'weekly' ? label.slice(0, 3) : label;
};

export default function RevenueChart({ revenue = [], period = 'weekly' }: RevenueChartProps) {
  const { t } = useTranslation();
  const safeRevenue = revenue.length > 0 ? revenue : [];
  const maxValue = Math.max(...safeRevenue.map((item) => item.value), 0);
  const chartMax = maxValue > 0 ? Math.ceil(maxValue / GRID_LINES) * GRID_LINES : 4;
  const plotWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const barSlotWidth = safeRevenue.length > 0 ? plotWidth / safeRevenue.length : plotWidth;
  const barWidth = Math.min(scale(22), Math.max(scale(12), barSlotWidth * 0.46));
  const yAxisValues = Array.from({ length: GRID_LINES + 1 }, (_, index) => {
    const step = chartMax / GRID_LINES;
    return Math.max(chartMax - step * index, 0);
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {period === 'weekly' ? t('weekly_revenue_trend') : t('monthly_revenue_trend')}
        </Text>
        <Text style={styles.subtext}>
          {period === 'weekly' ? t('last_7_days') : t('current_month')}
        </Text>
      </View>

      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          {yAxisValues.map((value) => (
            <Text key={value} style={styles.axisLabel}>
              {formatCompactCurrency(value)}
            </Text>
          ))}
        </View>

        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="homeBarFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#F97316" />
              <Stop offset="100%" stopColor="#FDBA74" />
            </LinearGradient>
            <LinearGradient id="homeBarPeakFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#C2410C" />
              <Stop offset="100%" stopColor="#F97316" />
            </LinearGradient>
          </Defs>

          {yAxisValues.map((_, index) => {
            const y = PADDING_TOP + (plotHeight / GRID_LINES) * index;
            return (
              <Line
                key={`grid-${index}`}
                x1={PADDING_LEFT}
                y1={y}
                x2={CHART_WIDTH - PADDING_RIGHT}
                y2={y}
                stroke="#F3F4F6"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {safeRevenue.map((item, index) => {
            const barHeight = chartMax > 0 ? (item.value / chartMax) * plotHeight : 0;
            const x = PADDING_LEFT + index * barSlotWidth + (barSlotWidth - barWidth) / 2;
            const y = PADDING_TOP + plotHeight - barHeight;
            const isPeak = item.value === maxValue && maxValue > 0;

            return (
              <React.Fragment key={`${item.label}-${index}`}>
                <Rect
                  x={x}
                  y={PADDING_TOP}
                  width={barWidth}
                  height={plotHeight}
                  rx={scale(7)}
                  fill="#FFF7ED"
                />
                <Rect
                  x={x}
                  y={barHeight > 0 ? y : PADDING_TOP + plotHeight - verticalScale(4)}
                  width={barWidth}
                  height={Math.max(barHeight, item.value > 0 ? verticalScale(4) : 0)}
                  rx={scale(7)}
                  fill={isPeak ? 'url(#homeBarPeakFill)' : 'url(#homeBarFill)'}
                />
                <SvgText
                  x={x + barWidth / 2}
                  y={CHART_HEIGHT - scale(6)}
                  fontSize={moderateScale(9, 0.3)}
                  fontWeight="700"
                  fill={isPeak ? '#C2410C' : '#6B7280'}
                  textAnchor="middle"
                >
                  {normalizeLabel(item.label, period)}
                </SvgText>
                {item.value > 0 ? (
                  <SvgText
                    x={x + barWidth / 2}
                    y={Math.max(y - verticalScale(6), PADDING_TOP - verticalScale(2))}
                    fontSize={moderateScale(8, 0.3)}
                    fontWeight="700"
                    fill="#6B7280"
                    textAnchor="middle"
                  >
                    {formatCompactCurrency(item.value)}
                  </SvgText>
                ) : null}
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: scale(16),
    marginBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(18),
  },
  title: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  subtext: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '500',
    color: '#9CA3AF',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  yAxis: {
    height: CHART_HEIGHT - PADDING_BOTTOM + verticalScale(2),
    justifyContent: 'space-between',
    marginRight: scale(10),
  },
  axisLabel: {
    fontSize: moderateScale(9, 0.3),
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
