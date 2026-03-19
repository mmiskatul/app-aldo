import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

interface Props {
  selected: 'method1' | 'method2';
  onSelect: (m: 'method1' | 'method2') => void;
}

export default function MethodSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, selected === 'method1' && styles.selectedButton]}
        onPress={() => onSelect('method1')}
      >
        <Text style={[styles.text, selected === 'method1' && styles.selectedText]}>Method 1</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, selected === 'method2' && styles.selectedButton]}
        onPress={() => onSelect('method2')}
      >
        <Text style={[styles.text, selected === 'method2' && styles.selectedText]}>Method 2</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    padding: scale(4),
    marginBottom: verticalScale(24),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    borderRadius: scale(8),
  },
  selectedButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedText: {
    color: '#FA8C4C',
  },
});
