import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';

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

    return `$${card.value.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      {metrics.map((card, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.label}>{card.label}</Text>
          <Text style={styles.value}>{formatMetricValue(card)}</Text>
          
          {card.change_percent !== undefined && (
            <View style={styles.trendContainer}>
              <Feather 
                name={card.change_percent >= 0 ? "trending-up" : "trending-down"} 
                size={moderateScale(14)} 
                color={card.change_percent >= 0 ? "#10B981" : "#EF4444"} 
              />
              <Text style={[styles.trendText, { color: card.change_percent >= 0 ? "#10B981" : "#EF4444" }]}>
                {card.change_percent >= 0 ? '+' : ''}{card.change_percent}%
              </Text>
            </View>
          )}

          {card.subtitle && (
            <Text style={styles.subtext}>{card.subtitle}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(24),
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginHorizontal: scale(4),
  },
  label: {
    fontSize: moderateScale(12, 0.3),
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: verticalScale(8),
  },
  value: {
    fontSize: moderateScale(20, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: moderateScale(11, 0.3),
    color: '#10B981',
    fontWeight: '700',
    marginLeft: scale(4),
  },
  subtext: {
    fontSize: moderateScale(11, 0.3),
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
