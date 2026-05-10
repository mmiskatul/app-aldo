import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTranslation } from '../../../utils/i18n';

interface LineItemsProps {
  isEditing?: boolean;
  items: any[];
  onItemsChange: (items: any[]) => void;
  subtotal?: number;
  vat?: number;
  total?: number;
}

const RECOMMENDED_VAT_RATES = [4, 5, 10, 22];
const DEFAULT_VAT_RATE = 10;

const calculateLineFields = (item: any) => {
  const qty = parseFloat(item.qty) || 0;
  const price = parseFloat(item.price) || 0;
  const total = qty * price;
  const vatRate = parseFloat(item.vatRate) || DEFAULT_VAT_RATE;
  const vatAmount = total * (vatRate / 100);

  return {
    ...item,
    total: total.toFixed(2),
    vatAmount: vatAmount.toFixed(2),
  };
};

export default function LineItems({
  isEditing = false,
  items,
  onItemsChange,
  subtotal: propsSubtotal,
  vat: propsVat,
  total: propsTotal,
}: LineItemsProps) {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [draftItem, setDraftItem] = useState<any | null>(null);
  const [vatPickerOpen, setVatPickerOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    if (selectedIndex === null || !items[selectedIndex]) {
      return '';
    }
    return items[selectedIndex].product || '';
  }, [items, selectedIndex]);

  const openEditor = (index: number) => {
    setSelectedIndex(index);
    setDraftItem({ ...items[index] });
    setVatPickerOpen(false);
  };

  const closeEditor = () => {
    setSelectedIndex(null);
    setDraftItem(null);
    setVatPickerOpen(false);
  };

  const updateDraft = (field: string, value: string) => {
    setDraftItem((current: any) => {
      if (!current) return current;
      const next = { ...current, [field]: value };
      return calculateLineFields(next);
    });
  };

  const saveDraft = () => {
    if (selectedIndex === null || !draftItem) {
      return;
    }
    const newItems = [...items];
    newItems[selectedIndex] = calculateLineFields(draftItem);
    onItemsChange(newItems);
    closeEditor();
  };

  return (
    <View style={styles.tableCard}>
      <View style={styles.tableHead}>
        <Text style={[styles.tableHeadText, { flex: 2.2 }]}>PRODUCT</Text>
        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>QTY</Text>
        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>PRICE</Text>
        <Text style={[styles.tableHeadText, { flex: 1.1, textAlign: 'center' }]}>IVA</Text>
        <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}>TOTAL</Text>
      </View>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Pressable
            key={`item-${item.id}-${index}`}
            style={({ pressed }) => [
              styles.tableRow,
              isLast && styles.lastRow,
              isEditing && styles.editableRow,
              pressed && isEditing && styles.editableRowPressed,
            ]}
            onPress={isEditing ? () => openEditor(index) : undefined}
          >
            <View style={{ flex: 2.2 }}>
              <View style={styles.productCellHeader}>
                <Text style={styles.tableCellMain} numberOfLines={2}>{item.product}</Text>
              </View>
            </View>
            <Text style={[styles.tableCellSub, { flex: 1, textAlign: 'center' }]}>{item.qty}</Text>
            <Text style={[styles.tableCellSub, { flex: 1, textAlign: 'right' }]}>EUR {item.price}</Text>
            <Text style={[styles.tableCellSub, { flex: 1.1, textAlign: 'center' }]}>{item.vatRate || 10}%</Text>
            <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'right' }]}>EUR {item.total}</Text>
          </Pressable>
        );
      })}

      <Modal
        visible={selectedIndex !== null && draftItem !== null}
        transparent
        animationType="fade"
        onRequestClose={closeEditor}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={closeEditor} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalShell}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('edit_line_item')}</Text>
                <TouchableOpacity onPress={closeEditor} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>X</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle} numberOfLines={2}>
                {selectedLabel}
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              >
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{t('product_name')}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={String(draftItem?.product ?? '')}
                    onChangeText={(text) => updateDraft('product', text)}
                    placeholder={t('product_name_placeholder')}
                  />
                </View>

                <View style={styles.rowFields}>
                  <View style={[styles.fieldGroup, styles.flexOne]}>
                    <Text style={styles.fieldLabel}>{t('quantity')}</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={String(draftItem?.qty ?? '')}
                      onChangeText={(text) => updateDraft('qty', text)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.fieldGroup, styles.flexOne]}>
                    <Text style={styles.fieldLabel}>{t('unit_price')}</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={String(draftItem?.price ?? '')}
                      onChangeText={(text) => updateDraft('price', text)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{t('vat_rate')}</Text>
                  <View style={styles.vatComboBox}>
                    <View style={styles.vatComboPrefix}>
                      <Text style={styles.vatComboPrefixText}>VAT</Text>
                    </View>
                    <TextInput
                      style={styles.vatComboInput}
                      value={String(draftItem?.vatRate ?? '')}
                      onChangeText={(text) => updateDraft('vatRate', text)}
                      keyboardType="numeric"
                      placeholder="%"
                      onFocus={() => setVatPickerOpen(true)}
                    />
                    <TouchableOpacity
                      style={styles.vatComboToggle}
                      onPress={() => setVatPickerOpen((current) => !current)}
                    >
                      <Text style={styles.vatComboToggleText}>
                        {vatPickerOpen ? '^' : 'v'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.vatComboHelper}>{t('vat_select_hint')}</Text>
                  {vatPickerOpen ? (
                    <View style={styles.vatDropdown}>
                      <View style={styles.vatSuggestionPanel}>
                        <View style={styles.vatSuggestionList}>
                          {RECOMMENDED_VAT_RATES.map((rate) => {
                            const active =
                              Number(draftItem?.vatRate || DEFAULT_VAT_RATE) === rate;
                            return (
                              <TouchableOpacity
                                key={rate}
                                style={[
                                  styles.vatSuggestionItem,
                                  active && styles.vatSuggestionItemActive,
                                ]}
                                onPress={() => updateDraft('vatRate', String(rate))}
                              >
                                <Text
                                  style={[
                                    styles.vatSuggestionText,
                                    active && styles.vatSuggestionTextActive,
                                  ]}
                                >
                                  {rate}%
                                </Text>
                                {active ? (
                                  <Text style={styles.vatSuggestionCheck}>*</Text>
                                ) : null}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  ) : null}
                </View>

                <View style={styles.rowFields}>
                  <View style={[styles.fieldGroup, styles.flexOne]}>
                    <Text style={styles.fieldLabel}>{t('line_total')}</Text>
                    <TextInput
                      style={[styles.fieldInput, styles.readOnlyInput]}
                      value={String(draftItem?.total ?? '')}
                      editable={false}
                    />
                  </View>
                  <View style={[styles.fieldGroup, styles.flexOne]}>
                    <Text style={styles.fieldLabel}>{t('vat_amount')}</Text>
                    <Text style={styles.readOnlyValue}>
                      EUR {String(draftItem?.vatAmount ?? '0.00')}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={closeEditor}>
                    <Text style={styles.secondaryButtonText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryButton} onPress={saveDraft}>
                    <Text style={styles.primaryButtonText}>{t('okay')}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{t('invoice_net_total')}</Text>
        <Text style={styles.summaryValueMain}>EUR {propsSubtotal?.toFixed(2) || '0.00'}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{t('invoice_vat_total')}</Text>
        <Text style={styles.summaryValueMain}>EUR {propsVat?.toFixed(2) || '0.00'}</Text>
      </View>
      <View style={[styles.summaryRow, { marginTop: verticalScale(8) }]}>
        <Text style={styles.grandTotalLabel}>{t('invoice_final_total')}</Text>
        <Text style={styles.grandTotalValue}>EUR {propsTotal?.toFixed(2) || '0.00'}</Text>
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
    padding: scale(16),
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: verticalScale(12),
    marginBottom: verticalScale(12),
  },
  editableRow: {
    paddingVertical: verticalScale(2),
  },
  editableRowPressed: {
    opacity: 0.85,
  },
  tableCellMain: {
    fontSize: moderateScale(13, 0.3),
    color: '#374151',
    fontWeight: '600',
  },
  productCellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(8),
  },
  tableCellSub: {
    fontSize: moderateScale(12, 0.3),
    color: '#9CA3AF',
  },
  tableCellBold: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  lastRow: {
    borderBottomColor: '#E5E7EB',
  },
  inputCell: {
    fontSize: moderateScale(12, 0.3),
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: verticalScale(2),
    marginHorizontal: scale(2),
  },
  inputCellBold: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '700',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: verticalScale(2),
    marginHorizontal: scale(2),
  },
  vatComboBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(14),
    backgroundColor: '#FFFFFF',
    shadowColor: '#111827',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    overflow: 'hidden',
  },
  vatComboPrefix: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(11),
    backgroundColor: '#FFF7F2',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  vatComboPrefixText: {
    fontSize: moderateScale(10, 0.3),
    color: '#EA580C',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  vatComboInput: {
    flex: 1,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(11),
    fontSize: moderateScale(12, 0.3),
    color: '#111827',
    fontWeight: '700',
  },
  vatComboToggle: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(11),
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  vatComboToggleText: {
    fontSize: moderateScale(10, 0.3),
    color: '#6B7280',
    fontWeight: '700',
  },
  vatComboHelper: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(10, 0.3),
    color: '#9CA3AF',
  },
  vatDropdown: {
    marginTop: verticalScale(8),
  },
  vatSuggestionPanel: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(14),
    padding: scale(12),
    backgroundColor: '#FFFFFF',
  },
  vatSuggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  vatSuggestionItem: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(12),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    backgroundColor: '#F9FAFB',
    minWidth: scale(68),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
  },
  vatSuggestionItemActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7F2',
  },
  vatSuggestionText: {
    fontSize: moderateScale(11, 0.3),
    color: '#374151',
    fontWeight: '700',
  },
  vatSuggestionTextActive: {
    color: '#EA580C',
  },
  vatSuggestionCheck: {
    fontSize: moderateScale(10, 0.3),
    color: '#EA580C',
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.58)',
    justifyContent: 'flex-end',
  },
  modalShell: {
    width: '100%',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  modalCloseButton: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: moderateScale(18, 0.3),
    color: '#111827',
    lineHeight: moderateScale(18, 0.3),
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: moderateScale(12, 0.3),
    color: '#6B7280',
    marginTop: verticalScale(6),
    marginBottom: verticalScale(16),
  },
  modalContent: {
    paddingBottom: verticalScale(10),
  },
  fieldGroup: {
    marginBottom: verticalScale(16),
  },
  fieldLabel: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(8),
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(12),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(14, 0.3),
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  readOnlyInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  rowFields: {
    flexDirection: 'row',
    gap: scale(12),
  },
  flexOne: {
    flex: 1,
  },
  readOnlyValue: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(12),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(14, 0.3),
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  modalActions: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(8),
  },
  secondaryButton: {
    flex: 1,
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: verticalScale(13),
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#374151',
  },
  primaryButton: {
    flex: 1,
    borderRadius: scale(12),
    paddingVertical: verticalScale(13),
    alignItems: 'center',
    backgroundColor: '#FA8C4C',
  },
  primaryButtonText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
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
