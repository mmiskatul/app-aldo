import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface StatsSelectorProps {
  stats: Array<{ label: string; value: any }>;
}

export default function StatsSelector({ stats }: StatsSelectorProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <View style={styles.container}>
      {stats.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <TouchableOpacity 
            key={index} 
            style={[styles.tab, isActive && styles.tabActive]}
            activeOpacity={0.7}
            onPress={() => setActiveIndex(index)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            <Text style={[styles.value, isActive && styles.valueActive]}>
              {typeof tab.value === 'number' ? `€${tab.value.toLocaleString()}` : tab.value}
            </Text>
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
    marginBottom: verticalScale(24),
  },
  tab: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    padding: scale(12),
    marginHorizontal: scale(4),
  },
  tabActive: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  label: {
    fontSize: moderateScale(10, 0.3),
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: verticalScale(4),
    textTransform: 'uppercase',
  },
  labelActive: {
    color: '#FB923C',
  },
  value: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  valueActive: {
    color: '#111827',
  },
});
