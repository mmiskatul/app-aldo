import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface ChartDataPoint {
  day: string;
  totalHeight: number; // 0-100 percentage
  filledHeight: number; // 0-100 percentage (must be <= totalHeight)
}

interface RevenueChartProps {
  weeklyRevenue?: {
    label: string;
    value: number;
  }[];
}

export default function RevenueChart({ weeklyRevenue }: RevenueChartProps) {
  // Mock data to match the screenshot roughly
  const fallbackData: ChartDataPoint[] = [
    { day: 'MON', totalHeight: 35, filledHeight: 25 },
    { day: 'TUE', totalHeight: 45, filledHeight: 35 },
    { day: 'WED', totalHeight: 30, filledHeight: 20 },
    { day: 'THU', totalHeight: 65, filledHeight: 50 },
    { day: 'FRI', totalHeight: 50, filledHeight: 35 },
    { day: 'SAT', totalHeight: 85, filledHeight: 80 },
    { day: 'SUN', totalHeight: 75, filledHeight: 65 },
  ];

  const maxVal = Math.max(...(weeklyRevenue?.map(d => d.value) || [1]));
  const data: ChartDataPoint[] = weeklyRevenue && weeklyRevenue.length > 0
    ? weeklyRevenue.map(d => ({
        day: d.label.toUpperCase().substring(0, 3),
        totalHeight: 85, 
        filledHeight: maxVal > 0 ? (d.value / maxVal) * 85 : 0
      }))
    : fallbackData;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Revenue Trend</Text>
        <Text style={styles.subtext}>Last 7 Days</Text>
      </View>

      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barColumn}>
            <View style={styles.barBackground}>
              {/* The "unfilled" portion */}
              <View 
                style={[
                  styles.barFillLight, 
                  { height: `${item.totalHeight}%` }
                ]} 
              >
                {/* The "filled" active portion */}
                <View 
                  style={[
                    styles.barFillDark, 
                    { height: `${(item.filledHeight / item.totalHeight) * 100}%` }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.dayText}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: '#000000', // Matches the heavy border from mockup
    padding: scale(16),
    marginBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
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
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: verticalScale(140),
  },
  barColumn: {
    alignItems: 'center',
    width: scale(36), // Roughly evenly dividing the space
  },
  barBackground: {
    width: scale(32),
    height: verticalScale(120),
    justifyContent: 'flex-end', // stack from bottom
  },
  barFillLight: {
    width: '100%',
    backgroundColor: '#FDE6D5', // Light orange
    borderTopLeftRadius: scale(6),
    borderTopRightRadius: scale(6),
    justifyContent: 'flex-end',
  },
  barFillDark: {
    width: '100%',
    backgroundColor: '#FA8C4C', // Main brand orange
    borderTopLeftRadius: scale(4),
    borderTopRightRadius: scale(4),
  },
  dayText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(9, 0.3),
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
