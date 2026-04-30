import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import apiClient from '../../../api/apiClient';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Header from '../../../components/ui/Header';
import { useAppStore } from '../../../store/useAppStore';

import DatePicker from '../../../components/ui/DatePicker';
import { showErrorMessage } from '../../../utils/feedback';
import { useTranslation } from '../../../utils/i18n';

export default function AddInventoryItemScreen() {
  const { t } = useTranslation();
  const bumpInventoryRefreshToken = useAppStore((state) => state.bumpInventoryRefreshToken);
  const clearHomeScreenCache = useAppStore((state) => state.clearHomeScreenCache);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [unitType, setUnitType] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('');
  const [saving, setSaving] = useState(false);

  const buildErrorMessage = (error: any) => {
    const detail = error?.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail.map((item) => item?.msg || t('invalid_field')).join('\n');
    }
    if (typeof detail === 'string') {
      return detail;
    }
    return error?.message || t('unable_to_save_inventory_item');
  };

  const handleSave = async () => {
    const trimmedProductName = productName.trim();
    const trimmedCategory = category.trim();
    const trimmedUnitType = unitType.trim();
    const trimmedSupplierName = supplierName.trim();
    const parsedStockQuantity = Number(stockQuantity);
    const parsedUnitPrice = Number(unitPrice || 0);
    const parsedAlertThreshold = Number(alertThreshold || 0);

    if (trimmedProductName.length < 2) {
      showErrorMessage(t('product_name_min_length'), t('validation'));
      return;
    }
    if (trimmedCategory.length < 2) {
      showErrorMessage(t('category_min_length'), t('validation'));
      return;
    }
    if (trimmedUnitType.length < 1) {
      showErrorMessage(t('unit_type_required'), t('validation'));
      return;
    }
    if (!Number.isFinite(parsedStockQuantity) || parsedStockQuantity < 0) {
      showErrorMessage(t('stock_quantity_invalid'), t('validation'));
      return;
    }
    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice < 0) {
      showErrorMessage(t('unit_price_invalid'), t('validation'));
      return;
    }
    if (!Number.isFinite(parsedAlertThreshold) || parsedAlertThreshold < 0) {
      showErrorMessage(t('alert_threshold_invalid'), t('validation'));
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/api/v1/restaurant/inventory/add-item', {
        product_name: trimmedProductName,
        category: trimmedCategory,
        stock_quantity: parsedStockQuantity,
        unit_type: trimmedUnitType,
        supplier_name: trimmedSupplierName || null,
        unit_price: parsedUnitPrice,
        alert_threshold: parsedAlertThreshold,
        purchase_date: purchaseDate.toISOString().slice(0, 10),
      });
      bumpInventoryRefreshToken();
      clearHomeScreenCache();
      router.replace({
        pathname: '/(tabs)/inventory',
        params: {
          notice: 'item-added',
          noticeKey: String(Date.now()),
        },
      });
    } catch (error: any) {
      showErrorMessage(buildErrorMessage(error), t('save_failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.safe}>
      <Header title={t('add_inventory_item')} showBack={true} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>{t('add_inventory_item')}</Text>
          <Text style={styles.pageSubtitle}>{t('add_inventory_item_subtitle')}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('product_name')}</Text>
            <TextInput style={styles.input} placeholder={t('product_name_placeholder')} placeholderTextColor="#9CA3AF" value={productName} onChangeText={setProductName} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('category')}</Text>
            <TextInput style={styles.input} placeholder={t('select_category')} placeholderTextColor="#9CA3AF" value={category} onChangeText={setCategory} />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>{t('form_stock_quantity')}</Text>
              <TextInput style={styles.input} placeholder="0" keyboardType="numeric" placeholderTextColor="#9CA3AF" value={stockQuantity} onChangeText={setStockQuantity} />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>{t('unit_type')}</Text>
              <TextInput style={styles.input} placeholder="kg" placeholderTextColor="#9CA3AF" value={unitType} onChangeText={setUnitType} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('supplier_name')}</Text>
            <TextInput style={styles.input} placeholder={t('enter_supplier_name')} placeholderTextColor="#9CA3AF" value={supplierName} onChangeText={setSupplierName} />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>{t('unit_price')}</Text>
              <TextInput style={styles.input} placeholder="0.00" keyboardType="decimal-pad" placeholderTextColor="#9CA3AF" value={unitPrice} onChangeText={setUnitPrice} />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>{t('alert_threshold')}</Text>
              <TextInput style={styles.input} placeholder={t('low_stock_at')} keyboardType="numeric" placeholderTextColor="#9CA3AF" value={alertThreshold} onChangeText={setAlertThreshold} />
            </View>
          </View>

          <DatePicker
            label={t('purchase_date')}
            value={purchaseDate}
            onChange={setPurchaseDate}
          />

          <View style={{ height: verticalScale(40) }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={() => void handleSave()} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="save" size={moderateScale(18)} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>{t('save_item')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1, paddingHorizontal: scale(20) },
  pageTitle: { fontSize: moderateScale(20), fontWeight: '700', color: '#111827', marginTop: verticalScale(10) },
  pageSubtitle: { fontSize: moderateScale(14), color: '#6B7280', marginTop: verticalScale(6), marginBottom: verticalScale(24) },
  formGroup: { marginBottom: verticalScale(16) },
  row: { flexDirection: 'row', gap: scale(12) },
  label: { fontSize: moderateScale(12), fontWeight: '700', color: '#111827', marginBottom: verticalScale(8) },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(10),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#111827',
  },
  footer: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveBtn: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(10),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    gap: scale(8),
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: moderateScale(15), fontWeight: '600' },
});
