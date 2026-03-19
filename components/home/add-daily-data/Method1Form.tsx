import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';

export default function Method1Form() {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>CASH TRACKING</Text>
        <View style={styles.infoIconContainer}>
          <Feather name="info" size={moderateScale(12)} color="#B45309" />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>POS Payments (+)</Text>
        <View style={styles.inputContainer}>
          <Feather name="credit-card" size={moderateScale(20)} color="#FA8C4C" style={styles.icon} />
          <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
          <Text style={styles.currency}>USD</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cash Withdrawals (+)</Text>
        <View style={styles.inputContainer}>
          <Feather name="briefcase" size={moderateScale(20)} color="#FA8C4C" style={styles.icon} />
          <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
          <Text style={styles.currency}>USD</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: scale(8) }]}>
          <Text style={styles.label}>Cash In (-)</Text>
          <View style={styles.inputContainer}>
            <TextInput style={[styles.input, { paddingLeft: scale(16) }]} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: scale(8) }]}>
          <Text style={styles.label}>Cash Out (+)</Text>
          <View style={styles.inputContainer}>
            <TextInput style={[styles.input, { paddingLeft: scale(16) }]} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Expenses in Cash (+)</Text>
          <TouchableOpacity style={styles.addNoteBtn}>
            <Feather name="align-left" size={moderateScale(12)} color="#FA8C4C" />
            <Text style={styles.addNoteText}>Add note</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Feather name="file-text" size={moderateScale(20)} color="#FA8C4C" style={styles.icon} />
          <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
          <Text style={styles.currency}>USD</Text>
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
