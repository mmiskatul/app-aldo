import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface SummaryCardData {
  label: string;
  value: any;
  change_percent?: number;
  subtitle?: string;
}

interface SummaryCardsProps {
  metrics: SummaryCardData[];
}

export default function SummaryCards({ metrics }: SummaryCardsProps) {
  const formatMetricValue = (card: SummaryCardData) => {
    if (typeof card.value !== 'number') {
      return card.value;
    }

    const normalizedLabel = card.label.trim().toLowerCase();
    if (normalizedLabel.includes('cover') || normalizedLabel.includes('coperti')) {
      return card.value.toLocaleString();
    }

    return `€${card.value.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      {metrics.slice(0, 2).map((card, index) => (
        <View key={`${card.label}-${index}`} style={styles.card}>
          <Text style={styles.label}>{card.label}</Text>
          <Text style={styles.value}>{formatMetricValue(card)}</Text>

          {card.change_percent !== undefined ? (
            <Text style={[styles.trendText, { color: card.change_percent >= 0 ? '#10B981' : '#EF4444' }]}>
              {card.change_percent >= 0 ? '+' : ''}
              {card.change_percent}%
            </Text>
          ) : null}

          {card.subtitle ? <Text style={styles.subtext}>{card.subtitle}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: scale(-5),
    marginBottom: verticalScale(18),
  },
  card: {
    width: '47%',
    minHeight: verticalScale(96),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(14),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: scale(5),
  },
  label: {
    fontSize: moderateScale(12, 0.3),
    color: '#8B95A7',
    fontWeight: '600',
    marginBottom: verticalScale(9),
  },
  value: {
    fontSize: moderateScale(22, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  trendText: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '700',
  },
  subtext: {
    fontSize: moderateScale(10, 0.3),
    color: '#8B95A7',
    fontWeight: '500',
  },
});
