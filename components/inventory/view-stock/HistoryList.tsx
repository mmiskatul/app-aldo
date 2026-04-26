import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from '../../../utils/i18n';

export interface InventoryHistoryListItem {
  type: 'add' | 'remove' | 'purchase';
  label: string;
  date: string;
  amount: string;
}

export function HistoryList({ item }: { item: { history: InventoryHistoryListItem[] } }) {
  const { t } = useTranslation();

  return (
    <View>
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>{t('history')}</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>{t('see_all')}</Text>
        </TouchableOpacity>
      </View>

      {item.history.map((hist, index) => (
        <View key={index} style={styles.historyItem}>
          <View
            style={[
              styles.historyIconBox,
              hist.type === 'add'
                ? { backgroundColor: '#DCFCE7' }
                : hist.type === 'remove'
                  ? { backgroundColor: '#FEE2E2' }
                  : { backgroundColor: '#DBEAFE' },
            ]}
          >
            <Feather
              name={hist.type === 'add' ? 'plus' : hist.type === 'remove' ? 'minus' : 'shopping-bag'}
              size={moderateScale(16)}
              color={hist.type === 'add' ? '#16A34A' : hist.type === 'remove' ? '#DC2626' : '#2563EB'}
            />
          </View>
          <View style={styles.historyMeta}>
            <Text style={styles.historyLabel}>{hist.label}</Text>
            <Text style={styles.historyDate}>{hist.date}</Text>
          </View>
          <Text
            style={[
              styles.historyAmount,
              hist.type === 'add'
                ? { color: '#16A34A' }
                : hist.type === 'remove'
                  ? { color: '#DC2626' }
                  : { color: '#111827' },
            ]}
          >
            {hist.amount}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  viewAllText: { fontSize: moderateScale(13), color: '#FA8C4C', fontWeight: '500' },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyIconBox: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  historyMeta: { flex: 1 },
  historyLabel: { fontSize: moderateScale(14), fontWeight: '600', color: '#111827' },
  historyDate: { fontSize: moderateScale(11), color: '#9CA3AF', marginTop: 2 },
  historyAmount: { fontSize: moderateScale(14), fontWeight: '700' },
});
