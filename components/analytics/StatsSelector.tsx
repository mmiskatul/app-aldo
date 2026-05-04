import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface StatsSelectorProps {
  stats: Array<{ label: string; value: any }>;
}

const formatStatValue = (label: string, value: any) => {
  if (typeof value !== 'number') {
    return value;
  }

  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel.includes('cover') || normalizedLabel.includes('coperti')) {
    return value.toLocaleString();
  }

  if (normalizedLabel.includes('avg') || normalizedLabel.includes('media')) {
    return `€${value.toLocaleString()}`;
  }

  return `€${(value / 1000).toFixed(value >= 10000 ? 1 : 0)}k`;
};

export default function StatsSelector({ stats }: StatsSelectorProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <View style={styles.container}>
      {stats.slice(0, 3).map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <TouchableOpacity
            key={`${tab.label}-${index}`}
            style={[styles.tab, isActive && styles.tabActive]}
            activeOpacity={0.7}
            onPress={() => setActiveIndex(index)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            <Text style={styles.value}>{formatStatValue(tab.label, tab.value)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: scale(-4),
    marginBottom: verticalScale(18),
  },
  tab: {
    flex: 1,
    minHeight: verticalScale(64),
    backgroundColor: '#F1F5F9',
    borderRadius: scale(10),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(8),
    marginHorizontal: scale(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  label: {
    fontSize: moderateScale(9, 0.3),
    color: '#64748B',
    fontWeight: '800',
    marginBottom: verticalScale(6),
  },
  labelActive: {
    color: '#FF8748',
  },
  value: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '900',
    color: '#111827',
  },
});
