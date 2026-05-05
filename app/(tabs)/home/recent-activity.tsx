import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import apiClient from "../../../api/apiClient";
import RecentActivity from "../../../components/home/RecentActivity";
import Header from "../../../components/ui/Header";
import { useAppStore } from "../../../store/useAppStore";
import { useTranslation } from "../../../utils/i18n";

interface ActivityItem {
  kind?: string;
  title?: string;
  subtitle?: string;
  timestamp?: string;
  entity_id?: string;
  reference_date?: string;
  route?: string;
  source_kind?: string;
  source_entity_id?: string;
}

interface RecentActivityResponse {
  items: ActivityItem[];
}

export default function RecentActivityScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const cachedRecentActivity = useAppStore((state) => state.homeScreenCache.recentActivity);

  const [activities, setActivities] = useState<ActivityItem[] | null>(cachedRecentActivity);
  const [loading, setLoading] = useState(!cachedRecentActivity);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedRef = useRef(Boolean(cachedRecentActivity));

  const fetchRecentActivity = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const response = await apiClient.get<RecentActivityResponse>("/api/v1/restaurant/home/recent-activity", {
        params: {
          limit: 50,
          diverse: false,
        },
      });
      setActivities(response.data.items);
    } catch (error: any) {
      console.log("Recent activity screen error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchRecentActivity(hasLoadedRef.current);
      hasLoadedRef.current = true;
    }, [fetchRecentActivity])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchRecentActivity(false);
  }, [fetchRecentActivity]);

  return (
    <View style={styles.safeArea}>
      <Header title={t("recent_activity")} showBack={true} fallbackHref="/(tabs)/home" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FA8C4C"]} />
        }
      >
        <RecentActivity
          activities={activities ?? undefined}
          loading={loading && activities === null}
          showHeader={false}
          bottomSpacing={0}
          onNavigate={(route) => router.push(route as any)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
  },
});
