import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTranslation } from '../../../utils/i18n';

interface ExtractedItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: string;
  totalPrice: string;
  vatRate?: number;
  vatAmount?: number;
}

interface ExtractedDataProps {
  items: ExtractedItem[];
  isEditing?: boolean;
  onItemChange?: (index: number, key: string, value: string) => void;
}

const RECOMMENDED_VAT_RATES = [4, 5, 10, 22];

export default function ExtractedData({ items, isEditing, onItemChange }: ExtractedDataProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('extracted_data')}</Text>

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
                      placeholder={t('product_name')}
                    />
                    <View style={styles.editMetaRow}>
                      <Text style={styles.itemMeta}>{t('qty')}: </Text>
                      <TextInput
                        style={styles.inputSmall}
                        value={String(item.qty)}
                        keyboardType="numeric"
                        onChangeText={(text) => onItemChange?.(index, 'quantity', text)}
                      />
                      <Text style={styles.itemMeta}> x </Text>
                      <TextInput
                        style={styles.inputSmall}
                        value={item.unitPrice.replace('EUR', '').replace('€', '').trim()}
                        keyboardType="numeric"
                        onChangeText={(text) => onItemChange?.(index, 'unit_price', text)}
                      />
                    </View>
                    <View style={styles.vatRateGroup}>
                      {RECOMMENDED_VAT_RATES.map((rate) => {
                        const active = Number(item.vatRate || 10) === rate;
                        return (
                          <TouchableOpacity
                            key={rate}
                            style={[styles.vatRateButton, active && styles.vatRateButtonActive]}
                            onPress={() => onItemChange?.(index, 'vat_rate', String(rate))}
                          >
                            <Text style={[styles.vatRateText, active && styles.vatRateTextActive]}>{rate}% IVA</Text>
                          </TouchableOpacity>
                        );
                      })}
                      <TextInput
                        style={styles.vatCustomInput}
                        value={String(item.vatRate || '')}
                        keyboardType="numeric"
                        onChangeText={(text) => onItemChange?.(index, 'vat_rate', text)}
                        placeholder="%"
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>{t('qty')}: {item.qty} x {item.unitPrice}</Text>
                    <Text style={styles.itemMeta}>IVA {item.vatRate || 10}%: EUR {Number(item.vatAmount || 0).toFixed(2)}</Text>
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
  vatRateGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(6),
    marginTop: verticalScale(8),
  },
  vatRateButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(7),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
  },
  vatRateButtonActive: {
    borderColor: '#FA8C4C',
    backgroundColor: '#FFF2EA',
  },
  vatRateText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '700',
    color: '#6B7280',
  },
  vatRateTextActive: {
    color: '#FA8C4C',
  },
  vatCustomInput: {
    minWidth: scale(44),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(7),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    fontSize: moderateScale(10, 0.3),
    color: '#374151',
    textAlign: 'center',
  },
});
