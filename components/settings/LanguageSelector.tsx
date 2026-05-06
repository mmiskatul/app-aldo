import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../utils/i18n';

interface LanguageSelectorProps {
  value?: string;
  onChange?: (lang: string) => void;
  compact?: boolean;
}

export default function LanguageSelector({ value, onChange, compact = false }: LanguageSelectorProps) {
  const { t } = useTranslation();
  const globalAppLanguage = useAppStore((state) => state.appLanguage);
  const globalSetAppLanguage = useAppStore((state) => state.setAppLanguage);

  const currentLanguage = value !== undefined ? value : globalAppLanguage;
  const setLanguage = onChange || globalSetAppLanguage;

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <TouchableOpacity
        style={[styles.option, compact && styles.compactOption, currentLanguage === 'en' && styles.selectedOption]}
        onPress={() => setLanguage('en')}
      >
        <Text style={[styles.label, compact && styles.compactLabel, currentLanguage === 'en' && styles.selectedLabel]}>
          {compact ? 'EN' : t('english')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, compact && styles.compactOption, currentLanguage === 'it' && styles.selectedOption]}
        onPress={() => setLanguage('it')}
      >
        <Text style={[styles.label, compact && styles.compactLabel, currentLanguage === 'it' && styles.selectedLabel]}>
          {compact ? 'IT' : t('italian')}
        </Text>
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
  compactContainer: {
    borderRadius: scale(9),
    padding: scale(3),
    marginTop: 0,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    borderRadius: scale(8),
  },
  compactOption: {
    paddingVertical: verticalScale(5),
    paddingHorizontal: scale(5),
    borderRadius: scale(7),
  },
  selectedOption: {
    backgroundColor: '#FFEDD5',
  },
  label: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '600',
    color: '#6B7280',
  },
  compactLabel: {
    fontSize: moderateScale(11, 0.3),
  },
  selectedLabel: {
    color: '#FA8C4C',
  },
});
