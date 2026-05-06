import { useFocusEffect } from "@react-navigation/native";
import { Stack, useNavigation, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowDownTrayIcon, BellIcon } from "react-native-heroicons/outline";
import { Feather } from "@expo/vector-icons";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import apiClient from "../../../api/apiClient";
import { useAppStore } from "../../../store/useAppStore";
import { showSuccessMessage } from "../../../utils/feedback";
import {
  resolveLocalizedActions,
  resolveLocalizedList,
  resolveLocalizedText,
} from "../../../utils/localizedContent";

// Components
import InsightSummaryCard from "../../../components/home/view-insight/InsightSummaryCard";
import OtherInsights from "../../../components/home/view-insight/OtherInsights";
import RecommendedActions from "../../../components/home/view-insight/RecommendedActions";
import RootCauses from "../../../components/home/view-insight/RootCauses";
import { DetailRouteSkeleton } from "../../../components/ui/RouteSkeletons";

export default function ViewInsightScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const appLanguage = useAppStore((state) => state.appLanguage);
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const resolveActionRoute = React.useCallback((action: any) => {
    const text = `${action?.title || ""} ${action?.description || ""} ${action?.action_label || ""}`.toLowerCase();

    if (text.includes("supplier") || text.includes("fornitor") || text.includes("invoice") || text.includes("fattur")) {
      return "/(tabs)/documents/upload-invoice";
    }
    if (text.includes("waste") || text.includes("sprechi") || text.includes("ingredient") || text.includes("inventory") || text.includes("stock")) {
      return "/(tabs)/inventory";
    }
    if (text.includes("cash") || text.includes("cassa") || text.includes("deposit")) {
      return "/(tabs)/home/cash-management";
    }
    if (text.includes("expense") || text.includes("spesa") || text.includes("cost")) {
      return "/(tabs)/home/add-expense";
    }
    if (text.includes("daily") || text.includes("revenue") || text.includes("ricavi") || text.includes("covers") || text.includes("coperti")) {
      return "/(tabs)/home/add-daily-data";
    }
    return "/(tabs)/analytics";
  }, []);

  const handleApplyRecommendedAction = React.useCallback((action: any) => {
    showSuccessMessage("Action marked as applied. Opening the related workflow.", "Recommended Action");
    router.push(resolveActionRoute(action) as any);
  }, [resolveActionRoute, router]);

  const handleBackPress = React.useCallback(() => {
    if ((router as any).canGoBack?.()) {
      router.back();
      return;
    }
    router.replace("/(tabs)/home" as any);
  }, [router]);

  const fetchInsight = React.useCallback(async (isMounted: () => boolean) => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/v1/restaurant/insights', {
        params: { _: Date.now() },
      });
      if (isMounted()) {
        setData(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch insights:", error?.response?.data || error?.message);
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      void fetchInsight(() => isActive);
      return () => {
        isActive = false;
      };
    }, [fetchInsight]),
  );

  const localizedInsightData = React.useMemo(() => {
    if (!data) {
      return null;
    }

    return {
      ...data,
      title: resolveLocalizedText(appLanguage, data.title_translations, data.title),
      metric_caption: resolveLocalizedText(
        appLanguage,
        data.metric_caption_translations,
        data.metric_caption,
      ),
      root_causes: resolveLocalizedList(
        appLanguage,
        data.root_causes_translations,
        data.root_causes,
      ),
      recommended_actions: resolveLocalizedActions(
        appLanguage,
        data.recommended_actions_translations,
        data.recommended_actions,
      ),
    };
  }, [appLanguage, data]);

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({
        tabBarStyle: { display: "none" },
      });
      return () => {
        parent?.setOptions({
          tabBarStyle: {
            display: "flex",
            position: "absolute",
            backgroundColor: "#FFF0E5",
            borderTopLeftRadius: scale(20),
            borderTopRightRadius: scale(20),
            height: verticalScale(60),
            paddingBottom: verticalScale(8),
            paddingTop: verticalScale(8),
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
        });
      };
    }, [navigation]),
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: "AI Business Insight",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: moderateScale(18, 0.3),
            fontWeight: "700",
            color: "#111827",
          },
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              style={[styles.headerIconButton, { marginLeft: scale(4) }]} 
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={moderateScale(20)} color="#111827" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={[styles.headerIconButton, { marginRight: scale(4) }]} activeOpacity={0.7}>
              <BellIcon size={moderateScale(20)} color="#111827" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: verticalScale(16),
            paddingBottom: verticalScale(120),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <DetailRouteSkeleton />
        ) : localizedInsightData ? (
          <>
            <InsightSummaryCard 
              title={localizedInsightData.title}
              priority={localizedInsightData.priority}
              metricValue={localizedInsightData.metric_value}
              metricCaption={localizedInsightData.metric_caption}
              trend={localizedInsightData.trend}
            />
            <RootCauses causes={localizedInsightData.root_causes} />
            <RecommendedActions
              actions={localizedInsightData.recommended_actions}
              onApply={handleApplyRecommendedAction}
            />
            <OtherInsights insights={localizedInsightData.other_related_insights} />
          </>
        ) : (
          <Text style={{ textAlign: "center", marginTop: verticalScale(40) }}>No insight available</Text>
        )}
      </ScrollView>

      <View
        style={[styles.bottomContainer, { paddingBottom: verticalScale(20) }]}
      >
        <TouchableOpacity style={styles.exportButton}>
          <ArrowDownTrayIcon size={moderateScale(20)} color="#FFFFFF" />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(20),
  },
  notificationButton: {
    padding: scale(8),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(100),
    justifyContent: "center",
    alignItems: "center",
  },
  headerIconButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  notificationDot: {
    position: "absolute",
    top: scale(8),
    right: scale(8),
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: "#EF4444",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(24),
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  exportButton: {
    backgroundColor: "#FA8C4C",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: verticalScale(50),
    borderRadius: scale(12),
  },
  exportText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: scale(8),
  },
});
