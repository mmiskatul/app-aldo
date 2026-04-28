import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import Header from '../../../components/ui/Header';
import { ListRouteSkeleton } from '../../../components/ui/RouteSkeletons';
import { getUserTickets, TicketListItem } from '../../../api/support';

type NotificationItem = {
  id: string;
  ticketId: string;
  title: string;
  message: string;
  status: string;
  date: string;
  icon: keyof typeof Feather.glyphMap;
  accent: string;
  background: string;
};

const formatDate = (iso: string) => {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }

  return parsed.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const toNotificationItem = (ticket: TicketListItem): NotificationItem => {
  if (ticket.status === 'resolved') {
    return {
      id: ticket.id,
      ticketId: ticket.id,
      title: 'Support issue resolved',
      message: `${ticket.ticket_number} has been marked as resolved by the admin team.`,
      status: ticket.status,
      date: ticket.date,
      icon: 'check-circle',
      accent: '#059669',
      background: '#ECFDF5',
    };
  }

  if (ticket.status === 'pending') {
    return {
      id: ticket.id,
      ticketId: ticket.id,
      title: 'Support ticket updated',
      message: `${ticket.ticket_number} is pending review. Tap to view the latest conversation.`,
      status: ticket.status,
      date: ticket.date,
      icon: 'clock',
      accent: '#4F46E5',
      background: '#EEF2FF',
    };
  }

  return {
    id: ticket.id,
    ticketId: ticket.id,
    title: 'Support ticket submitted',
    message: `${ticket.ticket_number} is open. Tap to view details and status.`,
    status: ticket.status,
    date: ticket.date,
    icon: 'info',
    accent: '#F97316',
    background: '#FFF7ED',
  };
};

function NotificationCard({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: item.background }]}>
        <Feather name={item.icon} size={moderateScale(18)} color={item.accent} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await getUserTickets(1, 50);
      setTickets(response.items);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load notifications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const notifications = useMemo(
    () => tickets.map(toNotificationItem),
    [tickets]
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bell-off" size={moderateScale(46)} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        Support updates and ticket resolution alerts will appear here.
      </Text>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <Header title="Notifications" showBack={true} />

      {loading ? (
        <ListRouteSkeleton withAction={false} itemCount={4} />
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Feather name="alert-circle" size={moderateScale(46)} color="#FCA5A5" />
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchNotifications()} activeOpacity={0.8}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard
              item={item}
              onPress={() => router.push(`/(tabs)/settings/ticket-detail?id=${item.ticketId}` as any)}
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
              colors={['#FA8B4F']}
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
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: scale(16),
    gap: verticalScale(12),
  },
  listContentEmpty: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    gap: scale(12),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  message: {
    fontSize: moderateScale(13, 0.3),
    color: '#4B5563',
    lineHeight: moderateScale(20),
  },
  date: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(12, 0.3),
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(32),
  },
  emptyTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#374151',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  emptySubtitle: {
    fontSize: moderateScale(14, 0.3),
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: verticalScale(20),
    backgroundColor: '#FA8B4F',
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(12),
    borderRadius: scale(12),
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: moderateScale(14, 0.3),
  },
});
