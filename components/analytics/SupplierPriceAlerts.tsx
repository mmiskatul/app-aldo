import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '../../utils/i18n';

interface SupplierPriceAlertsProps {
  alerts: any[];
}

export default function SupplierPriceAlerts({ alerts }: SupplierPriceAlertsProps) {
  const { t } = useTranslation();
  if (!alerts || alerts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('revenue_monitoring_alerts')}</Text>
        </View>
        <View style={[styles.alertCard, { backgroundColor: '#F3F4F6', justifyContent: 'center' }]}>
          <Text style={[styles.alertTitle, { color: '#6B7280', textAlign: 'center' }]}>{t('no_revenue_alerts')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('revenue_monitoring_alerts')}</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>{t('see_all').toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {alerts.map((alert, index) => (
        <View key={index} style={styles.alertCard}>
          <View style={styles.iconContainer}>
            <Feather name="trending-up" size={moderateScale(18)} color="#EF4444" />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.alertTitleRow}>
              <Text style={styles.alertTitle}>{alert.title || t('revenue_alert')}</Text>
              <Text style={styles.providerBadge}>
                {String(alert.ai_provider || '').toLowerCase() === 'openai' ? 'AI' : 'Fallback'}
              </Text>
            </View>
            <Text style={styles.impact}>{alert.subtitle || alert.impact || t('calculating')}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  title: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  viewAll: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '700',
    color: '#FA8C4C',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF1F2',
    borderRadius: scale(12),
    padding: scale(13),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  iconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  textContainer: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(8),
  },
  alertTitle: {
    flex: 1,
    fontSize: moderateScale(12, 0.3),
    fontWeight: '800',
    color: '#111827',
    marginBottom: verticalScale(2),
  },
  providerBadge: {
    color: '#7F1D1D',
    backgroundColor: '#FEE2E2',
    fontSize: moderateScale(8, 0.3),
    fontWeight: '900',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
    borderRadius: scale(7),
    overflow: 'hidden',
  },
  impact: {
    fontSize: moderateScale(10, 0.3),
    color: '#6B7280',
    fontWeight: '500',
  },
  impactValue: {
    fontWeight: '700',
  },
});
