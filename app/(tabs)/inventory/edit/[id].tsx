import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import apiClient from '../../../../api/apiClient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import DatePicker from '../../../../components/ui/DatePicker';
import Header from '../../../../components/ui/Header';
import { useAppStore } from '../../../../store/useAppStore';
import { showErrorMessage } from '../../../../utils/feedback';
import { useTranslation } from '../../../../utils/i18n';

interface InventoryDetailResponse {
  id: string;
  product_name: string;
  category: string;
  stock_quantity: number;
  unit_type: string;
  supplier_name?: string | null;
  unit_price: number;
  alert_threshold: number;
  purchase_date?: string | null;
}

const parseDateValue = (value?: string | null) => {
  if (!value) {
    return new Date();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default function EditInventoryItemScreen() {
  const { t } = useTranslation();
  const bumpInventoryRefreshToken = useAppStore((state) => state.bumpInventoryRefreshToken);
  const clearHomeScreenCache = useAppStore((state) => state.clearHomeScreenCache);
  const inventoryDetailCache = useAppStore((state) => state.inventoryDetailCache);
  const setInventoryDetailCacheItem = useAppStore((state) => state.setInventoryDetailCacheItem);
  const { id } = useLocalSearchParams();
  const itemId = Array.isArray(id) ? id[0] : id;
  const cachedItem = itemId ? inventoryDetailCache[itemId] : null;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [unitType, setUnitType] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('');

  useEffect(() => {
    if (!cachedItem) {
      return;
    }
    setProductName(cachedItem.product_name);
    setCategory(cachedItem.category);
    setStockQuantity(String(cachedItem.stock_quantity));
    setUnitType(cachedItem.unit_type);
    setSupplierName(cachedItem.supplier_name || '');
    setUnitPrice(String(cachedItem.unit_price));
    setAlertThreshold(String(cachedItem.alert_threshold));
    setPurchaseDate(parseDateValue(cachedItem.purchase_date));
    setLoading(false);
  }, [cachedItem]);

  const buildErrorMessage = (error: any) => {
    const detail = error?.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail.map((item: any) => item?.msg || 'Invalid field').join('\n');
    }
    if (typeof detail === 'string') {
      return detail;
    }
    return error?.message || 'Unable to save inventory item.';
  };

  useEffect(() => {
    const loadItem = async () => {
      if (!itemId) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get<InventoryDetailResponse>(`/api/v1/restaurant/inventory/${itemId}`);
        const item = response.data;
        setInventoryDetailCacheItem(itemId, item);
        setProductName(item.product_name);
        setCategory(item.category);
        setStockQuantity(String(item.stock_quantity));
        setUnitType(item.unit_type);
        setSupplierName(item.supplier_name || '');
        setUnitPrice(String(item.unit_price));
        setAlertThreshold(String(item.alert_threshold));
        setPurchaseDate(parseDateValue(item.purchase_date));
      } catch (error: any) {
        showErrorMessage(buildErrorMessage(error), 'Load failed');
      } finally {
        setLoading(false);
      }
    };

    void loadItem();
  }, [itemId, setInventoryDetailCacheItem]);

  const handleSave = async () => {
    if (!itemId) {
      return;
    }

    const trimmedProductName = productName.trim();
    const trimmedCategory = category.trim();
    const trimmedUnitType = unitType.trim();
    const trimmedSupplierName = supplierName.trim();
    const parsedStockQuantity = Number(stockQuantity);
    const parsedUnitPrice = Number(unitPrice || 0);
    const parsedAlertThreshold = Number(alertThreshold || 0);

    if (trimmedProductName.length < 2) {
      showErrorMessage('Product name must be at least 2 characters.', 'Validation');
      return;
    }
    if (trimmedCategory.length < 2) {
      showErrorMessage('Category must be at least 2 characters.', 'Validation');
      return;
    }
    if (trimmedUnitType.length < 1) {
      showErrorMessage('Unit type is required.', 'Validation');
      return;
    }
    if (!Number.isFinite(parsedStockQuantity) || parsedStockQuantity < 0) {
      showErrorMessage('Stock quantity must be a valid number.', 'Validation');
      return;
    }
    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice < 0) {
      showErrorMessage('Unit price must be a valid number.', 'Validation');
      return;
    }
    if (!Number.isFinite(parsedAlertThreshold) || parsedAlertThreshold < 0) {
      showErrorMessage('Alert threshold must be a valid number.', 'Validation');
      return;
    }

    setSaving(true);
    try {
      const response = await apiClient.patch(`/api/v1/restaurant/inventory/${itemId}`, {
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
      setInventoryDetailCacheItem(itemId, response.data);
      router.replace({
        pathname: '/(tabs)/inventory',
        params: {
          notice: 'item-updated',
          noticeKey: String(Date.now()),
        },
      });
    } catch (error: any) {
      showErrorMessage(buildErrorMessage(error), 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.safe}>
        <Header title={t('edit_item')} showBack={true} />
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color="#FA8C4C" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <Header title={t('edit_item')} showBack={true} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>{t('edit_item')}</Text>
          <Text style={styles.pageSubtitle}>Update this inventory item and keep linked expenses in sync.</Text>

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
                <Text style={styles.saveBtnText}>Save Changes</Text>
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
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
