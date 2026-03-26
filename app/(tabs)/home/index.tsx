import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale, verticalScale } from "react-native-size-matters";
import { useRouter } from "expo-router";
import axios from "axios";
import { useAppStore } from "../../../store/useAppStore";

// Home Components
import ActionFilterBar from "../../../components/home/ActionFilterBar";
import AIInsightBox from "../../../components/home/AIInsightBox";
import CashManagement from "../../../components/home/CashManagement";
import HomeHeader from "../../../components/home/HomeHeader";
import KPIGrid from "../../../components/home/KPIGrid";
import QuickActions from "../../../components/home/QuickActions";
import RecentActivity from "../../../components/home/RecentActivity";
import RevenueChart from "../../../components/home/RevenueChart";
import VatBalance from "../../../components/home/VatBalance";

interface HomeDashboardData {
  greeting_name: string;
  restaurant_name: string;
  preferred_language: string;
  metrics: any[];
  cash_management: any[];
  quick_actions: any[];
  vat_balance: number;
  weekly_revenue: any[];
  featured_insight: any;
  recent_activity: any[];
}

export default function TabsIndex() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tokens = useAppStore((state) => state.tokens);

  const [data, setData] = useState<HomeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = async () => {
    if (!tokens?.access_token) {
      setLoading(false);
      return;
    }
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://risto-ai.vercel.app";
      const res = await axios.get(`${apiUrl}/api/v1/restaurant/home`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      setData(res.data);
    } catch (error: any) {
      console.log("Home API Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [tokens]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#FA8C4C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          paddingTop: Math.max(
            insets.top + verticalScale(16),
            verticalScale(16),
          ),
          paddingHorizontal: scale(20),
          backgroundColor: "#F9FAFB",
          zIndex: 10,
        }}
      >
        <HomeHeader 
          greetingName={data?.greeting_name}
          restaurantName={data?.restaurant_name}
          preferredLanguage={data?.preferred_language}
        />
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: verticalScale(16),
            paddingBottom: Math.max(insets.bottom, verticalScale(0)),
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FA8C4C"]} />}
      >
        <ActionFilterBar />
        <KPIGrid metrics={data?.metrics} />
        <CashManagement cashData={data?.cash_management} />
        <QuickActions />
        <VatBalance balance={data?.vat_balance} onPress={() => router.push("/(tabs)/home/vat")} />
        <RevenueChart weeklyRevenue={data?.weekly_revenue} />
        <AIInsightBox insight={data?.featured_insight} />
        <RecentActivity activities={data?.recent_activity} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Slightly off-white background to match dashboard aesthetic
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(20),
  },
});
