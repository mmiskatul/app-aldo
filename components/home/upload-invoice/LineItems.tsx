import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface LineItemsProps {
  isEditing?: boolean;
  items: any[];
  onItemsChange: (items: any[]) => void;
  subtotal?: number;
  vat?: number;
  total?: number;
}

export default function LineItems({ isEditing = false, items, onItemsChange, subtotal: propsSubtotal, vat: propsVat, total: propsTotal }: LineItemsProps) {

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    // Auto-calculate total if qty or price changed
    if (field === 'qty' || field === 'price') {
      const q = parseFloat(item.qty) || 0;
      const p = parseFloat(item.price) || 0;
      item.total = (q * p).toFixed(2);
    }

    newItems[index] = item;
    onItemsChange(newItems);
  };

  return (
    <View style={styles.tableCard}>
      <View style={styles.tableHead}>
        <Text style={[styles.tableHeadText, { flex: 3 }]}>PRODUCT</Text>
        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>QTY</Text>
        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>PRICE</Text>
        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>TOTAL</Text>
      </View>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <View key={`item-${item.id}-${index}`} style={[styles.tableRow, isLast && styles.lastRow]}>
              {isEditing ? (
                <>
                  <TextInput style={[styles.inputCell, { flex: 3 }]} value={item.product} onChangeText={(t) => updateItem(index, 'product', t)} />
                  <TextInput style={[styles.inputCell, { flex: 1, textAlign: 'center' }]} value={item.qty} onChangeText={(t) => updateItem(index, 'qty', t)} keyboardType="numeric" />
                  <TextInput style={[styles.inputCell, { flex: 1, textAlign: 'right' }]} value={item.price} onChangeText={(t) => updateItem(index, 'price', t)} keyboardType="numeric" />
                  <TextInput style={[styles.inputCellBold, { flex: 1, textAlign: 'right' }]} value={item.total} onChangeText={(t) => updateItem(index, 'total', t)} keyboardType="numeric" />
                </>
              ) : (
                <>
                  <Text style={[styles.tableCellMain, { flex: 3 }]}>{item.product}</Text>
                  <Text style={[styles.tableCellSub, { flex: 1, textAlign: 'center' }]}>{item.qty}</Text>
                  <Text style={[styles.tableCellSub, { flex: 1, textAlign: 'right' }]}>€{item.price}</Text>
                  <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'right' }]}>€{item.total}</Text>
                </>
              )}
            </View>
          );
        })}

      {/* Totals */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValueMain}>€{propsSubtotal?.toFixed(2) || '0.00'}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>VAT (10%)</Text>
        <Text style={styles.summaryValueMain}>€{propsVat?.toFixed(2) || '0.00'}</Text>
      </View>
      <View style={[styles.summaryRow, { marginTop: verticalScale(8) }]}>
        <Text style={styles.grandTotalLabel}>Total</Text>
        <Text style={styles.grandTotalValue}>€{propsTotal?.toFixed(2) || '0.00'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(24),
  },
  tableHead: {
    flexDirection: 'row',
    marginBottom: verticalScale(16),
  },
  tableHeadText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  tableCellMain: {
    fontSize: moderateScale(13, 0.3),
    color: '#374151',
  },
  tableCellSub: {
    fontSize: moderateScale(13, 0.3),
    color: '#9CA3AF',
  },
  tableCellBold: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  lastRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: verticalScale(16),
  },
  inputCell: {
    fontSize: moderateScale(13, 0.3),
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: verticalScale(2),
    marginHorizontal: scale(2),
  },
  inputCellBold: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '700',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: verticalScale(2),
    marginHorizontal: scale(2),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
    marginTop: verticalScale(6),
  },
  summaryLabel: {
    fontSize: moderateScale(13, 0.3),
    color: '#4B5563',
  },
  summaryValueMain: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '600',
    color: '#111827',
  },
  grandTotalLabel: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  grandTotalValue: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '800',
    color: '#FA8C4C',
  },
});
