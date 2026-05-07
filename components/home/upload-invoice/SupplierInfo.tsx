import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface SupplierInfoProps {
  name?: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
}

export default function SupplierInfo({ name, invoiceNumber, invoiceDate }: SupplierInfoProps) {
  const hasSupplierInfo = !!(name || invoiceNumber || invoiceDate);

  if (!hasSupplierInfo) {
    return null;
  }

  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>SUPPLIER NAME</Text>
      <Text style={styles.infoValueMain}>{name || ''}</Text>
      
      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>INVOICE NUMBER</Text>
          <Text style={styles.infoValue}>{invoiceNumber || ''}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>INVOICE DATE</Text>
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
