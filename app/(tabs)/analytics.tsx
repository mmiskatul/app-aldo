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

import { useAppStore } from '../../store/useAppStore';

import ActionFilterBar from '../../components/home/ActionFilterBar';
import { DashboardRouteSkeleton } from '../../components/ui/RouteSkeletons';
import apiClient from '../../api/apiClient';
import { useTranslation } from '../../utils/i18n';

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const analyticsData = useAppStore((state) => state.analyticsData);
  const setAnalyticsData = useAppStore((state) => state.setAnalyticsData);
  
  const [activePeriod, setActivePeriod] = React.useState('weekly');
  const [loading, setLoading] = React.useState(false);
  const [businessInsight, setBusinessInsight] = React.useState<any>(null);

  const fetchAnalyticsData = async (period: string) => {
    try {
      setLoading(true);
      const [overviewRes, insightRes] = await Promise.all([
        apiClient.get(`/api/v1/restaurant/analytics/overview?period=${period}`),
        apiClient.get('/api/v1/restaurant/analytics/business-insight')
      ]);
      setAnalyticsData(overviewRes.data);
      setBusinessInsight(insightRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
    fetchAnalyticsData(period);
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!analyticsData) return;
    
    if (format === 'pdf') {
      await generateAnalyticsPdfExport({ analyticsData, period: activePeriod });
    } else {
      await generateAnalyticsExcelExport({ analyticsData, period: activePeriod });
    }
  };

  if (!analyticsData || loading) {
    return (
      <View style={styles.safeArea}>
        <Header title={t('analytics_title')} showBell={true} />
        <DashboardRouteSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <Header title={t('analytics_title')} showBell={true} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ActionFilterBar 
          activePeriod={activePeriod}
          availablePeriods={['weekly', 'monthly']}
          onPeriodChange={handlePeriodChange}
          onExport={handleExport}
          dropdownTop={verticalScale(130)}
        />

        <AnalyticsAIInsightCard insight={businessInsight || analyticsData.insight_banner} />
        <SummaryCards metrics={analyticsData.metric_tiles} />
        <RevenueTrendChart 
          weeklyRevenue={analyticsData.weekly_revenue} 
          totalRevenue={analyticsData.revenue_total}
          changePercent={analyticsData.revenue_change_percent}
        />
        <StatsSelector stats={analyticsData.summary_stats} />
        <RevenueComparisonChart comparison={analyticsData.revenue_comparison} />
        <ActivityCostSection 
          coversActivity={analyticsData.covers_activity} 
          costBreakdown={analyticsData.cost_breakdown} 
        />
        <SupplierPriceAlerts alerts={analyticsData.supplier_price_alerts} />
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
