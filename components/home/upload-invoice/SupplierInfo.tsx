import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTranslation } from '../../../utils/i18n';

interface SupplierInfoProps {
  name?: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  isEditing?: boolean;
  onChangeName?: (value: string) => void;
}

export default function SupplierInfo({ name, invoiceNumber, invoiceDate, isEditing = false, onChangeName }: SupplierInfoProps) {
  const { t } = useTranslation();
  const hasSupplierInfo = !!(name || invoiceNumber || invoiceDate);

  if (!hasSupplierInfo) {
    return null;
  }

  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{t('supplier_name').toUpperCase()}</Text>
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={name || ''}
          onChangeText={onChangeName}
          placeholder={t('enter_supplier_name')}
          placeholderTextColor="#9CA3AF"
        />
      ) : (
        <Text style={styles.infoValueMain}>{name || ''}</Text>
      )}
      
      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>{t('invoice_number').toUpperCase()}</Text>
          <Text style={styles.infoValue}>{invoiceNumber || ''}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>{t('invoice_date').toUpperCase()}</Text>
          <Text style={styles.infoValue}>{invoiceDate || ''}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(24),
  },
  infoLabel: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: verticalScale(4),
  },
  infoValueMain: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  input: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: verticalScale(16),
    paddingVertical: verticalScale(6),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  infoValue: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '600',
    color: '#111827',
  },
});
