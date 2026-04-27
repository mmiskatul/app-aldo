import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from '../../../utils/i18n';

export interface InventoryCardItem {
  id: string;
  name: string;
  supplier: string;
  status: string;
  statusColor: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lastPurchase: string;
  icon: string;
}

interface InventoryCardProps {
  item: InventoryCardItem;
  onView: (itemId: string) => void;
}

export function InventoryCard({ item, onView }: InventoryCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Text style={styles.iconEmoji}>{item.icon}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardSupplier}>{item.supplier}</Text>
        </View>
        <Text style={[styles.statusBadge, { color: item.statusColor }]}>
          {t(item.status.toLowerCase() as never).toUpperCase()}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <View>
            <Text style={styles.footerLabel}>{t('stock_quantity')}</Text>
            <Text style={styles.footerValue}>
              {item.quantity} {item.unit}
            </Text>
          </View>
          <View>
            <Text style={styles.footerLabel}>{t('last_purchase')}</Text>
            <Text style={styles.footerValue}>{item.lastPurchase}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.viewButton} onPress={() => onView(item.id)} accessibilityLabel="View item">
          <Feather name="eye" size={moderateScale(17)} color="#475467" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: scale(14),
    marginBottom: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(10) },
  iconBox: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: scale(10),
    backgroundColor: '#FFF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  iconEmoji: { fontSize: moderateScale(20) },
  cardMeta: { flex: 1 },
  cardName: { fontSize: moderateScale(14), fontWeight: '700', color: '#111827' },
  cardSupplier: { fontSize: moderateScale(11), color: '#9CA3AF', marginTop: 2 },
  statusBadge: { fontSize: moderateScale(10), fontWeight: '700' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: scale(12),
  },
  footerLabel: { fontSize: moderateScale(9), color: '#9CA3AF', fontWeight: '600', letterSpacing: 0.4 },
  footerValue: { fontSize: moderateScale(13), fontWeight: '600', color: '#111827', marginTop: 2 },
  viewButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    borderWidth: 1,
    borderColor: '#EAECF0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: scale(10),
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
});
