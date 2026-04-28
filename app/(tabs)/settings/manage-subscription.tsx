import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import Header from '../../../components/ui/Header';

export default function ManageSubscriptionScreen() {
  return (
    <View style={styles.safeArea}>
      <Header title="Manage Subscription" showBack={true} />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Feather name="credit-card" size={moderateScale(24)} color="#FA8C4C" />
          </View>
          <Text style={styles.title}>Subscription Management</Text>
          <Text style={styles.description}>
            This is a dummy page for now. The full subscription management flow is not implemented yet.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(24),
  },
  card: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: scale(16),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(24),
    alignItems: 'center',
  },
  iconWrap: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  title: {
    fontSize: moderateScale(20, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  description: {
    fontSize: moderateScale(14, 0.3),
    lineHeight: moderateScale(22, 0.3),
    color: '#6B7280',
    textAlign: 'center',
  },
});
