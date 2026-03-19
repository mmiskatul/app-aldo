import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';

export default function RegisterCard() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="inbox" size={moderateScale(16)} color="#FA8C4C" style={styles.icon} />
        <Text style={styles.title}>Register</Text>
      </View>
      
      <View style={styles.item}>
        <Text style={styles.labelSmall}>OPENING</Text>
        <Text style={styles.value}>€150</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.labelSmall}>CLOSING</Text>
        <Text style={styles.value}>€420</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: scale(16),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  icon: {
    marginRight: scale(8),
  },
  title: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  item: {
    marginBottom: verticalScale(12),
  },
  labelSmall: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: verticalScale(2),
  },
  value: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
});
