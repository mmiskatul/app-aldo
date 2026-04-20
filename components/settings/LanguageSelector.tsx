import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../utils/i18n';

interface LanguageSelectorProps {
  value?: string;
  onChange?: (lang: string) => void;
}

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const { t } = useTranslation();
  const globalAppLanguage = useAppStore((state) => state.appLanguage);
  const globalSetAppLanguage = useAppStore((state) => state.setAppLanguage);

  const currentLanguage = value !== undefined ? value : globalAppLanguage;
  const setLanguage = onChange || globalSetAppLanguage;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.option, currentLanguage === 'en' && styles.selectedOption]}
        onPress={() => setLanguage('en')}
      >
        <Text style={styles.flag}>🇺🇸</Text>
        <Text style={[styles.label, currentLanguage === 'en' && styles.selectedLabel]}>{t('english')}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.option, currentLanguage === 'it' && styles.selectedOption]}
        onPress={() => setLanguage('it')}
      >
        <Text style={styles.flag}>🇮🇹</Text>
        <Text style={[styles.label, currentLanguage === 'it' && styles.selectedLabel]}>{t('italian')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    padding: scale(6),
    marginTop: verticalScale(20),
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    borderRadius: scale(8),
  },
  selectedOption: {
    backgroundColor: '#FFEDD5',
  },
  flag: {
    fontSize: moderateScale(16),
    marginRight: scale(8),
  },
  label: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedLabel: {
    color: '#FA8C4C',
  },
});
