import React from 'react';
import { View, Text, StyleSheet, TextInput, TextInputProps } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface FormInputProps extends TextInputProps {
  label: string;
}

export default function FormInput({ label, ...props }: FormInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput 
          style={styles.input} 
          placeholderTextColor="#9CA3AF"
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#374151',
    marginBottom: verticalScale(8),
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(12),
    height: verticalScale(50),
    justifyContent: 'center',
    paddingHorizontal: scale(16),
  },
  input: {
    fontSize: moderateScale(15, 0.3),
    color: '#111827',
    fontWeight: '500',
  },
});
