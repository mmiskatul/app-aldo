import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import Header from '../../../components/ui/Header';
import { getTicketById, TicketDetail, TicketMessage } from '../../../api/support';

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  open:     { label: 'Open',     bg: '#FEF3C7', text: '#B45309' },
  closed:   { label: 'Closed',   bg: '#D1FAE5', text: '#065F46' },
  resolved: { label: 'Resolved', bg: '#D1FAE5', text: '#065F46' },
  pending:  { label: 'Pending',  bg: '#E0E7FF', text: '#3730A3' },
};

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  normal: { label: 'Normal', bg: '#F3F4F6', text: '#374151' },
  high:   { label: 'High',   bg: '#FEE2E2', text: '#991B1B' },
  low:    { label: 'Low',    bg: '#E0F2FE', text: '#0369A1' },
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ─── Message Bubble ──────────────────────────────────────────────────────────

const MessageBubble = ({ msg }: { msg: TicketMessage }) => {
  const isUser = msg.author_role === 'user';

  return (
    <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleSupport]}>
      <View style={styles.bubbleHeader}>
        <View style={[styles.authorDot, { backgroundColor: isUser ? '#FA8B4F' : '#6366F1' }]} />
        <Text style={styles.authorName}>{msg.author_name}</Text>
        <Text style={styles.bubbleRole}>{isUser ? 'You' : 'Support'}</Text>
      </View>

      <Text style={styles.bubbleBody}>{msg.body}</Text>

      {msg.attachment_name && msg.attachment_url && (
        <TouchableOpacity
          style={styles.attachmentRow}
          activeOpacity={0.7}
          onPress={() => Linking.openURL(msg.attachment_url!)}
        >
          <Feather name="paperclip" size={moderateScale(13)} color="#FA8B4F" />
          <Text style={styles.attachmentName} numberOfLines={1}>{msg.attachment_name}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.bubbleTime}>{formatDateTime(msg.created_at)}</Text>
    </View>
  );
};

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function TicketDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getTicketById(id);
      console.log('[TicketDetail] Response:', JSON.stringify(res, null, 2));
      setTicket(res);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load ticket.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <Header title="Ticket Details" showBack={true} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FA8B4F" />
        </View>
      </View>
    );
  }

  if (error || !ticket) {
    return (
      <View style={styles.safeArea}>
        <Header title="Ticket Details" showBack={true} />
        <View style={styles.centered}>
          <Feather name="alert-circle" size={moderateScale(48)} color="#FCA5A5" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchTicket} activeOpacity={0.8}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const status   = STATUS_CONFIG[ticket.status]   ?? { label: ticket.status,   bg: '#F3F4F6', text: '#374151' };
  const priority = PRIORITY_CONFIG[ticket.priority] ?? { label: ticket.priority, bg: '#F3F4F6', text: '#374151' };

  return (
    <View style={styles.safeArea}>
      <Header title="Ticket Details" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: verticalScale(40) + insets.bottom }]}
      >
        {/* ── Header Card ── */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.ticketNumber}>{ticket.ticket_number}</Text>
            <View style={[styles.badge, { backgroundColor: status.bg }]}>
              <Text style={[styles.badgeText, { color: status.text }]}>{status.label}</Text>
            </View>
          </View>

          <Text style={styles.subject}>{ticket.subject}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: priority.bg }]}>
              <Text style={[styles.badgeText, { color: priority.text }]}>{priority.label} Priority</Text>
            </View>
            <View style={styles.metaDate}>
              <Feather name="clock" size={moderateScale(12)} color="#9CA3AF" />
              <Text style={styles.metaDateText}>{formatDateTime(ticket.submitted_at)}</Text>
            </View>
          </View>

          {ticket.resolved_at && (
            <View style={styles.resolvedRow}>
              <Feather name="check-circle" size={moderateScale(13)} color="#065F46" />
              <Text style={styles.resolvedText}>Resolved: {formatDateTime(ticket.resolved_at)}</Text>
            </View>
          )}
        </View>

        {/* ── Messages ── */}
        <Text style={styles.sectionTitle}>
          Conversation <Text style={styles.sectionCount}>({ticket.messages.length})</Text>
        </Text>

        {ticket.messages.map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(32),
  },
  errorTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#374151',
    marginTop: verticalScale(16),
  },
  errorSub: {
    fontSize: moderateScale(14, 0.3),
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: verticalScale(8),
  },
  retryBtn: {
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
  content: {
    padding: scale(16),
    gap: verticalScale(12),
  },

  // Header card
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(18),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: verticalScale(4),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  ticketNumber: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '700',
    color: '#FA8B4F',
    letterSpacing: 0.3,
  },
  subject: {
    fontSize: moderateScale(17, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(24),
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  metaDateText: {
    fontSize: moderateScale(11, 0.3),
    color: '#9CA3AF',
  },
  resolvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginTop: verticalScale(10),
    backgroundColor: '#D1FAE5',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
    alignSelf: 'flex-start',
  },
  resolvedText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '600',
    color: '#065F46',
  },

  // Badges
  badge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(20),
  },
  badgeText: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '600',
  },

  // Section
  sectionTitle: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginTop: verticalScale(4),
    marginBottom: verticalScale(4),
  },
  sectionCount: {
    fontWeight: '400',
    color: '#9CA3AF',
  },

  // Bubbles
  bubble: {
    borderRadius: scale(14),
    padding: scale(14),
    borderWidth: 1,
  },
  bubbleUser: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F3F4F6',
  },
  bubbleSupport: {
    backgroundColor: '#F0F4FF',
    borderColor: '#E0E7FF',
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginBottom: verticalScale(8),
  },
  authorDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  authorName: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '700',
    color: '#374151',
    flex: 1,
  },
  bubbleRole: {
    fontSize: moderateScale(11, 0.3),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  bubbleBody: {
    fontSize: moderateScale(14, 0.3),
    color: '#374151',
    lineHeight: 22,
    marginBottom: verticalScale(6),
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: '#FFF7ED',
    padding: scale(8),
    borderRadius: scale(8),
    marginBottom: verticalScale(6),
  },
  attachmentName: {
    fontSize: moderateScale(12, 0.3),
    color: '#FA8B4F',
    fontWeight: '600',
    flex: 1,
  },
  bubbleTime: {
    fontSize: moderateScale(11, 0.3),
    color: '#9CA3AF',
    textAlign: 'right',
  },
});
