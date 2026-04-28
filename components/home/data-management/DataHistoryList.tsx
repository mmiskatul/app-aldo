import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Skeleton, { SkeletonCard } from '../../ui/Skeleton';

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
  onDeleteUnavailable?: () => void;
}

const SEGMENTS: { key: DataHistorySegment; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

export default function DataHistoryList({
  items,
  loading = false,
  selectedSegment,
  onSegmentChange,
  onDelete,
  onDeleteUnavailable,
}: DataHistoryListProps) {
  const router = useRouter();
  const emptyTitle =
    selectedSegment === 'date'
      ? 'No date data found'
      : selectedSegment === 'week'
        ? 'No weekly data found'
        : 'No monthly data found';
  const emptySubtitle =
    selectedSegment === 'date'
      ? 'No row data found for this date view.'
      : selectedSegment === 'week'
        ? 'No row data found for this week view.'
        : 'No row data found for this month view.';

  return (
    <View style={styles.container}>
      <View style={styles.segmentContainer}>
        {SEGMENTS.map((tab) => {
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
                {selectedSegment === 'date' ? (
                  <TouchableOpacity
                    style={styles.actionIcon}
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
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <View style={styles.dataGrid}>
              <View style={styles.dataCol}>
                <Text style={styles.dataLabel}>REVENUE</Text>
                <Text style={styles.dataValue}>{entry.revenue}</Text>
              </View>
              <View style={styles.dataCol}>
                <Text style={styles.dataLabel}>COVERS</Text>
                <Text style={styles.dataValue}>{entry.covers}</Text>
              </View>
              <View style={styles.dataCol}>
                <Text style={styles.dataLabel}>AVG.</Text>
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: scale(16),
    padding: scale(4),
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
