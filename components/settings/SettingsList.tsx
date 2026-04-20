import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';

interface SettingsItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  iconBg: string;
  iconColor: string;
  onPress?: () => void;
}

interface SettingsListProps {
  items: SettingsItem[];
}

export default function SettingsList({ items }: SettingsListProps) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={[styles.item, index === items.length - 1 && styles.lastItem]}
          activeOpacity={0.7}
          onPress={() => item.onPress?.()}
        >
          <View style={styles.leftContent}>
            <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
              <Feather name={item.icon} size={moderateScale(18)} color={item.iconColor} />
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </View>
          <Feather name="chevron-right" size={moderateScale(18)} color="#9CA3AF" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  label: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '500',
    color: '#374151',
  },
});
