import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { getUserTickets, TicketListItem } from '../../../api/support';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  open: { label: 'Open', bg: '#FEF3C7', text: '#B45309' },
  closed: { label: 'Closed', bg: '#D1FAE5', text: '#065F46' },
  pending: { label: 'Pending', bg: '#E0E7FF', text: '#3730A3' },
  resolved: { label: 'Resolved', bg: '#D1FAE5', text: '#065F46' },
};

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  normal: { label: 'Normal', bg: '#F3F4F6', text: '#374151' },
  high: { label: 'High', bg: '#FEE2E2', text: '#991B1B' },
  low: { label: 'Low', bg: '#E0F2FE', text: '#0369A1' },
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ─── Ticket Card ─────────────────────────────────────────────────────────────

const TicketCard = ({ item, onPress }: { item: TicketListItem; onPress: () => void }) => {
  const status = STATUS_CONFIG[item.status] ?? { label: item.status, bg: '#F3F4F6', text: '#374151' };
  const priority = PRIORITY_CONFIG[item.priority] ?? { label: item.priority, bg: '#F3F4F6', text: '#374151' };

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
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function TicketsScreen() {
  const router = useRouter();
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
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FA8B4F" />
        </View>
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
              onPress={() => router.push(`/(tabs)/settings/ticket-detail?id=${item.id}` as any)}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
