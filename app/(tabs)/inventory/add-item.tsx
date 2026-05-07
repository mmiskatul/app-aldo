import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import apiClient from '../../../api/apiClient';
import { getInventoryCategories, getInventorySuppliers, InventoryMetaItem } from '../../../api/inventoryMeta';
import React, { useEffect, useMemo, useState } from 'react';
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
  const [categoryOptions, setCategoryOptions] = useState<InventoryMetaItem[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<InventoryMetaItem[]>([]);
  const [categoryFocused, setCategoryFocused] = useState(false);
  const [unitTypeFocused, setUnitTypeFocused] = useState(false);
  const [supplierFocused, setSupplierFocused] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadInventoryMeta = async () => {
      try {
        const [categories, suppliers] = await Promise.all([
          getInventoryCategories(),
          getInventorySuppliers(),
        ]);

        if (!isActive) {
          return;
        }

        setCategoryOptions(categories);
        setSupplierOptions(suppliers);
      } catch {
        if (!isActive) {
          return;
        }
        setCategoryOptions([]);
        setSupplierOptions([]);
      }
    };

    void loadInventoryMeta();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredCategoryOptions = useMemo(() => {
    const query = category.trim().toLowerCase();
    if (query.length < 2) {
      return [];
    }
    const matches = categoryOptions.filter((item) =>
      item.name.toLowerCase().includes(query),
    );
    return matches.slice(0, 6);
  }, [category, categoryOptions]);

  const hasExactCategoryMatch = useMemo(() => {
    const query = category.trim().toLowerCase();
    return categoryOptions.some((item) => item.name.trim().toLowerCase() === query);
  }, [category, categoryOptions]);

  const unitTypeOptions = useMemo(() => {
    const existingUnits = new Set<string>();
    ['kg', 'g', 'l', 'ml', 'pcs', 'box', 'pack', 'bottle', 'bag'].forEach((unit) => existingUnits.add(unit));
    return Array.from(existingUnits).map((name) => ({ id: name, name }));
  }, []);

  const filteredUnitTypeOptions = useMemo(() => {
    const query = unitType.trim().toLowerCase();
    if (query.length < 1) {
      return [];
    }

    return unitTypeOptions
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 6);
  }, [unitType, unitTypeOptions]);

  const hasExactUnitTypeMatch = useMemo(() => {
    const query = unitType.trim().toLowerCase();
    return unitTypeOptions.some((item) => item.name.trim().toLowerCase() === query);
  }, [unitType, unitTypeOptions]);

  const shouldShowNewCategoryLabel =
    categoryFocused &&
    category.trim().length >= 2 &&
    !hasExactCategoryMatch;

  const shouldShowNewUnitTypeLabel =
    unitTypeFocused &&
    unitType.trim().length >= 1 &&
    !hasExactUnitTypeMatch;

  const filteredSupplierOptions = useMemo(() => {
    const query = supplierName.trim().toLowerCase();
    if (query.length < 2) {
      return [];
    }
    const matches = supplierOptions.filter((item) =>
      item.name.toLowerCase().includes(query),
    );
    return matches.slice(0, 6);
  }, [supplierName, supplierOptions]);

  const hasExactSupplierMatch = useMemo(() => {
    const query = supplierName.trim().toLowerCase();
    return supplierOptions.some((item) => item.name.trim().toLowerCase() === query);
  }, [supplierName, supplierOptions]);

  const shouldShowNewSupplierLabel =
    supplierFocused &&
    supplierName.trim().length >= 2 &&
    !hasExactSupplierMatch;

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
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageTitle}>{t('add_inventory_item')}</Text>
          <Text style={styles.pageSubtitle}>{t('add_inventory_item_subtitle')}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('product_name')}</Text>
            <TextInput style={styles.input} placeholder={t('product_name_placeholder')} placeholderTextColor="#9CA3AF" value={productName} onChangeText={setProductName} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('category')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('select_category')}
              placeholderTextColor="#9CA3AF"
              value={category}
              onChangeText={setCategory}
              onFocus={() => setCategoryFocused(true)}
              onBlur={() => setTimeout(() => setCategoryFocused(false), 120)}
            />
            {categoryFocused && filteredCategoryOptions.length > 0 ? (
              <View style={styles.suggestionList}>
                {filteredCategoryOptions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.suggestionItem}
                    activeOpacity={0.8}
                    onPressIn={() => {
                      setCategory(item.name);
                      setCategoryFocused(false);
                    }}
                    onPress={() => {
                      setCategory(item.name);
                      setCategoryFocused(false);
                    }}
                  >
                    <Text style={styles.suggestionText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            {shouldShowNewCategoryLabel ? (
              <Text style={styles.newCategoryLabel}>{t('new_category')}</Text>
            ) : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>{t('form_stock_quantity')}</Text>
              <TextInput style={styles.input} placeholder="0" keyboardType="numeric" placeholderTextColor="#9CA3AF" value={stockQuantity} onChangeText={setStockQuantity} />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>{t('unit_type')}</Text>
              <TextInput
                style={styles.input}
                placeholder="kg"
                placeholderTextColor="#9CA3AF"
                value={unitType}
                onChangeText={setUnitType}
                onFocus={() => setUnitTypeFocused(true)}
                onBlur={() => setTimeout(() => setUnitTypeFocused(false), 120)}
              />
              {unitTypeFocused && filteredUnitTypeOptions.length > 0 ? (
                <View style={styles.suggestionList}>
                  {filteredUnitTypeOptions.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.suggestionItem}
                      activeOpacity={0.8}
                      onPressIn={() => {
                        setUnitType(item.name);
                        setUnitTypeFocused(false);
                      }}
                      onPress={() => {
                        setUnitType(item.name);
                        setUnitTypeFocused(false);
                      }}
                    >
                      <Text style={styles.suggestionText}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
              {shouldShowNewUnitTypeLabel ? (
                <Text style={styles.newCategoryLabel}>{t('new_unit_type')}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('supplier_name')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enter_supplier_name')}
              placeholderTextColor="#9CA3AF"
              value={supplierName}
              onChangeText={setSupplierName}
              onFocus={() => setSupplierFocused(true)}
              onBlur={() => setTimeout(() => setSupplierFocused(false), 120)}
            />
            {supplierFocused && filteredSupplierOptions.length > 0 ? (
              <View style={styles.suggestionList}>
                {filteredSupplierOptions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.suggestionItem}
                    activeOpacity={0.8}
                    onPressIn={() => {
                      setSupplierName(item.name);
                      setSupplierFocused(false);
                    }}
                    onPress={() => {
                      setSupplierName(item.name);
                      setSupplierFocused(false);
                    }}
                  >
                    <Text style={styles.suggestionText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            {shouldShowNewSupplierLabel ? (
              <Text style={styles.newCategoryLabel}>{t('new_supplier')}</Text>
            ) : null}
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
            <Feather name="save" size={moderateScale(18)} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{t('save_item')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {saving ? (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : null}
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
  suggestionList: {
    marginTop: verticalScale(8),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: scale(10),
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(11),
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  suggestionText: {
    fontSize: moderateScale(13),
    color: '#111827',
  },
  newCategoryLabel: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(12),
    color: '#FA8C4C',
    fontWeight: '700',
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
