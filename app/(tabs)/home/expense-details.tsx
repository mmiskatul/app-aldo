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
import { useTranslation } from '../../../utils/i18n';

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

const formatSource = (value: string | null | undefined, t: ReturnType<typeof useTranslation>['t']) => {
  if (!value) {
    return t('manual');
  }
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const sourceNoticeText = (item: ExpenseDetail, t: ReturnType<typeof useTranslation>['t']) => {
  switch (item.source_kind) {
    case 'manual_entry':
      return t('expense_generated_daily_data');
    case 'document':
      return t('expense_generated_document');
    case 'inventory':
      return t('expense_generated_inventory');
    default:
      return t('expense_generated_source');
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
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const expenseId = toSingleParam(id);
  const clearHomeScreenCache = useAppStore((state) => state.clearHomeScreenCache);
  const clearDailyDataScreenCache = useAppStore((state) => state.clearDailyDataScreenCache);
  const clearAnalyticsScreenCache = useAppStore((state) => state.clearAnalyticsScreenCache);
  const clearExpensesScreenCache = useAppStore((state) => state.clearExpensesScreenCache);
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
        error?.response?.data?.detail || error?.message || t('could_not_load_expense_details'),
        t('load_failed')
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
  const sourceRoute = useMemo(() => {
    if (!item?.source_kind) {
      return null;
    }
    if (item.source_kind === 'document' && item.source_id) {
      return `/(tabs)/documents/${item.source_id}`;
    }
    if (item.source_kind === 'manual_entry' && item.source_id) {
      return `/(tabs)/home/daily-record-details?dataId=${item.source_id}`;
    }
    if (item.source_kind === 'inventory' && item.source_inventory_item_id) {
      return `/(tabs)/inventory/${item.source_inventory_item_id}`;
    }
    return null;
  }, [item]);

  const deleteExpense = async () => {
    if (!item) {
      return;
    }

    setDeleting(true);
    try {
      showInfoMessage(t('deleting_expense'));
      await apiClient.delete(`/api/v1/restaurant/expenses/${item.id}`);
      clearHomeScreenCache();
      clearDailyDataScreenCache();
      clearAnalyticsScreenCache();
      clearExpensesScreenCache();
      setCashOverviewData(null);
      showSuccessMessage(t('expense_deleted'));
      router.back();
    } catch (error: any) {
      showErrorMessage(
          error?.response?.data?.error?.message ||
          error?.response?.data?.detail ||
          error?.message ||
          t('could_not_delete_expense'),
        t('delete_failed')
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = () => {
    showDialog(t('delete_expense'), t('delete_expense_message'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          void deleteExpense();
        },
      },
    ]);
  };

  return (
    <View style={styles.safeArea}>
      <Header title={t('expense_details')} showBack={true} />

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color="#FA8C4C" />
        </View>
      ) : !item ? (
        <View style={styles.centerState}>
          <Feather name="alert-circle" size={moderateScale(34)} color="#EF4444" />
          <Text style={styles.emptyTitle}>{t('expense_not_found')}</Text>
          <Text style={styles.emptySubtitle}>{t('expense_not_found_subtitle')}</Text>
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
              <Text style={styles.noticeText}>{sourceNoticeText(item, t)}</Text>
            </View>
          ) : null}

          {isSourceControlled && sourceRoute ? (
            <TouchableOpacity
              style={styles.sourceButton}
              onPress={() => router.push(sourceRoute as any)}
            >
              <Feather name="external-link" size={moderateScale(16)} color="#FA8C4C" />
              <Text style={styles.sourceButtonText}>{t('open_source_record')}</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.detailsCard}>
            <DetailRow label={t('category')} value={item.category} />
            <DetailRow label={t('amount')} value={amountLabel} />
            <DetailRow label={t('expense_date')} value={formatDate(item.expense_date)} />
            <DetailRow label={t('section')} value={item.section === 'bank' ? t('bank') : t('cash')} />
            <DetailRow label={t('source')} value={formatSource(item.source_kind, t)} />
            {item.source_id ? <DetailRow label={t('source_id')} value={item.source_id} /> : null}
            <DetailRow label={t('created')} value={formatDate(item.created_at)} />
            <DetailRow label={t('notes')} value={item.notes || t('no_notes')} />
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
                  <Text style={styles.deleteButtonText}>{t('delete_expense_button')}</Text>
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
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7F2',
    borderWidth: 1,
    borderColor: '#FCE7D6',
    borderRadius: scale(14),
    paddingVertical: verticalScale(13),
    marginBottom: verticalScale(16),
    gap: scale(8),
  },
  sourceButtonText: {
    color: '#FA8C4C',
    fontSize: moderateScale(13, 0.3),
    fontWeight: '700',
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
