import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from '../../../utils/i18n';

export interface InventorySupplierCardItem {
  supplierName: string;
  supplierRole: string;
  lastPurchase: string;
  pricePerUnitLabel: string;
}

export function SupplierCard({ item }: { item: InventorySupplierCardItem }) {
  const { t } = useTranslation();

  return (
    <View>
      <Text style={styles.sectionTitle}>{t('supplier_details')}</Text>
      <View style={styles.supplierCard}>
        <View style={styles.supplierHeader}>
          <View style={styles.supplierIconBox}>
            <Feather name="truck" size={moderateScale(20)} color="#6B7280" />
          </View>
          <View>
            <Text style={styles.supplierName}>{item.supplierName}</Text>
            <Text style={styles.supplierRole}>{item.supplierRole}</Text>
          </View>
        </View>
        <View style={styles.supplierMetaRow}>
          <View>
            <Text style={styles.metaLabel}>{t('last_purchase')}</Text>
            <Text style={styles.metaValue}>{item.lastPurchase}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>{t('price_per_unit')}</Text>
            <Text style={styles.metaValue}>{item.pricePerUnitLabel}</Text>
          </View>
        </View>
      </View>
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
  supplierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: scale(16),
    marginBottom: verticalScale(24),
  },
  supplierHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(16) },
  supplierIconBox: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: scale(10),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  supplierName: { fontSize: moderateScale(14), fontWeight: '700', color: '#111827' },
  supplierRole: { fontSize: moderateScale(12), color: '#9CA3AF', marginTop: 2 },
  supplierMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { fontSize: moderateScale(9), color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.5 },
  metaValue: { fontSize: moderateScale(13), fontWeight: '700', color: '#111827', marginTop: verticalScale(4) },
});
