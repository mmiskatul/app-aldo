import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { BanknotesIcon, ReceiptPercentIcon } from 'react-native-heroicons/outline';

const insights = [
  {
    title: "Profit decrease",
    value: "-4.2%",
    icon: <BanknotesIcon size={moderateScale(18)} color="#EF4444" />,
    backgroundColor: '#FFFFFF'
  },
  {
    title: "Expense increase",
    value: "+$1,240",
    icon: <ReceiptPercentIcon size={moderateScale(18)} color="#FB923C" />,
    backgroundColor: '#FFFFFF'
  }
];

export default function OtherInsights() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Other Related Insights</Text>
      
      <View style={styles.list}>
        {insights.map((insight, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.iconContainer}>
              {insight.icon}
            </View>
            <Text style={styles.title}>{insight.title}</Text>
            <Text style={styles.value}>{insight.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(32),
  },
  headerTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  list: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: verticalScale(12),
  },
  title: {
    fontSize: moderateScale(12, 0.3),
    color: '#6B7280',
    marginBottom: verticalScale(4),
  },
  value: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
});
