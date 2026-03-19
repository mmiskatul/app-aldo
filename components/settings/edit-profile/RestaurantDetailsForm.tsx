import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import FormInput from './FormInput';

export default function RestaurantDetailsForm() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>RESTAURANT DETAILS</Text>
      
      <FormInput label="Restaurant Name" defaultValue="The Golden Harvest" />

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Restaurant Type</Text>
        <TouchableOpacity style={styles.dropdown} activeOpacity={0.7}>
          <Text style={styles.dropdownText}>Fine Dining</Text>
          <Feather name="chevron-down" size={moderateScale(18)} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: scale(8) }}>
          <FormInput label="City / Location" defaultValue="San Francisco" />
        </View>
        <View style={{ flex: 1, marginLeft: scale(8) }}>
          <FormInput label="Number of Seats" defaultValue="120" keyboardType="numeric" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '800',
    color: '#FA8C4C',
    letterSpacing: 1,
    marginBottom: verticalScale(20),
  },
  inputGroup: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#374151',
    marginBottom: verticalScale(8),
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(12),
    height: verticalScale(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
  },
  dropdownText: {
    fontSize: moderateScale(15, 0.3),
    color: '#111827',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
  },
});
