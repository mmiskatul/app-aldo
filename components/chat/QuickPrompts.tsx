import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTranslation } from '../../utils/i18n';

interface QuickPromptsProps {
  onSelectPrompt?: (text: string) => void;
}

export default function QuickPrompts({ onSelectPrompt }: QuickPromptsProps) {
  const { t } = useTranslation();
  const prompts = [
    { id: 1, text: t('quick_prompt_revenue'), type: 'primary' as const },
    { id: 2, text: t('quick_prompt_expenses'), type: 'secondary' as const },
    { id: 3, text: t('quick_prompt_covers'), type: 'secondary' as const },
  ];
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{t('quick_prompts_subtitle')}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {prompts.map((prompt) => (
          <TouchableOpacity 
            key={prompt.id} 
            style={[styles.pill, prompt.type === 'primary' ? styles.pillPrimary : styles.pillSecondary]}
            onPress={() => onSelectPrompt?.(prompt.text)}
          >
            <Text style={[styles.pillText, prompt.type === 'primary' ? styles.textPrimary : styles.textSecondary]}>
              {prompt.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: verticalScale(20),
    marginBottom: verticalScale(20),
  },
  subtitle: {
    fontSize: moderateScale(14, 0.3),
    color: '#374151',
    lineHeight: moderateScale(20),
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(16),
  },
  scrollContent: {
    paddingHorizontal: scale(20),
  },
  pill: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: scale(20),
    borderWidth: 1,
    marginRight: scale(12),
  },
  pillPrimary: {
    backgroundColor: '#FFF8F3', // Light orange background
    borderColor: '#FCE7D6',
  },
  pillSecondary: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  pillText: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '500',
  },
  textPrimary: {
    color: '#FA8C4C',
  },
  textSecondary: {
    color: '#4B5563',
  },
});
