import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SparklesIcon } from 'react-native-heroicons/solid';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface AnalyticsAIInsightCardProps {
  insight: {
    title?: string | null;
    subtitle?: string | null;
    ai_provider?: string | null;
  };
}

export default function AnalyticsAIInsightCard({ insight }: AnalyticsAIInsightCardProps) {
  const title = String(insight.title || '').trim();
  const subtitle = String(insight.subtitle || '').trim();
  const isAiGenerated = String(insight.ai_provider || '').toLowerCase() === 'openai';
  const hasSeparateSubtitle = Boolean(subtitle && subtitle !== title);

  if (!title && !subtitle) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#111111', '#B47B12']} // Darkish to gold-ish gradient based on image
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <SparklesIcon size={moderateScale(16)} color="#FB923C" />
        <Text style={styles.title}>AI Business Insight</Text>
        <Text style={styles.providerBadge}>{isAiGenerated ? 'AI' : 'Fallback'}</Text>
      </View>
      <Text style={styles.content}>{title || subtitle}</Text>
      {hasSeparateSubtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(18),
    borderRadius: scale(9),
    marginBottom: verticalScale(18),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  title: {
    color: '#FB923C',
    fontSize: moderateScale(14, 0.3),
    fontWeight: '800',
    marginLeft: scale(8),
    letterSpacing: 0,
  },
  providerBadge: {
    marginLeft: 'auto',
    color: '#111827',
    backgroundColor: '#FDE68A',
    fontSize: moderateScale(9, 0.3),
    fontWeight: '900',
    paddingHorizontal: scale(7),
    paddingVertical: verticalScale(3),
    borderRadius: scale(8),
    overflow: 'hidden',
  },
  content: {
    color: '#F9FAFB',
    fontSize: moderateScale(14, 0.3),
    lineHeight: moderateScale(21, 0.3),
    fontWeight: '500',
  },
  subtitle: {
    color: '#FDE68A',
    fontSize: moderateScale(12, 0.3),
    lineHeight: moderateScale(18, 0.3),
    fontWeight: '500',
    marginTop: verticalScale(8),
  },
  highlight: {
    fontWeight: '800',
    color: '#FB923C',
  },
});
