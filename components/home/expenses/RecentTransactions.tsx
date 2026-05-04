import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatEuropeanDate } from '../../../utils/date';

interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  expense_date: string;
  notes: string;
  section?: string;
  source_kind?: string | null;
  source_inventory_item_id?: string | null;
  created_at: string;
}

interface RecentTransactionsProps {
  items: ExpenseItem[];
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);

const resolveTransactionType = (tx: ExpenseItem) => {
  if (tx.source_kind === 'manual_entry') {
    return 'Daily data expense';
  }
  if (tx.source_kind === 'document') {
    return 'Document expense';
  }
  if (tx.source_kind === 'inventory') {
    return 'Inventory expense';
  }
  return tx.section === 'bank' ? 'Bank expense' : 'Cash expense';
};

const resolveTransactionRoute = (tx: ExpenseItem) => {
  return `/(tabs)/home/expense-details?id=${tx.id}`;
};

export default function RecentTransactions({ items = [] }: RecentTransactionsProps) {
  const router = useRouter();

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>
        <View style={[styles.transactionCard, { justifyContent: 'center', paddingVertical: verticalScale(30) }]}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>

      {items.map((tx) => (
        <TouchableOpacity
          key={tx.id}
          style={styles.transactionCard}
          activeOpacity={0.8}
          onPress={() => router.push(resolveTransactionRoute(tx) as any)}
        >
          <View style={styles.iconContainer}>
            <Feather name="credit-card" size={moderateScale(18)} color="#FA8C4C" />
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {tx.category}
              </Text>
              <Text style={styles.amount}>-{formatAmount(tx.amount)}</Text>
            </View>
            <View style={styles.subRow}>
              <Text style={styles.subtitle} numberOfLines={1}>
                {tx.notes || tx.category} | {formatEuropeanDate(tx.expense_date)}
              </Text>
              <Text style={styles.typeText}>{resolveTransactionType(tx)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(40),
  },
  sectionTitle: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
    marginBottom: verticalScale(16),
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: moderateScale(14),
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: scale(12),
    backgroundColor: '#FFF6F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  detailsContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  title: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: scale(8),
  },
  amount: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: moderateScale(11, 0.3),
    color: '#6B7280',
    flex: 1,
    marginRight: scale(8),
  },
  typeText: {
    fontSize: moderateScale(10, 0.3),
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
