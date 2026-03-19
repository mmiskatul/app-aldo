import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Header from "../../../components/ui/Header";

import { HistoryList } from '../../../components/inventory/view-stock/HistoryList';
import { StockUpdate } from '../../../components/inventory/view-stock/StockUpdate';
import { SupplierCard } from '../../../components/inventory/view-stock/SupplierCard';
import { INVENTORY_ITEMS } from './index';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const item = INVENTORY_ITEMS.find((i) => i.id === id) || INVENTORY_ITEMS[0];

  return (
    <View style={styles.safe}>
      <Header 
        title={item.name} 
        subtitle={item.category.toUpperCase()} 
        showBack={true} 
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Current Stock Banner */}
        <View style={styles.stockBanner}>
          <View>
            <Text style={styles.bannerLabel}>Current Stock</Text>
            <View style={styles.bannerValContainer}>
              <Text style={styles.bannerVal}>{item.currentStock}</Text>
              <Text style={styles.bannerUnit}>{item.unit}</Text>
            </View>
          </View>
          <View style={styles.bannerIcon}>
            <Feather name="package" size={moderateScale(24)} color="#FFFFFF" />
          </View>
        </View>

        {/* Components */}
        <StockUpdate />
        <SupplierCard item={item} />
        <HistoryList item={item} />

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Feather name="edit" size={moderateScale(16)} color="#6B7280" />
            <Text style={styles.secondaryBtnText}>Edit Item</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: '#FEE2E2' }]}>
            <Feather name="trash-2" size={moderateScale(16)} color="#DC2626" />
            <Text style={[styles.secondaryBtnText, { color: '#DC2626' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
  },
  backBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: moderateScale(16), fontWeight: '700', color: '#111827' },
  headerSubtitle: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#FA8C4C',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  scroll: { flex: 1, paddingHorizontal: scale(20) },

  stockBanner: {
    backgroundColor: '#FFF4EE',
    borderRadius: scale(14),
    padding: scale(18),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(20),
  },
  bannerLabel: { fontSize: moderateScale(12), color: '#6B7280', fontWeight: '500' },
  bannerValContainer: { flexDirection: 'row', alignItems: 'baseline', marginTop: verticalScale(4) },
  bannerVal: { fontSize: moderateScale(28), fontWeight: '800', color: '#111827' },
  bannerUnit: { fontSize: moderateScale(14), color: '#4B5563', marginLeft: scale(6) },
  bannerIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: '#FA8C4C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FA8C4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(12),
  },

  updateRow: { flexDirection: 'row', gap: scale(12), marginBottom: verticalScale(12) },
  updateBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: scale(12),
    padding: scale(14),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  updateLabel: { fontSize: moderateScale(10), fontWeight: '700', color: '#111827', marginBottom: verticalScale(8) },
  updateControls: { flexDirection: 'row', alignItems: 'center', gap: scale(8) },
  updateNum: { fontSize: moderateScale(18), fontWeight: '700', color: '#111827' },

  updateButton: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(10),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  updateButtonText: { color: '#FFFFFF', fontSize: moderateScale(14), fontWeight: '600' },

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

  bottomActions: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(24),
    marginBottom: verticalScale(40),
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    paddingVertical: verticalScale(14),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: { fontSize: moderateScale(14), fontWeight: '500', color: '#4B5563' },
});
