import { Feather } from '@expo/vector-icons';
import apiClient from '../../../api/apiClient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useTranslation } from '../../../utils/i18n';

interface StockUpdateProps {
  itemId: string;
  onUpdated: (payload: any) => void;
}

export function StockUpdate({ itemId, onUpdated }: StockUpdateProps) {
  const { t } = useTranslation();
  const [stockToUpdate, setStockToUpdate] = useState({ add: 0, remove: 0 });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!stockToUpdate.add && !stockToUpdate.remove) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient.post(`/api/v1/restaurant/inventory/${itemId}/stock-update`, {
        add_stock: stockToUpdate.add,
        remove_stock: stockToUpdate.remove,
      });
      setStockToUpdate({ add: 0, remove: 0 });
      onUpdated(response.data);
    } catch (error: any) {
      Alert.alert('Update failed', error.response?.data?.detail || error.message || 'Unable to update stock.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>{t('stock_update')}</Text>
      <View style={styles.updateRow}>
        <TouchableOpacity
          style={styles.updateBox}
          onPress={() => setStockToUpdate((prev) => ({ ...prev, add: prev.add + 1 }))}
        >
          <Text style={styles.updateLabel}>{t('add_stock')}</Text>
          <View style={styles.updateControls}>
            <Feather name="plus-circle" size={moderateScale(20)} color="#16A34A" />
            <Text style={styles.updateNum}>{stockToUpdate.add}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.updateBox}
          onPress={() => setStockToUpdate((prev) => ({ ...prev, remove: prev.remove + 1 }))}
        >
          <Text style={styles.updateLabel}>{t('remove_stock')}</Text>
          <View style={styles.updateControls}>
            <Feather name="minus-circle" size={moderateScale(20)} color="#DC2626" />
            <Text style={styles.updateNum}>{stockToUpdate.remove}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.updateButton, submitting && styles.updateButtonDisabled]}
        onPress={() => void handleSubmit()}
        disabled={submitting || (!stockToUpdate.add && !stockToUpdate.remove)}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.updateButtonText}>{t('update_stock_level')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(12),
  },
  updateRow: { flexDirection: 'row', gap: scale(12), marginBottom: verticalScale(12) },
  updateBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: scale(12),
    padding: scale(14),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  updateLabel: { fontSize: moderateScale(10), fontWeight: '700', color: '#111827', marginBottom: verticalScale(8) },
  updateControls: { flexDirection: 'row', alignItems: 'center', gap: scale(8) },
  updateNum: { fontSize: moderateScale(18), fontWeight: '700', color: '#111827' },
  updateButton: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(10),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: { color: '#FFFFFF', fontSize: moderateScale(14), fontWeight: '600' },
});
