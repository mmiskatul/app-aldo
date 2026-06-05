import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useTranslation } from '../../utils/i18n';

export default function ChatHeader() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('ai_chat_title')}</Text>
      <TouchableOpacity style={styles.bellButton}>
        <Feather name="bell" size={moderateScale(20)} color="#111827" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(16),
  },
  title: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  bellButton: {
    position: 'absolute',
    right: scale(20),
    bottom: verticalScale(6),
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
