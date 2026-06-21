import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '../../../utils/i18n';

export interface Method1Data {
  pos_payments: string;
  cash_withdrawals: string;
  cash_in: string;
  cash_out: string;
  expenses_in_cash: string;
  opening_cash: string;
  closing_cash: string;
  lunch_covers: string;
  dinner_covers: string;
  notes: string;
}

interface Props {
  data: Method1Data;
  onChange: (key: keyof Method1Data, val: string) => void;
  onInfoPress?: () => void;
}

export default function Method1Form({ data, onChange, onInfoPress }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('cash_tracking')}</Text>
        <TouchableOpacity
          style={styles.infoIconContainer}
          onPress={onInfoPress}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Revenue input methods"
        >
          <Feather name="info" size={moderateScale(12)} color="#B45309" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('pos_payments')} (+)</Text>
        <View style={styles.inputContainer}>
          <Feather name="credit-card" size={moderateScale(20)} color="#FA8C4C" style={styles.icon} />
          <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={data.pos_payments} onChangeText={(val) => onChange('pos_payments', val)} />
          <Text style={styles.currency}>â‚¬</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t('cash_withdrawals')} (+)</Text>
        <View style={styles.inputContainer}>
          <Feather name="briefcase" size={moderateScale(20)} color="#FA8C4C" style={styles.icon} />
          <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={data.cash_withdrawals} onChangeText={(val) => onChange('cash_withdrawals', val)} />
          <Text style={styles.currency}>â‚¬</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: scale(8) }]}>
          <Text style={styles.label}>{t('initial_cash')} (-)</Text>
          <View style={styles.inputContainer}>
            <TextInput style={[styles.input, { paddingLeft: scale(16) }]} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={data.opening_cash} onChangeText={(val) => onChange('opening_cash', val)} />
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: scale(8) }]}>
          <Text style={styles.label}>{t('final_cash')} (+)</Text>
          <View style={styles.inputContainer}>
            <TextInput style={[styles.input, { paddingLeft: scale(16) }]} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={data.closing_cash} onChangeText={(val) => onChange('closing_cash', val)} />
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{t('cash_expenses_paid_from_drawer')} (+)</Text>
          <TouchableOpacity style={styles.addNoteBtn}>
            <Feather name="align-left" size={moderateScale(12)} color="#FA8C4C" />
            <Text style={styles.addNoteText}>{t('add_note')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Feather name="file-text" size={moderateScale(20)} color="#FA8C4C" style={styles.icon} />
          <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={data.expenses_in_cash} onChangeText={(val) => onChange('expenses_in_cash', val)} />
          <Text style={styles.currency}>â‚¬</Text>
        </View>
        <TextInput
          style={[styles.inputContainer, { height: verticalScale(80), paddingTop: verticalScale(12), paddingHorizontal: scale(16), marginTop: verticalScale(8) }]}
          multiline
          placeholder={t('notes_placeholder')}
          placeholderTextColor="#9CA3AF"
          value={data.notes}
          onChangeText={(val) => onChange('notes', val)}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: scale(8) }]}>
          <Text style={styles.label}>{t('lunch_coperti')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { paddingLeft: scale(16) }]}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={data.lunch_covers}
              onChangeText={(val) => onChange('lunch_covers', val)}
            />
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: scale(8) }]}>
          <Text style={styles.label}>{t('dinner_coperti')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { paddingLeft: scale(16) }]}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={data.dinner_covers}
              onChangeText={(val) => onChange('dinner_covers', val)}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: verticalScale(100),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
  },
  infoIconContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: scale(12),
    width: moderateScale(24),
    height: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: verticalScale(16),
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  label: {
    fontSize: moderateScale(13, 0.3),
    color: '#374151',
    fontWeight: '600',
    marginBottom: verticalScale(8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(12),
    height: verticalScale(54),
    backgroundColor: '#FFFFFF',
  },
  icon: {
    marginLeft: scale(16),
    marginRight: scale(8),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16, 0.3),
    color: '#111827',
    fontWeight: '700',
  },
  currency: {
    fontSize: moderateScale(14, 0.3),
    color: '#6B7280',
    fontWeight: '600',
    marginRight: scale(16),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addNoteText: {
    color: '#FA8C4C',
    fontSize: moderateScale(13, 0.3),
    fontWeight: '600',
    marginLeft: scale(4),
  },
});
