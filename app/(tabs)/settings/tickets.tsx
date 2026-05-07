import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import Header from '../../../components/ui/Header';
import { ListRouteSkeleton } from '../../../components/ui/RouteSkeletons';
import { getUserTickets, TicketListItem } from '../../../api/support';
import { formatReadableDate } from '../../../utils/date';
import { buildSettingsHref, normalizeOrigin } from '../../../utils/settingsNavigation';
import { getSupportPriorityPresentation, getSupportStatusPresentation } from '../../../utils/supportPresentation';

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Ticket Card ─────────────────────────────────────────────────────────────

const TicketCard = ({ item, onPress }: { item: TicketListItem; onPress: () => void }) => {
  const status = getSupportStatusPresentation(item.status);
  const priority = getSupportPriorityPresentation(item.priority);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <Text style={styles.ticketNumber}>{item.ticket_number}</Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Text style={[styles.badgeText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>

      <Text style={styles.subject} numberOfLines={2}>{item.issue_subject}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <View style={[styles.badge, { backgroundColor: priority.bg }]}>
            <Text style={[styles.badgeText, { color: priority.text }]}>{priority.label} Priority</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <Feather name="calendar" size={moderateScale(12)} color="#9CA3AF" />
          <Text style={styles.dateText}>
            {formatReadableDate(item.date, { day: 'numeric', month: 'short', year: 'numeric' }, item.date, 'input')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function TicketsScreen() {
  const router = useRouter();
  const { origin } = useLocalSearchParams<{ origin?: string | string[] }>();
  const settingsOrigin = normalizeOrigin(origin);
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await getUserTickets();
      console.log('[Tickets] Response:', JSON.stringify(res, null, 2));
      setTickets(res.items);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to load tickets.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets(true);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="inbox" size={moderateScale(48)} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No tickets yet</Text>
      <Text style={styles.emptySubtitle}>Your submitted support tickets will appear here.</Text>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <Header title="My Tickets" showBack={true} />

      {loading ? (
        <ListRouteSkeleton withAction={false} itemCount={4} />
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Feather name="alert-circle" size={moderateScale(48)} color="#FCA5A5" />
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchTickets()} activeOpacity={0.8}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TicketCard
              item={item}
              onPress={() => router.push(buildSettingsHref('/(tabs)/settings/ticket-detail', settingsOrigin, { id: item.id }))}
            />
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: verticalScale(40) + insets.bottom },
            tickets.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
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

// ─── Styles ──────────────────────────────────────────────────────────────────

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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  ticketNumber: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '700',
    color: '#FA8B4F',
    letterSpacing: 0.3,
  },
  subject: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '600',
    color: '#111827',
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(22),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  badge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(20),
  },
  badgeText: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  dateText: {
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
