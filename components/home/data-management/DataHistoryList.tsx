import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';

interface DataEntry {
  id: string;
  label: string;
  date: string;
  revenue: string;
  covers: string;
  avg: string;
}

const MOCK_HISTORY: DataEntry[] = [
  { id: '1', label: 'YESTERDAY', date: 'Feb 25, 2026', revenue: '$1,120', covers: '38', avg: '$29.47' },
  { id: '2', label: 'WEDNESDAY', date: 'Feb 06, 2026', revenue: '$985', covers: '32', avg: '$30.78' },
  { id: '3', label: 'TUESDAY', date: 'Feb 05, 2026', revenue: '$1,450', covers: '51', avg: '$28.43' },
];

export default function DataHistoryList() {
  const [selectedSegment, setSelectedSegment] = useState<'Date' | 'Week' | 'Month'>('Date');

  return (
    <View style={styles.container}>
      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        {['Date', 'Week', 'Month'].map((tab) => {
          const isActive = selectedSegment === tab;
          return (
            <TouchableOpacity 
              key={tab} 
              style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
              onPress={() => setSelectedSegment(tab as any)}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* History List */}
      {MOCK_HISTORY.map((entry) => (
        <View key={entry.id} style={styles.historyCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.entryLabel}>{entry.label}</Text>
              <Text style={styles.entryDate}>{entry.date}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionIcon}>
                <Feather name="eye" size={moderateScale(16)} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon}>
                <Feather name="trash-2" size={moderateScale(16)} color="#EF4444" />
              </TouchableOpacity>
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
              <Text style={styles.dataValue}>{entry.avg}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: verticalScale(100), // padding for the floating button
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
});
