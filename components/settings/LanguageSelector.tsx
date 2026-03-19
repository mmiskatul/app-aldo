import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

export default function LanguageSelector() {
  const [selected, setSelected] = useState<'en' | 'it'>('en');

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.option, selected === 'en' && styles.selectedOption]}
        onPress={() => setSelected('en')}
      >
        <Text style={styles.flag}>🇺🇸</Text>
        <Text style={[styles.label, selected === 'en' && styles.selectedLabel]}>English</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.option, selected === 'it' && styles.selectedOption]}
        onPress={() => setSelected('it')}
      >
        <Text style={styles.flag}>🇮🇹</Text>
        <Text style={[styles.label, selected === 'it' && styles.selectedLabel]}>Italian</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: scale(12),
    padding: scale(6),
    marginTop: verticalScale(20),
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    borderRadius: scale(8),
  },
  selectedOption: {
    backgroundColor: '#FFE4E1', // or #FFF7ED
    backgroundColor: '#FFEDD5',
  },
  flag: {
    fontSize: moderateScale(16),
    marginRight: scale(8),
  },
  label: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedLabel: {
    color: '#FA8C4C',
  },
});
