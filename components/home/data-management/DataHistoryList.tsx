import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Skeleton, { SkeletonCard } from '../../ui/Skeleton';
import { useTranslation } from '../../../utils/i18n';

export type DataHistorySegment = 'date' | 'week' | 'month';

export interface DataHistoryEntry {
  id: string;
  recordId?: string | null;
  deleteId?: string | null;
  deleteMode?: "record" | "date";
  label: string;
  date: string;
  referenceDate: string;
  revenue: string;
  covers: string;
  average: string;
  canDelete?: boolean;
}

interface DataHistoryListProps {
  items: DataHistoryEntry[];
  loading?: boolean;
  selectedSegment: DataHistorySegment;
  onSegmentChange: (segment: DataHistorySegment) => void;
  onDelete: (recordId: string) => void;
  onEdit?: (recordId: string) => void;
  onDeleteUnavailable?: () => void;
}

const shortId = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 8 ? trimmed.slice(-8) : trimmed;
};

export default function DataHistoryList({
  items,
  loading = false,
  selectedSegment,
  onSegmentChange,
  onDelete,
  onEdit,
  onDeleteUnavailable,
}: DataHistoryListProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const segments: { key: DataHistorySegment; label: string }[] = [
    { key: 'date', label: t('date_tab') },
    { key: 'week', label: t('week_tab') },
    { key: 'month', label: t('month_tab') },
  ];
  const emptyTitle =
    selectedSegment === 'date'
      ? t('no_date_data_found')
      : selectedSegment === 'week'
        ? t('no_weekly_data_found')
        : t('no_monthly_data_found');
  const emptySubtitle =
    selectedSegment === 'date'
      ? t('no_row_data_date_view')
      : selectedSegment === 'week'
        ? t('no_row_data_week_view')
        : t('no_row_data_month_view');

  return (
    <View style={styles.container}>
      <View style={styles.segmentContainer}>
        {segments.map((tab) => {
          const isActive = selectedSegment === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
              onPress={() => onSegmentChange(tab.key)}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <SkeletonCard key={index} style={styles.historyCard}>
            <View style={styles.cardHeader}>
              <View>
                <Skeleton width={scale(80)} height={moderateScale(9)} borderRadius={5} />
                <Skeleton width={scale(120)} height={moderateScale(14)} borderRadius={7} style={styles.gap6} />
              </View>
              <View style={styles.cardActions}>
                <Skeleton width={moderateScale(20)} height={moderateScale(20)} borderRadius={10} />
                <Skeleton width={moderateScale(20)} height={moderateScale(20)} borderRadius={10} style={styles.iconGap} />
              </View>
            </View>
            <View style={styles.dataGrid}>
              {[0, 1, 2].map((item) => (
                <View key={item} style={styles.dataCol}>
                  <Skeleton width={scale(46)} height={moderateScale(8)} borderRadius={4} />
                  <Skeleton width={scale(56)} height={moderateScale(12)} borderRadius={6} style={styles.gap6} />
                </View>
              ))}
            </View>
          </SkeletonCard>
        ))
      ) : items.length > 0 ? (
        items.map((entry) => (
          <View key={entry.id} style={styles.historyCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.entryLabel}>{entry.label}</Text>
                <Text style={styles.entryDate}>{entry.date}</Text>
                {selectedSegment === 'date' && entry.recordId ? (
                  <Text style={styles.entryId}>{t('id_short')} {shortId(entry.recordId)}</Text>
                ) : null}
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={() => {
                    const detailRoute = `/(tabs)/home/daily-record-details?dataId=${encodeURIComponent(entry.id)}`;
                    router.push(detailRoute as any);
                  }}
                >
                  <Feather name="eye" size={moderateScale(16)} color="#374151" />
                </TouchableOpacity>
                {selectedSegment === 'date' && entry.recordId ? (
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => onEdit?.(entry.recordId as string)}
                  >
                    <Feather name="edit-2" size={moderateScale(16)} color="#FA8C4C" />
                  </TouchableOpacity>
                ) : null}
                {selectedSegment === 'date' ? (
                  <TouchableOpacity
                    style={[
                      styles.deleteActionButton,
                      !entry.canDelete && styles.deleteActionButtonDisabled,
                    ]}
                    onPress={() => {
                      if (entry.canDelete) {
                        onDelete(`${entry.deleteMode || 'date'}:${entry.deleteId || entry.id}`);
                        return;
                      }
                      onDeleteUnavailable?.();
                    }}
                  >
                    <Feather
                      name="trash-2"
                      size={moderateScale(16)}
                      color={entry.canDelete ? '#EF4444' : '#CBD5E1'}
                    />
                    <Text
                      style={[
                        styles.deleteActionText,
                        !entry.canDelete && styles.deleteActionTextDisabled,
                      ]}
                    >
                      {t('delete')}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <View style={styles.dataGrid}>
              <View style={styles.dataCol}>
                <Text style={styles.dataLabel}>{t('revenue_short').toUpperCase()}</Text>
                <Text style={styles.dataValue}>{entry.revenue}</Text>
              </View>
              <View style={styles.dataCol}>
                <Text style={styles.dataLabel}>{t('covers_short').toUpperCase()}</Text>
                <Text style={styles.dataValue}>{entry.covers}</Text>
              </View>
              <View style={styles.dataCol}>
                <Text style={styles.dataLabel}>{t('average_short').toUpperCase()}</Text>
                <Text style={styles.dataValue}>{entry.average}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: verticalScale(100),
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: scale(8),
    padding: scale(4),
    marginBottom: verticalScale(16),
  },
  segmentButton: {
    flex: 1,
    paddingVertical: verticalScale(8),
    alignItems: 'center',
    borderRadius: scale(6),
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#111827',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
  },
  entryLabel: {
    fontSize: moderateScale(9, 0.3),
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: verticalScale(2),
  },
  entryDate: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  entryId: {
    marginTop: verticalScale(3),
    fontSize: moderateScale(10, 0.3),
    fontWeight: '700',
    color: '#9CA3AF',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: scale(16),
    padding: scale(4),
  },
  deleteActionButton: {
    marginLeft: scale(14),
    paddingHorizontal: scale(10),
    minHeight: verticalScale(30),
    borderRadius: scale(999),
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  deleteActionButtonDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  deleteActionText: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '700',
    color: '#DC2626',
  },
  deleteActionTextDisabled: {
    color: '#94A3B8',
  },
  dataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataCol: {
    flex: 1,
  },
  dataLabel: {
    fontSize: moderateScale(9, 0.3),
    fontWeight: '800',
    color: '#9CA3AF',
    marginBottom: verticalScale(4),
  },
  dataValue: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(36),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(16),
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  emptySubtitle: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(12, 0.3),
    color: '#6B7280',
  },
  gap6: {
    marginTop: verticalScale(6),
  },
  iconGap: {
    marginLeft: scale(16),
  },
});
