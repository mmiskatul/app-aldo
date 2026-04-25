import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { useTranslation } from '../../utils/i18n';

interface RevenueTrendChartProps {
  weeklyRevenue: { label: string; value: number }[];
  totalRevenue: number;
  changePercent: number;
}

const CHART_WIDTH = scale(280);
const CHART_HEIGHT = verticalScale(136);
const PADDING_TOP = verticalScale(12);
const PADDING_RIGHT = scale(10);
const PADDING_BOTTOM = verticalScale(22);
const PADDING_LEFT = scale(10);
const GRID_LINES = 4;

const formatCompactCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${Math.round(value)}`;
};

const buildSmoothPath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
};

export default function RevenueTrendChart({
  weeklyRevenue,
  totalRevenue,
  changePercent,
}: RevenueTrendChartProps) {
  const { t } = useTranslation();
  const maxValue = Math.max(...weeklyRevenue.map((item) => item.value), 0);
  const chartMax = maxValue > 0 ? Math.ceil(maxValue / GRID_LINES) * GRID_LINES : 4;
  const plotWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const stepX = weeklyRevenue.length > 1 ? plotWidth / (weeklyRevenue.length - 1) : 0;

  const points = weeklyRevenue.map((item, index) => {
    const x = PADDING_LEFT + stepX * index;
    const y =
      PADDING_TOP +
      plotHeight -
      (chartMax > 0 ? (item.value / chartMax) * plotHeight : 0);
    return { x, y, label: item.label, value: item.value };
  });

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${CHART_HEIGHT - PADDING_BOTTOM} L ${points[0].x} ${CHART_HEIGHT - PADDING_BOTTOM} Z`
      : '';

  const yAxisValues = Array.from({ length: GRID_LINES + 1 }, (_, index) => {
    const value = chartMax - (chartMax / GRID_LINES) * index;
    return Math.max(value, 0);
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('revenue_trend')}</Text>
          <Text style={styles.value}>${totalRevenue.toLocaleString()}</Text>
        </View>
        <Text style={[styles.trend, { color: changePercent >= 0 ? '#10B981' : '#EF4444' }]}>
          {changePercent >= 0 ? '+' : ''}
          {changePercent}% <Text style={styles.trendSub}>{t('last_week')}</Text>
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
            <LinearGradient id="analyticsRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FB923C" stopOpacity="0.28" />
              <Stop offset="100%" stopColor="#FB923C" stopOpacity="0.05" />
            </LinearGradient>
          </Defs>

          {yAxisValues.map((value, index) => {
            const y = PADDING_TOP + (plotHeight / GRID_LINES) * index;
            return (
              <Line
                key={`${value}-${index}`}
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

          {areaPath ? <Path d={areaPath} fill="url(#analyticsRevenueFill)" /> : null}
          {linePath ? <Path d={linePath} fill="none" stroke="#FB923C" strokeWidth="3" /> : null}

          {points.map((point, index) => {
            const isPeak = point.value === maxValue && maxValue > 0;
            return (
              <React.Fragment key={`${point.label}-${index}`}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={isPeak ? '5' : '4'}
                  fill="#FFFFFF"
                  stroke="#FB923C"
                  strokeWidth={isPeak ? '3' : '2.5'}
                />
                <SvgText
                  x={point.x}
                  y={CHART_HEIGHT - scale(4)}
                  fontSize={moderateScale(9, 0.3)}
                  fontWeight="700"
                  fill={isPeak ? '#FB923C' : '#9CA3AF'}
                  textAnchor="middle"
                >
                  {point.label}
                </SvgText>
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
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  value: {
    fontSize: moderateScale(24, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  trend: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '700',
    textAlign: 'right',
  },
  trendSub: {
    color: '#9CA3AF',
    fontWeight: '500',
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
