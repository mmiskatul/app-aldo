import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../../utils/i18n';
import Skeleton from '../ui/Skeleton';

interface VatBalanceProps {
  balance?: number;
  loading?: boolean;
  onPress?: () => void;
}

export default function VatBalance({ balance, loading = false, onPress }: VatBalanceProps) {
  const Container = onPress ? TouchableOpacity : React.Fragment;
  const { t } = useTranslation();

  if (!loading && balance === undefined) {
    return null;
  }
  const displayBalance = balance ?? 0;

  return (
    <Container {...(onPress ? { onPress, activeOpacity: 0.8 } : {})}>
      <LinearGradient
        colors={['#1F1612', '#C28522']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.container}
      >
        <Text style={styles.subtitle}>{t('estimated_vat')}</Text>
        {loading ? (
          <Skeleton
            width={scale(150)}
            height={moderateScale(34)}
            borderRadius={12}
            style={styles.balanceSkeleton}
          />
        ) : (
          <Text style={styles.balanceText}>
            {'\u20AC'}{displayBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </Text>
        )}

        <View style={styles.syncContainer}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>{t('live_sync')}</Text>
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
  balanceSkeleton: {
    backgroundColor: 'rgba(255,255,255,0.28)',
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
