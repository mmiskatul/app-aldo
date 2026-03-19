import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Header from "../../../components/ui/Header";

import { FilterChips } from '../../../components/inventory/Inventory/FilterChips';
import { InventoryCard } from '../../../components/inventory/Inventory/InventoryCard';

// ─── Enable LayoutAnimation on Android ───────────────────────────────────────
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Sample data ────────────────────────────────────────────────────────────
export const INVENTORY_ITEMS = [
  {
    id: '1',
    name: 'Tomato Sauce',
    supplier: 'Italian Tomato Co',
    status: 'IN STOCK',
    statusColor: '#16A34A',
    quantity: 20,
    unit: 'bottles',
    lastPurchase: '8 Mar',
    icon: '🧴',
    category: 'Sauce Category',
    currentStock: 12,
    pricePerUnit: 4.5,
    supplierFull: 'Global Foods Inc.',
    supplierRole: 'Primary Distributor',
    lastPurchaseFull: 'Oct 12, 2023',
    history: [
      { type: 'add', label: 'Stock Added', date: 'Feb 12, 2026', amount: '+24' },
      { type: 'remove', label: 'Stock Removed', date: 'Feb 12, 2026', amount: '-5' },
      { type: 'purchase', label: 'Purchase Record', date: 'Feb 05, 2026', amount: '$108.00' },
    ],
  },
  {
    id: '2',
    name: 'Whole Wheat Flour',
    supplier: 'Millstone Grains',
    status: 'LOW STOCK',
    statusColor: '#EA580C',
    quantity: 5,
    unit: 'bags',
    lastPurchase: '2 Mar',
    icon: '🌾',
    category: 'Grain Category',
    currentStock: 5,
    pricePerUnit: 12.0,
    supplierFull: 'Millstone Grains Ltd.',
    supplierRole: 'Primary Distributor',
    lastPurchaseFull: 'Mar 2, 2026',
    history: [
      { type: 'add', label: 'Stock Added', date: 'Mar 2, 2026', amount: '+10' },
      { type: 'purchase', label: 'Purchase Record', date: 'Feb 28, 2026', amount: '$120.00' },
    ],
  },
  {
    id: '3',
    name: 'Organic Eggs',
    supplier: 'Green Pastures Farm',
    status: 'OUT OF STOCK',
    statusColor: '#DC2626',
    quantity: 0,
    unit: 'crates',
    lastPurchase: '15 Feb',
    icon: '🥚',
    category: 'Produce Category',
    currentStock: 0,
    pricePerUnit: 8.0,
    supplierFull: 'Green Pastures Farm',
    supplierRole: 'Primary Distributor',
    lastPurchaseFull: 'Feb 15, 2026',
    history: [
      { type: 'remove', label: 'Stock Removed', date: 'Feb 15, 2026', amount: '-6' },
      { type: 'purchase', label: 'Purchase Record', date: 'Feb 01, 2026', amount: '$48.00' },
    ],
  },
  {
    id: '4',
    name: 'Extra Virgin Olive Oil',
    supplier: 'Tuscany Imports',
    status: 'IN STOCK',
    statusColor: '#16A34A',
    quantity: 12,
    unit: 'liters',
    lastPurchase: '5 Mar',
    icon: '🫒',
    category: 'Oil Category',
    currentStock: 12,
    pricePerUnit: 9.5,
    supplierFull: 'Tuscany Imports S.r.l.',
    supplierRole: 'Primary Distributor',
    lastPurchaseFull: 'Mar 5, 2026',
    history: [
      { type: 'add', label: 'Stock Added', date: 'Mar 5, 2026', amount: '+6' },
      { type: 'purchase', label: 'Purchase Record', date: 'Mar 4, 2026', amount: '$57.00' },
    ],
  },
];

const TOTAL_VALUE = 12450;

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function InventoryScreen() {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(!showFilters);
  };

  const filtered = INVENTORY_ITEMS.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.safe}>
      <Header title="Inventory" showBell={true} />

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={moderateScale(16)} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]} 
          onPress={toggleFilters}
        >
          <Feather name="sliders" size={moderateScale(16)} color={showFilters ? "#FA8C4C" : "#6B7280"} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      {showFilters && <FilterChips />}

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: verticalScale(120) }}
      >
        {/* Title */}
        <View style={{ paddingHorizontal: scale(20), marginBottom: verticalScale(12) }}>
          <Text style={styles.pageTitle}>Inventory</Text>
          <Text style={styles.pageSubtitle}>
            Track and manage your restaurant ingredients and stock.
          </Text>
        </View>

        {/* Total value card */}
        <View style={styles.valueCard}>
          <Text style={styles.valueLabelSmall}>TOTAL INVENTORY VALUE</Text>
          <Text style={styles.valueAmount}>${TOTAL_VALUE.toLocaleString()}.00</Text>
          <View style={styles.valueBadge}>
            <Feather name="trending-up" size={moderateScale(12)} color="#16A34A" />
            <Text style={styles.valueBadgeText}> +4.2%</Text>
            <Text style={styles.valueBadgeSub}>  from month</Text>
          </View>
        </View>

        {/* Items */}
        <View style={{ paddingHorizontal: scale(20) }}>
          {filtered.map((item) => (
            <InventoryCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/inventory/add-item')}
      >
        <Feather name="plus" size={moderateScale(24)} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
  },
  headerTitle: {
    fontSize: moderateScale(17),
    fontWeight: '700',
    color: '#111827',
  },

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

