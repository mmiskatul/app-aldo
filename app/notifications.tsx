import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Redirect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import {
  ArchiveBoxIcon,
  BoltIcon,
  BuildingLibraryIcon,
  ClipboardDocumentListIcon,
  DocumentArrowUpIcon,
} from "react-native-heroicons/outline";

import apiClient from "../api/apiClient";
import Header from "../components/ui/Header";
import { ListRouteSkeleton } from "../components/ui/RouteSkeletons";
import { hasActiveSubscription, useAppStore } from "../store/useAppStore";
import { hasCompletedOnboarding } from "../api/auth";
import { getApiDisplayMessage, logApiError } from "../utils/apiErrors";
import { API_REQUEST_TIMEOUT_MS } from "../utils/api";

type NotificationItem = {
  kind: string;
  title: string;
  subtitle: string;
  timestamp: string;
  entity_id?: string | null;
  reference_date?: string | null;
  source_kind?: string | null;
  source_entity_id?: string | null;
  route?: string | null;
};

type NotificationFeedResponse = {
  items: NotificationItem[];
};

const NOTIFICATIONS_CACHE_TTL_MS = 60 * 1000;
const NOTIFICATIONS_REQUEST_TIMEOUT_MS = 5_000;

const resolveNotificationRoute = (item: NotificationItem) => {
  const sourceKind = item.source_kind || item.kind;
  const sourceEntityId = item.source_entity_id || item.entity_id;

  switch (sourceKind) {
    case "daily_record":
      return sourceEntityId
        ? `/(tabs)/home/daily-record-details?dataId=${sourceEntityId}`
        : item.route;
    case "inventory":
      return sourceEntityId ? `/(tabs)/inventory/${sourceEntityId}` : item.route;
    case "invoice":
      return sourceEntityId ? `/(tabs)/documents/${sourceEntityId}` : item.route;
    case "cash":
      return sourceEntityId
        ? `/(tabs)/home/cash-transaction-details?id=${sourceEntityId}`
        : item.route;
    case "expense":
      return sourceEntityId
        ? `/(tabs)/home/expense-details?id=${sourceEntityId}`
        : item.route;
    default:
      return item.route;
  }
};

const getIconForType = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "invoice":
      return {
        IconComponent: DocumentArrowUpIcon,
        iconBgColor: "#FFF0E5",
        iconColor: "#FA8C4C",
      };
    case "expense":
      return {
        IconComponent: ClipboardDocumentListIcon,
        iconBgColor: "#FEE2E2",
        iconColor: "#EF4444",
      };
    case "inventory":
      return {
        IconComponent: ArchiveBoxIcon,
        iconBgColor: "#E0F2FE",
        iconColor: "#0284C7",
      };
    case "cash":
      return {
        IconComponent: BuildingLibraryIcon,
        iconBgColor: "#DCFCE7",
        iconColor: "#16A34A",
      };
    case "daily_record":
      return {
        IconComponent: BoltIcon,
        iconBgColor: "#FEF3C7",
        iconColor: "#D97706",
      };
    default:
      return {
        IconComponent: BoltIcon,
        iconBgColor: "#FEF3C7",
        iconColor: "#D97706",
      };
  }
};

const formatDate = (iso: string) => {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }

  return parsed.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function NotificationCard({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: () => void;
}) {
  const { IconComponent, iconBgColor, iconColor } = getIconForType(item.kind);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: iconBgColor }]}>
        <IconComponent size={moderateScale(18)} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.subtitle}</Text>
        <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAppStore((state) => state.user);
  const tokens = useAppStore((state) => state.tokens);
  const notificationsScreenCache = useAppStore((state) => state.notificationsScreenCache);
  const homeRecentActivity = useAppStore((state) => state.homeScreenCache.recentActivity);
  const setNotificationsScreenCache = useAppStore((state) => state.setNotificationsScreenCache);
  const initialNotifications =
    notificationsScreenCache.items.length > 0
      ? notificationsScreenCache.items as NotificationItem[]
      : homeRecentActivity as NotificationItem[] | null ?? [];
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [loading, setLoading] = useState(initialNotifications.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = React.useRef(initialNotifications.length > 0);

  const fetchNotifications = useCallback(async (silent = false) => {
    const shouldShowSkeleton = !silent && notifications.length === 0;
    if (shouldShowSkeleton) {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await apiClient.get<NotificationFeedResponse>(
        "/api/v1/restaurant/home/recent-activity",
        {
          params: {
            limit: 25,
            diverse: false,
          },
          timeout: Math.min(API_REQUEST_TIMEOUT_MS, NOTIFICATIONS_REQUEST_TIMEOUT_MS),
        }
      );
      const nextItems = response.data.items || [];
      setNotifications(nextItems);
      setNotificationsScreenCache({
        items: nextItems,
        fetchedAt: Date.now(),
      });
      hasLoadedRef.current = true;
    } catch (err: any) {
      logApiError("notifications.fetch", err);
      if (!silent || notifications.length === 0) {
        setError(getApiDisplayMessage(err, "Failed to load notifications."));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notifications.length, setNotificationsScreenCache]);

  useFocusEffect(
    useCallback(() => {
      if (!user || !tokens?.access_token || !hasActiveSubscription(user) || !hasCompletedOnboarding(user)) {
        return;
      }

      const hasCache = notifications.length > 0;
      const isFresh =
        typeof notificationsScreenCache.fetchedAt === "number" &&
        Date.now() - notificationsScreenCache.fetchedAt < NOTIFICATIONS_CACHE_TTL_MS;

      if (!hasLoadedRef.current && !hasCache) {
        void fetchNotifications(false);
        return;
      }

      if (!isFresh) {
        void fetchNotifications(true);
      }
    }, [fetchNotifications, notifications.length, notificationsScreenCache.fetchedAt, tokens?.access_token, user])
  );

  if (!user || !tokens?.access_token) {
    return <Redirect href="/(auth)" />;
  }

  if (!hasCompletedOnboarding(user)) {
    return <Redirect href="/(auth)/setup" />;
  }

  const onRefresh = () => {
    setRefreshing(true);
    void fetchNotifications(false);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bell-off" size={moderateScale(46)} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        Cash, expenses, daily data, invoice, and inventory updates will appear here.
      </Text>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <Header
        title="Notifications"
        showBack={true}
      />

      {loading ? (
        <ListRouteSkeleton withAction={false} itemCount={4} />
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Feather
            name="alert-circle"
            size={moderateScale(46)}
            color="#FCA5A5"
          />
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void fetchNotifications()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) =>
            `${item.kind}-${item.entity_id || item.source_entity_id || index}`
          }
          renderItem={({ item }) => (
            <NotificationCard
              item={item}
              onPress={() => {
                const route = resolveNotificationRoute(item);
                if (route) {
                  router.push(route as any);
                }
              }}
            />
          )}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: verticalScale(40) + insets.bottom },
            notifications.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FA8B4F"
              colors={["#FA8B4F"]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContent: {
    padding: scale(16),
    gap: verticalScale(12),
  },
  listContentEmpty: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    gap: scale(12),
    backgroundColor: "#FFFFFF",
    borderRadius: scale(16),
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginBottom: verticalScale(4),
  },
  message: {
    fontSize: moderateScale(13, 0.3),
    color: "#4B5563",
    lineHeight: moderateScale(20),
  },
  date: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(12, 0.3),
    color: "#9CA3AF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(32),
  },
  emptyTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: "700",
    color: "#374151",
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  emptySubtitle: {
    fontSize: moderateScale(14, 0.3),
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    marginTop: verticalScale(20),
    backgroundColor: "#FA8B4F",
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(12),
    borderRadius: scale(12),
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: moderateScale(14, 0.3),
  },
});
