import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from '../../utils/i18n';
import { formatEuropeanDate } from '../../utils/date';

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  leftIcon?: React.ReactNode;
}

export default function DatePicker({ label, value, onChange, leftIcon }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const { t } = useTranslation();

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity 
        style={styles.textInputContainer}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <View style={styles.textContainer}>
          {leftIcon}
          <Text style={[styles.textInput, leftIcon ? { marginLeft: scale(12) } : null]}>
            {formatEuropeanDate(value)}
          </Text>
        </View>
        <Feather name="calendar" size={moderateScale(18)} color="#111827" />
      </TouchableOpacity>

      {showPicker && (
        <View style={Platform.OS === 'ios' ? styles.iosPickerWrapper : undefined}>
          <DateTimePicker
            value={value}
            mode="date"
            display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
            onChange={handleDateChange}
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity 
              style={styles.iosPickerDoneButton}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.iosPickerDoneText}>{t('done')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(8),
  },
  textInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(12),
    height: verticalScale(50),
    paddingHorizontal: scale(16),
    backgroundColor: '#FFFFFF',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textInput: {
    fontSize: moderateScale(16, 0.3),
    color: '#111827',
    fontWeight: '600',
  },
  iosPickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: verticalScale(8),
    overflow: 'hidden',
  },
  iosPickerDoneButton: {
    backgroundColor: '#FA8C4C',
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosPickerDoneText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15, 0.3),
    fontWeight: '600',
  },
});
