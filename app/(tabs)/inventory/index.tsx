import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import apiClient from '../../../api/apiClient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Header from '../../../components/ui/Header';
import { useAppStore } from '../../../store/useAppStore';
import { useCachedFocusRefresh } from '../../../hooks/useCachedFocusRefresh';
import { getApiDisplayMessage, logApiError } from '../../../utils/apiErrors';
import { isCacheFresh } from '../../../utils/cache';
import { useTranslation } from '../../../utils/i18n';

import { FilterChips } from '../../../components/inventory/Inventory/FilterChips';
import { InventoryCard, InventoryCardItem } from '../../../components/inventory/Inventory/InventoryCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface InventoryApiItem {
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
}

interface InventoryListResponse {
  total_inventory_value?: number | string | null;
  items: InventoryApiItem[];
}

const INVENTORY_CACHE_TTL_MS = 60 * 1000;

const toSafeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const calculateInventoryValue = (items: InventoryApiItem[]) =>
  items.reduce((total, item) => total + (toSafeNumber(item.stock_quantity) * toSafeNumber(item.unit_price)), 0);

const calculateInventoryValueFromCache = (items: InventoryCardItem[]) =>
  items.reduce((total, item) => total + (toSafeNumber(item.quantity) * toSafeNumber(item.unitPrice)), 0);

const resolveInventoryTotalValue = (payload: InventoryListResponse) => {
  const backendTotal = toSafeNumber(payload.total_inventory_value);
  return backendTotal > 0 ? backendTotal : calculateInventoryValue(payload.items);
};

const iconForCategory = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('sauce')) return '🧴';
  if (normalized.includes('grain') || normalized.includes('flour')) return '🌾';
  if (normalized.includes('egg') || normalized.includes('dairy')) return '🥚';
  if (normalized.includes('oil')) return '🫒';
  if (normalized.includes('meat')) return '🥩';
  if (normalized.includes('vegetable') || normalized.includes('produce')) return '🥬';
  return '📦';
};

const statusColorFor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'in_stock':
      return '#16A34A';
    case 'low_stock':
      return '#EA580C';
    case 'out_of_stock':
      return '#DC2626';
    default:
      return '#6B7280';
  }
};

const formatShortDate = (value?: string | null) => {
  if (!value) {
    return 'N/A';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

function InventoryCardSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonMeta}>
          <View style={styles.skeletonLineWide} />
          <View style={styles.skeletonLineMedium} />
        </View>
        <View style={styles.skeletonBadge} />
      </View>

      <View style={styles.skeletonFooter}>
        <View style={styles.skeletonInfoWrap}>
          <View>
            <View style={styles.skeletonLabel} />
            <View style={styles.skeletonValue} />
          </View>
          <View>
            <View style={styles.skeletonLabel} />
            <View style={styles.skeletonValue} />
          </View>
        </View>

        <View style={styles.skeletonActionButton} />
      </View>
    </View>
  );
}

export default function InventoryScreen() {
  const { t } = useTranslation();
  const { notice, noticeKey } = useLocalSearchParams<{ notice?: string; noticeKey?: string }>();
  const inventoryRefreshToken = useAppStore((state) => state.inventoryRefreshToken);
  const inventoryListCache = useAppStore((state) => state.inventoryListCache);
  const inventoryListFetchedAt = useAppStore((state) => state.inventoryListFetchedAt);
  const setInventoryListCache = useAppStore((state) => state.setInventoryListCache);
  const setInventoryDetailCacheItem = useAppStore((state) => state.setInventoryDetailCacheItem);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [items, setItems] = useState<InventoryCardItem[]>(inventoryListCache);
  const [totalValue, setTotalValue] = useState(calculateInventoryValueFromCache(inventoryListCache));
  const hasCachedInventory = inventoryListCache.length > 0;
  const [valueLoading, setValueLoading] = useState(!hasCachedInventory);
  const [loading, setLoading] = useState(!hasCachedInventory);
  const [refreshing, setRefreshing] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const lastHandledRefreshTokenRef = useRef(inventoryRefreshToken);

  const fetchInventory = useCallback(async (query: string, options?: { withRefresh?: boolean; silent?: boolean }) => {
    const withRefresh = options?.withRefresh ?? false;
    const silent = options?.silent ?? false;

    if (withRefresh) {
      setRefreshing(true);
    } else if (!silent) {
      setLoading(true);
      setValueLoading(true);
    }

    try {
      if (!silent) {
        setErrorMessage('');
      }
      const response = await apiClient.get<InventoryListResponse>('/api/v1/restaurant/inventory', {
        params: {
          page: 1,
          page_size: 50,
          search: query || undefined,
        },
      });

      const nextItems = response.data.items.map((item) => ({
        id: item.id,
        name: item.product_name,
        supplier: item.supplier_name || 'Unknown supplier',
        status: item.stock_status,
        statusColor: statusColorFor(item.stock_status),
        quantity: item.stock_quantity,
        unit: item.unit_type,
        unitPrice: item.unit_price,
        lastPurchase: formatShortDate(item.purchase_date),
        icon: iconForCategory(item.category),
      }));

      setItems(nextItems);
      setTotalValue(resolveInventoryTotalValue(response.data));
      setValueLoading(false);
      if (query.trim().length === 0) {
        setInventoryListCache(nextItems);
      }

      for (const item of response.data.items) {
        setInventoryDetailCacheItem(item.id, {
          id: item.id,
          product_name: item.product_name,
          category: item.category,
          stock_quantity: item.stock_quantity,
          unit_type: item.unit_type,
          supplier_name: item.supplier_name,
          unit_price: item.unit_price,
          alert_threshold: item.alert_threshold,
          stock_status: item.stock_status,
          purchase_date: item.purchase_date,
        });
      }

    } catch (error: any) {
      logApiError('inventory.list', error);
      if (!silent || !hasCachedInventory || query.trim().length > 0) {
        setErrorMessage(getApiDisplayMessage(error, 'Unable to load inventory items.'));
      }
    } finally {
      setLoading(false);
      setValueLoading(false);
      setRefreshing(false);
    }
  }, [hasCachedInventory, setInventoryDetailCacheItem, setInventoryListCache]);

  const isDefaultQuery = search.trim().length === 0;

  useCachedFocusRefresh({
    enabled: isDefaultQuery,
    hasCache: hasCachedInventory,
    fetchedAt: inventoryListFetchedAt,
    ttlMs: INVENTORY_CACHE_TTL_MS,
    loadOnEmpty: () => {
      lastHandledRefreshTokenRef.current = inventoryRefreshToken;
      void fetchInventory('', { silent: false });
    },
    refreshStale: () => {
      const refreshTokenChanged = inventoryRefreshToken !== lastHandledRefreshTokenRef.current;
      lastHandledRefreshTokenRef.current = inventoryRefreshToken;

      if (refreshTokenChanged || !isCacheFresh(inventoryListFetchedAt, INVENTORY_CACHE_TTL_MS)) {
        void fetchInventory('', { silent: true });
      }
    },
  });

  useEffect(() => {
    const query = search.trim();
    if (query.length === 0) {
      setItems(inventoryListCache);
      setTotalValue(calculateInventoryValueFromCache(inventoryListCache));
      setLoading(false);
      setValueLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      void fetchInventory(query, { silent: false });
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [fetchInventory, inventoryListCache, search]);

  useEffect(() => {
    if (!notice || !noticeKey) {
      return;
    }

    const messageByNotice: Record<string, string> = {
      'item-added': 'Item added successfully.',
      'item-updated': 'Item updated successfully.',
      'item-deleted': 'Item deleted successfully.',
    };
    const nextMessage = messageByNotice[notice];
    if (!nextMessage) {
      return;
    }

    setBannerMessage(nextMessage);
    const timeoutId = setTimeout(() => setBannerMessage(''), 3000);
    return () => clearTimeout(timeoutId);
  }, [notice, noticeKey]);

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(!showFilters);
  };

  const filtered = useMemo(() => items, [items]);

  return (
    <View style={styles.safe}>
      <Header title={t('inventory_title')} showBell={true} />

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={moderateScale(16)} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_products')}
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={toggleFilters}
        >
          <Feather name="sliders" size={moderateScale(16)} color={showFilters ? '#FA8C4C' : '#6B7280'} />
        </TouchableOpacity>
      </View>

      {showFilters ? <FilterChips /> : null}

      {bannerMessage ? (
        <View style={styles.banner}>
          <Feather name="check-circle" size={moderateScale(16)} color="#166534" />
          <Text style={styles.bannerText}>{bannerMessage}</Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Feather name="alert-circle" size={moderateScale(16)} color="#991B1B" />
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: verticalScale(120) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void fetchInventory(search.trim(), { withRefresh: true })}
            colors={['#FA8C4C']}
          />
        }
      >
        <View style={styles.titleWrap}>
          <Text style={styles.pageTitle}>{t('inventory_title')}</Text>
          <Text style={styles.pageSubtitle}>{t('inventory_subtitle')}</Text>
        </View>

        <View style={styles.valueCard}>
          <Text style={styles.valueLabelSmall}>{t('total_inventory_value')}</Text>
          {valueLoading ? (
            <View style={styles.valueAmountSkeleton} />
          ) : (
            <Text style={styles.valueAmount}>
              ${toSafeNumber(totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          )}
          <View style={styles.valueBadge}>
            <Feather name="package" size={moderateScale(12)} color="#16A34A" />
            <Text style={styles.valueBadgeText}> {filtered.length}</Text>
            <Text style={styles.valueBadgeSub}> items</Text>
          </View>
        </View>

        <View style={styles.listWrap}>
          {loading ? (
            <>
              <InventoryCardSkeleton />
              <InventoryCardSkeleton />
              <InventoryCardSkeleton />
            </>
          ) : filtered.length > 0 ? (
            filtered.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onView={(itemId) => router.push(`/(tabs)/inventory/${itemId}`)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No inventory items found</Text>
              <Text style={styles.emptySubtitle}>Create an item or change the search term.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/inventory/add-item')}
      >
        <Feather name="plus" size={moderateScale(24)} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(16),
    gap: scale(10),
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    gap: scale(8),
  },
  searchInput: { flex: 1, fontSize: moderateScale(13), color: '#111827' },
  filterBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: scale(10),
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#FFF4EE',
    borderColor: '#FA8C4C',
  },
  banner: {
    marginHorizontal: scale(20),
    marginBottom: verticalScale(12),
    borderRadius: scale(12),
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  bannerText: {
    flex: 1,
    color: '#166534',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  errorBanner: {
    marginHorizontal: scale(20),
    marginBottom: verticalScale(12),
    borderRadius: scale(12),
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  errorBannerText: {
    flex: 1,
    color: '#991B1B',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  scroll: { flex: 1 },
  titleWrap: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(12),
  },
  pageTitle: { fontSize: moderateScale(20), fontWeight: '700', color: '#111827' },
  pageSubtitle: { fontSize: moderateScale(12), color: '#6B7280', marginTop: verticalScale(2) },
  valueCard: {
    marginHorizontal: scale(20),
    marginBottom: verticalScale(16),
    backgroundColor: '#FFF4EE',
    borderRadius: scale(14),
    padding: scale(18),
  },
  valueLabelSmall: { fontSize: moderateScale(10), color: '#9CA3AF', fontWeight: '600', letterSpacing: 0.5 },
  valueAmount: { fontSize: moderateScale(28), fontWeight: '800', color: '#111827', marginTop: verticalScale(4) },
  valueAmountSkeleton: {
    marginTop: verticalScale(8),
    width: '58%',
    height: verticalScale(34),
    borderRadius: scale(8),
    backgroundColor: '#F3E2D7',
  },
  valueBadge: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(6) },
  valueBadgeText: { fontSize: moderateScale(12), color: '#16A34A', fontWeight: '600' },
  valueBadgeSub: { fontSize: moderateScale(12), color: '#6B7280' },
  listWrap: { paddingHorizontal: scale(20) },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: scale(14),
    marginBottom: verticalScale(10),
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  skeletonIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: scale(10),
    backgroundColor: '#F3F4F6',
    marginRight: scale(10),
  },
  skeletonMeta: {
    flex: 1,
    gap: verticalScale(8),
  },
  skeletonLineWide: {
    width: '62%',
    height: verticalScale(12),
    borderRadius: scale(6),
    backgroundColor: '#F3F4F6',
  },
  skeletonLineMedium: {
    width: '44%',
    height: verticalScale(10),
    borderRadius: scale(6),
    backgroundColor: '#F9FAFB',
  },
  skeletonBadge: {
    width: moderateScale(54),
    height: verticalScale(14),
    borderRadius: scale(7),
    backgroundColor: '#F3F4F6',
  },
  skeletonFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skeletonInfoWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: scale(10),
  },
  skeletonLabel: {
    width: moderateScale(52),
    height: verticalScale(8),
    borderRadius: scale(4),
    backgroundColor: '#F3F4F6',
    marginBottom: verticalScale(6),
  },
  skeletonValue: {
    width: moderateScale(68),
    height: verticalScale(12),
    borderRadius: scale(6),
    backgroundColor: '#F9FAFB',
  },
  skeletonActionButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: '#F3F4F6',
  },
  emptyState: {
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: scale(12),
    padding: scale(18),
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#111827',
  },
  emptySubtitle: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(12),
    color: '#6B7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: scale(24),
    bottom: verticalScale(100),
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    backgroundColor: '#FA8C4C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#FA8C4C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
