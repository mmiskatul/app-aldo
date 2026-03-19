import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';

import Header from '../../components/ui/Header';
import AnalyticsAIInsightCard from '../../components/analytics/AnalyticsAIInsightCard';
import SummaryCards from '../../components/analytics/SummaryCards';
import RevenueTrendChart from '../../components/analytics/RevenueTrendChart';
import StatsSelector from '../../components/analytics/StatsSelector';
import RevenueComparisonChart from '../../components/analytics/RevenueComparisonChart';
import ActivityCostSection from '../../components/analytics/ActivityCostSection';
import SupplierPriceAlerts from '../../components/analytics/SupplierPriceAlerts';

export default function AnalyticsScreen() {
  return (
    <View style={styles.safeArea}>
      <Header title="Analytics" showBell={true} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.exportButton}>
            <Feather name="download" size={moderateScale(14)} color="#111827" />
            <Text style={styles.exportText}>Export Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterDropdown}>
            <Text style={styles.filterText}>Weekly</Text>
            <Feather name="chevron-down" size={moderateScale(14)} color="#111827" />
          </TouchableOpacity>
        </View>

        <AnalyticsAIInsightCard />
        <SummaryCards />
        <RevenueTrendChart />
        <StatsSelector />
        <RevenueComparisonChart />
        <ActivityCostSection />
        <SupplierPriceAlerts />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(40),
  },
  bellButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: "absolute",
    top: scale(10),
    right: scale(12),
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: "#EF4444",
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: verticalScale(20),
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    marginRight: scale(12),
  },
  exportText: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '600',
    color: '#111827',
    marginLeft: scale(6),
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE7D6',
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
  },
  filterText: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '600',
    color: '#111827',
    marginRight: scale(6),
  },
});
