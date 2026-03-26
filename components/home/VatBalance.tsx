import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { LinearGradient } from 'expo-linear-gradient';

interface VatBalanceProps {
  balance?: number;
  onPress?: () => void;
}

export default function VatBalance({ balance, onPress }: VatBalanceProps) {
  const Container = onPress ? TouchableOpacity : React.Fragment;

  return (
    <Container {...(onPress ? { onPress, activeOpacity: 0.8 } : {})}>
      <LinearGradient
        colors={['#1F1612', '#C28522']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.container}
      >
        <Text style={styles.subtitle}>ESTIMATED VAT BALANCE</Text>
        <Text style={styles.balanceText}>€{balance !== undefined ? balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : 80}</Text>
        
        <View style={styles.syncContainer}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>Live sync</Text>
        </View>
      </LinearGradient>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  subtitle: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '600',
    color: '#D1D5DB',
    letterSpacing: 0.5,
    marginBottom: verticalScale(8),
  },
  balanceText: {
    fontSize: moderateScale(40, 0.3),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: verticalScale(16),
  },
  syncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  syncDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#10B981',
    marginRight: scale(6),
  },
  syncText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
