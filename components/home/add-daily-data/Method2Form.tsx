import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';

export default function Method2Form() {
  return (
    <View style={styles.container}>
      {/* Payment Inputs */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Feather name="credit-card" size={moderateScale(18)} color="#FA8C4C" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Payment Inputs</Text>
        </View>
        <View style={styles.infoIconContainer}>
          <Feather name="info" size={moderateScale(12)} color="#B45309" />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>POS Payments (+)</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.prefixSign}>€</Text>
          <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cash Payments (+)</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.prefixSign}>€</Text>
          <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Invoices Paid by Bank Transfer (+)</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.prefixSign}>€</Text>
          <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
        </View>
      </View>

      {/* Customer Covers */}
      <View style={[styles.sectionHeader, { marginTop: verticalScale(16) }]}>
        <View style={styles.titleRow}>
          <Feather name="users" size={moderateScale(18)} color="#FA8C4C" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Customer Covers</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: scale(8) }]}>
          <Text style={styles.label}>Lunch Covers</Text>
          <View style={styles.inputContainer}>
            <TextInput style={[styles.input, { paddingLeft: scale(16) }]} placeholder="0" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: scale(8) }]}>
          <Text style={styles.label}>Dinner Covers</Text>
          <View style={styles.inputContainer}>
            <TextInput style={[styles.input, { paddingLeft: scale(16) }]} placeholder="0" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
          </View>
        </View>
      </View>

      {/* Cash Register Balance */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <View style={styles.balanceIconBg}>
            <Feather name="inbox" size={moderateScale(16)} color="#FA8C4C" />
          </View>
          <Text style={styles.sectionTitle}>Cash Register Balance</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.labelDark}>Opening Cash</Text>
          <Text style={styles.subLabel}>Amount of cash in the register at the beginning of the day</Text>
          <View style={styles.inputContainerBgWhite}>
            <Text style={styles.prefixSign}>$</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.labelDark}>Closing Cash</Text>
          <Text style={styles.subLabel}>Amount of cash counted in the register at the end of the day</Text>
          <View style={styles.inputContainerBgWhite}>
            <Text style={styles.prefixSign}>$</Text>
            <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: verticalScale(100), // space for save button
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: scale(12),
    width: moderateScale(24),
    height: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: scale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(13, 0.3),
    color: '#374151',
    fontWeight: '600',
    marginBottom: verticalScale(8),
  },
  labelDark: {
    fontSize: moderateScale(13, 0.3),
    color: '#111827',
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  subLabel: {
    fontSize: moderateScale(11, 0.3),
    color: '#6B7280',
    marginBottom: verticalScale(8),
    lineHeight: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(12),
    height: verticalScale(54),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
  },
  inputContainerBgWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(12),
    height: verticalScale(54),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
  },
  prefixSign: {
    fontSize: moderateScale(16, 0.3),
    color: '#6B7280',
    marginRight: scale(8),
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16, 0.3),
    color: '#111827',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceCard: {
    backgroundColor: '#FFF8F3', // Light orange background
    borderRadius: scale(16),
    padding: scale(16),
    marginTop: verticalScale(8),
    borderWidth: 1,
    borderColor: '#FCE7D6',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  balanceIconBg: {
    backgroundColor: '#FFFFFF',
    padding: scale(6),
    borderRadius: scale(8),
    marginRight: scale(8),
    borderWidth: 1,
    borderColor: '#FCE7D6',
  }
});
