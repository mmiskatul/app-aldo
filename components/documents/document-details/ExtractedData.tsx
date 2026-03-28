import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface ExtractedItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: string;
  totalPrice: string;
}

interface ExtractedDataProps {
  items: ExtractedItem[];
  isEditing?: boolean;
  onItemChange?: (index: number, key: string, value: string) => void;
}

export default function ExtractedData({ items, isEditing, onItemChange }: ExtractedDataProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Extracted Data</Text>
      
      <View style={styles.card}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <View key={item.id || index} style={[styles.itemRow, !isLast && styles.itemBorder]}>
              <View style={styles.itemDetails}>
                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.inputName}
                      value={item.name}
                      onChangeText={(text) => onItemChange?.(index, 'product_name', text)}
                      placeholder="Product Name"
                    />
                    <View style={styles.editMetaRow}>
                      <Text style={styles.itemMeta}>Qty: </Text>
                      <TextInput
                        style={styles.inputSmall}
                        value={String(item.qty)}
                        keyboardType="numeric"
                        onChangeText={(text) => onItemChange?.(index, 'quantity', text)}
                      />
                      <Text style={styles.itemMeta}> × </Text>
                      <TextInput
                        style={styles.inputSmall}
                        value={item.unitPrice.replace('€', '').trim()}
                        keyboardType="numeric"
                        onChangeText={(text) => onItemChange?.(index, 'unit_price', text)}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>Qty: {item.qty} × {item.unitPrice}</Text>
                  </>
                )}
              </View>
              <Text style={styles.itemTotal}>{item.totalPrice}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: scale(16),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(20),
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemDetails: {
    flex: 1,
    paddingRight: scale(16),
  },
  itemName: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '500',
    color: '#374151',
    marginBottom: verticalScale(4),
  },
  itemMeta: {
    fontSize: moderateScale(11, 0.3),
    color: '#9CA3AF',
  },
  itemTotal: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  inputName: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '500',
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: verticalScale(4),
    paddingVertical: verticalScale(2),
  },
  inputSmall: {
    fontSize: moderateScale(11, 0.3),
    color: '#4B5563',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minWidth: scale(30),
    textAlign: 'center',
    paddingVertical: verticalScale(2),
  },
  editMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
