import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTranslation } from '../../../utils/i18n';

interface BottomActionsProps {
  isLoading?: boolean;
  onConfirmPress?: () => void;
}

export default function BottomActions({ isLoading = false, onConfirmPress }: BottomActionsProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.bottomActions}>
      <TouchableOpacity 
        style={styles.confirmButton} 
        onPress={onConfirmPress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.confirmButtonText}>{t('confirm_and_save')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomActions: {
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(12),
    height: verticalScale(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
