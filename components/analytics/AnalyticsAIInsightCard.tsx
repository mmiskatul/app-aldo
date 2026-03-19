import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SparklesIcon } from 'react-native-heroicons/solid';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function AnalyticsAIInsightCard() {
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
      </View>
      <Text style={styles.content}>
        <Text style={styles.highlight}>Optimization Tip:</Text> Staffing costs are 5% higher on Tuesdays relative to revenue.
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: scale(20),
    borderRadius: scale(16),
    marginBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  title: {
    color: '#FB923C',
    fontSize: moderateScale(14, 0.3),
    fontWeight: '800',
    marginLeft: scale(8),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    color: '#F9FAFB',
    fontSize: moderateScale(15, 0.3),
    lineHeight: moderateScale(22, 0.3),
    fontWeight: '500',
  },
  highlight: {
    fontWeight: '800',
    color: '#FB923C',
  },
});
