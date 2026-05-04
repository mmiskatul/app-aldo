import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import apiClient from '../../../api/apiClient';
import Header from '../../../components/ui/Header';
import { useAppStore } from '../../../store/useAppStore';
import { showDialog, showErrorMessage, showInfoMessage, showSuccessMessage } from '../../../utils/feedback';
import { formatEuropeanDate } from '../../../utils/date';

type ExpenseDetail = {
  id: string;
  category: string;
  amount: number;
  expense_date: string;
  section: 'cash' | 'bank';
  notes?: string | null;
  source_kind?: string | null;
  source_id?: string | null;
  source_inventory_item_id?: string | null;
  created_at: string;
};

const toSingleParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] || '' : value || '';

const formatCurrency = (value: number) =>
  `€${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value?: string | null) => formatEuropeanDate(value);

const formatSource = (value?: string | null) => {
  if (!value) {
    return 'Manual';
  }
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const sourceNoticeText = (item: ExpenseDetail) => {
  switch (item.source_kind) {
    case 'manual_entry':
      return 'This expense was generated from daily data. Delete or edit the daily data record to change it.';
    case 'document':
      return 'This expense was generated from a saved document. Delete or edit the document to change it.';
    case 'inventory':
      return 'This expense was generated from an inventory purchase. Delete or edit the inventory item to change it.';
    default:
      return 'This expense is generated from another source. Delete or edit the source record to change it.';
  }
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function ExpenseDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const expenseId = toSingleParam(id);
  const clearHomeScreenCache = useAppStore((state) => state.clearHomeScreenCache);
  const clearDailyDataScreenCache = useAppStore((state) => state.clearDailyDataScreenCache);
  const setCashOverviewData = useAppStore((state) => state.setCashOverviewData);
  const [item, setItem] = useState<ExpenseDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(expenseId));
  const [deleting, setDeleting] = useState(false);

  const fetchExpense = useCallback(async () => {
    if (!expenseId) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get<ExpenseDetail>(`/api/v1/restaurant/expenses/${expenseId}`);
      setItem(response.data);
    } catch (error: any) {
      showErrorMessage(
        error?.response?.data?.detail || error?.message || 'Could not load expense details.',
        'Load failed'
      );
    } finally {
      setLoading(false);
    }
  }, [expenseId]);

  useEffect(() => {
    void fetchExpense();
  }, [fetchExpense]);

  const amountLabel = useMemo(() => formatCurrency(item?.amount ?? 0), [item?.amount]);
  const isSourceControlled = Boolean(item?.source_kind);

  const deleteExpense = async () => {
    if (!item) {
      return;
    }

    setDeleting(true);
    try {
      showInfoMessage('Deleting expense...');
      await apiClient.delete(`/api/v1/restaurant/expenses/${item.id}`);
      clearHomeScreenCache();
      clearDailyDataScreenCache();
      setCashOverviewData(null);
      showSuccessMessage('Expense deleted successfully.');
      router.back();
    } catch (error: any) {
      showErrorMessage(
        error?.response?.data?.error?.message ||
          error?.response?.data?.detail ||
          error?.message ||
          'Could not delete this expense.',
        'Delete failed'
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = () => {
    showDialog('Delete Expense', 'Delete this expense permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteExpense();
        },
      },
    ]);
  };

  return (
    <View style={styles.safeArea}>
      <Header title="Expense Details" showBack={true} />

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color="#FA8C4C" />
        </View>
      ) : !item ? (
        <View style={styles.centerState}>
          <Feather name="alert-circle" size={moderateScale(34)} color="#EF4444" />
          <Text style={styles.emptyTitle}>Expense not found</Text>
          <Text style={styles.emptySubtitle}>This expense record could not be loaded.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Feather name="credit-card" size={moderateScale(24)} color="#FFFFFF" />
            </View>
            <Text style={styles.summaryCategory}>{item.category}</Text>
            <Text style={styles.summaryAmount}>{amountLabel}</Text>
            <Text style={styles.summaryDate}>{formatDate(item.expense_date)}</Text>
          </View>

          {isSourceControlled ? (
            <View style={styles.noticeCard}>
              <Feather name="info" size={moderateScale(18)} color="#FA8C4C" />
              <Text style={styles.noticeText}>{sourceNoticeText(item)}</Text>
            </View>
          ) : null}

          <View style={styles.detailsCard}>
            <DetailRow label="Category" value={item.category} />
            <DetailRow label="Amount" value={amountLabel} />
            <DetailRow label="Expense Date" value={formatDate(item.expense_date)} />
            <DetailRow label="Section" value={item.section === 'bank' ? 'Bank' : 'Cash'} />
            <DetailRow label="Source" value={formatSource(item.source_kind)} />
            {item.source_id ? <DetailRow label="Source ID" value={item.source_id} /> : null}
            <DetailRow label="Created" value={formatDate(item.created_at)} />
            <DetailRow label="Notes" value={item.notes || 'No notes'} />
          </View>

          {!isSourceControlled ? (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="trash-2" size={moderateScale(16)} color="#FFFFFF" />
                  <Text style={styles.deleteButtonText}>Delete Expense</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(24),
  },
  emptyTitle: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(18, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  emptySubtitle: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(14, 0.3),
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
  },
  summaryCard: {
    backgroundColor: '#111827',
    borderRadius: scale(22),
    padding: scale(22),
    alignItems: 'center',
    marginBottom: verticalScale(18),
  },
  summaryIcon: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(18),
    backgroundColor: '#FA8C4C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  summaryCategory: {
    color: '#F9FAFB',
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    marginBottom: verticalScale(8),
  },
  summaryAmount: {
    color: '#FFFFFF',
    fontSize: moderateScale(30, 0.3),
    fontWeight: '900',
    marginBottom: verticalScale(6),
  },
  summaryDate: {
    color: '#D1D5DB',
    fontSize: moderateScale(13, 0.3),
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(18),
    paddingHorizontal: scale(16),
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF8F3',
    borderWidth: 1,
    borderColor: '#FCE7D6',
    borderRadius: scale(14),
    padding: scale(14),
    marginBottom: verticalScale(16),
  },
  noticeText: {
    flex: 1,
    color: '#4B5563',
    fontSize: moderateScale(13, 0.3),
    lineHeight: moderateScale(19),
    marginLeft: scale(10),
  },
  detailRow: {
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: moderateScale(12, 0.3),
    color: '#6B7280',
    fontWeight: '700',
    marginBottom: verticalScale(6),
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: moderateScale(16, 0.3),
    color: '#111827',
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(48),
    marginTop: verticalScale(18),
    borderRadius: scale(12),
    backgroundColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15, 0.3),
    fontWeight: '800',
    marginLeft: scale(8),
  },
});
