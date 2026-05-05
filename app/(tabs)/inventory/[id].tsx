import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import apiClient from '../../../api/apiClient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Header from '../../../components/ui/Header';
import { useAppStore } from '../../../store/useAppStore';
import { getApiDisplayMessage, showApiError } from '../../../utils/apiErrors';
import { showErrorMessage, showInfoMessage, showSuccessMessage } from '../../../utils/feedback';
import { getLocale, useTranslation } from '../../../utils/i18n';

import { HistoryList } from '../../../components/inventory/view-stock/HistoryList';
import { StockUpdate } from '../../../components/inventory/view-stock/StockUpdate';
import { SupplierCard } from '../../../components/inventory/view-stock/SupplierCard';

interface InventoryDetailResponse {
  id: string;
  product_name: string;
  category: string;
  stock_quantity: number;
  unit_type: string;
  supplier_name?: string | null;
  unit_price: number;
  alert_threshold: number;
  stock_status: string;
  purchase_date?: string | null;
  current_stock_value: number;
  history: {
    kind: string;
    quantity_delta: number;
    occurred_at: string;
  }[];
}

type HistoryEntryType = 'add' | 'remove' | 'purchase';

const hasCompleteDetailCache = (value: unknown): value is InventoryDetailResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<InventoryDetailResponse>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.product_name === 'string' &&
    typeof candidate.category === 'string' &&
    typeof candidate.unit_type === 'string' &&
    typeof candidate.current_stock_value === 'number' &&
    Array.isArray(candidate.history)
  );
};

const formatLongDate = (value: string | null | undefined, locale: string, fallback: string) => {
  if (!value) {
    return fallback;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function ItemDetailScreen() {
  const { t } = useTranslation();
  const locale = getLocale();
  const bumpInventoryRefreshToken = useAppStore((state) => state.bumpInventoryRefreshToken);
  const clearHomeScreenCache = useAppStore((state) => state.clearHomeScreenCache);
  const inventoryDetailCache = useAppStore((state) => state.inventoryDetailCache);
  const setInventoryDetailCacheItem = useAppStore((state) => state.setInventoryDetailCacheItem);
  const removeInventoryDetailCacheItem = useAppStore((state) => state.removeInventoryDetailCacheItem);
  const { id } = useLocalSearchParams();
  const itemId = Array.isArray(id) ? id[0] : id;
  const cachedItem = itemId ? inventoryDetailCache[itemId] : null;
  const initialItem = hasCompleteDetailCache(cachedItem) ? cachedItem : null;
  const [item, setItem] = useState<InventoryDetailResponse | null>(initialItem);
  const [loading, setLoading] = useState(!initialItem);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    if (!itemId) {
      return;
    }
    if (!hasCompleteDetailCache(cachedItem)) {
      setLoading(true);
    }
    try {
      setErrorMessage(null);
      const response = await apiClient.get<InventoryDetailResponse>(`/api/v1/restaurant/inventory/${itemId}`);
      setItem(response.data);
      setInventoryDetailCacheItem(itemId, response.data);
    } catch (error: any) {
      setErrorMessage(getApiDisplayMessage(error, t('unable_to_load_item')));
      showErrorMessage(getApiDisplayMessage(error, t('unable_to_load_item')), t('load_failed'));
    } finally {
      setLoading(false);
    }
  }, [cachedItem, itemId, setInventoryDetailCacheItem, t]);

  useEffect(() => {
    void fetchItem();
  }, [fetchItem]);

  const viewModel = useMemo(() => {
    if (!item) {
      return null;
    }

    return {
      name: item.product_name,
      category: item.category.toUpperCase(),
      currentStock: item.current_stock_value,
      unit: item.unit_type,
      supplier: {
        supplierName: item.supplier_name || t('unknown_supplier'),
        supplierRole: t('primary_distributor'),
        lastPurchase: formatLongDate(item.purchase_date, locale, t('not_available')),
        pricePerUnitLabel: `€${item.unit_price.toFixed(2)} / ${item.unit_type}`,
      },
      history: (Array.isArray(item.history) ? item.history : []).map((entry) => ({
        type: (entry.kind === 'stock_added' ? 'add' : entry.kind === 'stock_removed' ? 'remove' : 'purchase') as HistoryEntryType,
        label: entry.kind === 'stock_added' ? t('stock_added') : entry.kind === 'stock_removed' ? t('stock_removed') : t('purchase_record'),
        date: formatLongDate(entry.occurred_at, locale, t('not_available')),
        amount: `${entry.quantity_delta > 0 ? '+' : ''}${entry.quantity_delta}`,
      })),
    };
  }, [item, locale, t]);

  const handleDelete = async () => {
    if (!itemId) {
      return;
    }
    setDeleting(true);
    try {
      showInfoMessage(t('delete_item_in_progress'));
      await apiClient.delete(`/api/v1/restaurant/inventory/${itemId}`);
      showSuccessMessage(t('inventory_item_deleted'));
      bumpInventoryRefreshToken();
      clearHomeScreenCache();
      removeInventoryDetailCacheItem(itemId);
      router.replace({
        pathname: '/(tabs)/inventory',
        params: {
          notice: 'item-deleted',
          noticeKey: String(Date.now()),
        },
      });
    } catch (error: any) {
      const status = Number(error?.response?.status || 0);
      if (status === 404 || status === 405) {
        console.error('[inventory.delete]', error?.response?.data || error?.message || error);
        showErrorMessage(
          'Inventory delete is not available on the current API deployment. Please deploy the latest backend and try again.',
          t('delete_failed'),
        );
      } else {
        showApiError('inventory.delete', error, t('unable_to_delete_item'), t('delete_failed'));
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleRequestDelete = () => {
    setDeleteConfirmVisible(true);
  };

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }
    setDeleteConfirmVisible(false);
  };

  if (loading || !itemId) {
    return (
      <View style={styles.safe}>
        <Header title={t('inventory_title')} showBack={true} />
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color="#FA8C4C" />
        </View>
      </View>
    );
  }

  if (!viewModel) {
    return (
      <View style={styles.safe}>
        <Header title={t('inventory_title')} showBack={true} />
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle}>{errorMessage || t('unable_to_load_item')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void fetchItem()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <Header
        title={viewModel.name}
        subtitle={viewModel.category}
        showBack={true}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.stockBanner}>
          <View>
            <Text style={styles.bannerLabel}>{t('current_stock')}</Text>
            <View style={styles.bannerValContainer}>
              <Text style={styles.bannerVal}>{viewModel.currentStock}</Text>
              <Text style={styles.bannerUnit}>{viewModel.unit}</Text>
            </View>
          </View>
          <View style={styles.bannerIcon}>
            <Feather name="package" size={moderateScale(24)} color="#FFFFFF" />
          </View>
        </View>

        <StockUpdate
          itemId={itemId}
          onUpdated={(payload) => {
            bumpInventoryRefreshToken();
            clearHomeScreenCache();
            setInventoryDetailCacheItem(itemId, payload);
            setItem(payload);
          }}
        />
        <SupplierCard item={viewModel.supplier} />
        <HistoryList item={{ history: viewModel.history }} />

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push(`/(tabs)/inventory/edit/${itemId}`)}
          >
            <Feather name="edit" size={moderateScale(16)} color="#6B7280" />
            <Text style={styles.secondaryBtnText}>{t('edit_item')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: '#FEE2E2' }]}
            onPress={handleRequestDelete}
            disabled={deleting}
          >
            <Feather name="trash-2" size={moderateScale(16)} color="#DC2626" />
            <Text style={[styles.secondaryBtnText, { color: '#DC2626' }]}>
              {t('delete')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.modalBackdrop}>
          {deleting ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <View style={styles.confirmModal}>
              <View style={styles.confirmIconWrap}>
                <Feather name="trash-2" size={moderateScale(22)} color="#DC2626" />
              </View>
              <Text style={styles.confirmTitle}>Delete inventory item?</Text>
              <Text style={styles.confirmMessage}>
                This item will be permanently deleted from your inventory.
              </Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity
                  style={[styles.confirmActionButton, styles.cancelButton]}
                  onPress={handleCancelDelete}
                  activeOpacity={0.85}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmActionButton, styles.deleteButton]}
                  onPress={() => void handleDelete()}
                  activeOpacity={0.85}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
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
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(24),
  },
  errorTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#991B1B',
  },
  errorSubtitle: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(13, 0.3),
    color: '#7F1D1D',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: verticalScale(16),
    backgroundColor: '#FA8C4C',
    borderRadius: scale(12),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(13, 0.3),
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  confirmModal: {
    width: '100%',
    maxWidth: scale(340),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(18),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(22),
    paddingBottom: verticalScale(18),
    alignItems: 'center',
  },
  confirmIconWrap: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  confirmTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: moderateScale(13, 0.3),
    lineHeight: moderateScale(19),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  confirmActions: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(10),
  },
  confirmActionButton: {
    flex: 1,
    minHeight: verticalScale(46),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#374151',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  deleteButtonText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
