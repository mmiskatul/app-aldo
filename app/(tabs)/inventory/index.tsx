import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import apiClient from '../../../api/apiClient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
  total_inventory_value: number;
  items: InventoryApiItem[];
}

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

export default function InventoryScreen() {
  const { t } = useTranslation();
  const inventoryRefreshToken = useAppStore((state) => state.inventoryRefreshToken);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [items, setItems] = useState<InventoryCardItem[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInventory = useCallback(async (query: string, withRefresh = false) => {
    if (withRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await apiClient.get<InventoryListResponse>('/api/v1/restaurant/inventory', {
        params: {
          page: 1,
          page_size: 50,
          search: query || undefined,
        },
      });

      setTotalValue(response.data.total_inventory_value ?? 0);
      setItems(
        response.data.items.map((item) => ({
          id: item.id,
          name: item.product_name,
          supplier: item.supplier_name || 'Unknown supplier',
          status: item.stock_status,
          statusColor: statusColorFor(item.stock_status),
          quantity: item.stock_quantity,
          unit: item.unit_type,
          lastPurchase: formatShortDate(item.purchase_date),
          icon: iconForCategory(item.category),
        })),
      );
    } catch (error: any) {
      console.log('Inventory list error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchInventory(search);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [fetchInventory, inventoryRefreshToken, search]);

  useFocusEffect(
    useCallback(() => {
      void fetchInventory(search);
    }, [fetchInventory, search])
  );

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

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: verticalScale(120) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void fetchInventory(search, true)}
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
          <Text style={styles.valueAmount}>
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.valueBadge}>
            <Feather name="package" size={moderateScale(12)} color="#16A34A" />
            <Text style={styles.valueBadgeText}> {filtered.length}</Text>
            <Text style={styles.valueBadgeSub}> items</Text>
          </View>
        </View>

        <View style={styles.listWrap}>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color="#FA8C4C" />
            </View>
          ) : filtered.length > 0 ? (
            filtered.map((item) => <InventoryCard key={item.id} item={item} />)
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
  valueBadge: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(6) },
  valueBadgeText: { fontSize: moderateScale(12), color: '#16A34A', fontWeight: '600' },
  valueBadgeSub: { fontSize: moderateScale(12), color: '#6B7280' },
  listWrap: { paddingHorizontal: scale(20) },
  loadingState: {
    paddingVertical: verticalScale(32),
    alignItems: 'center',
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
