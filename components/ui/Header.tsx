import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BellIcon } from "react-native-heroicons/outline";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showBell?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  subtitle?: string;
  titleAlign?: 'left' | 'center';
}

export default function Header({
  title,
  showBack = false,
  showBell = false,
  onBackPress,
  rightComponent,
  subtitle,
  titleAlign = 'center',
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: Math.max(insets.top, verticalScale(16)) }]}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={moderateScale(20)} color="#111827" />
            </TouchableOpacity>
          )}
        </View>

        <View style={[
          styles.titleSection, 
          titleAlign === 'left' && styles.titleSectionLeft,
          showBack && titleAlign === 'left' && { marginLeft: scale(12) }
        ]}>
          <Text style={[
            styles.title, 
            titleAlign === 'left' && styles.titleLeft
          ]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[
              styles.subtitle,
              titleAlign === 'left' && styles.subtitleLeft
            ]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightSection}>
          {rightComponent ? (
            rightComponent
          ) : showBell ? (
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <BellIcon size={moderateScale(20)} color="#111827" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: moderateScale(40) }} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    paddingBottom: verticalScale(12),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    height: verticalScale(48),
  },
  leftSection: {
    width: moderateScale(40),
    alignItems: 'flex-start',
  },
  rightSection: {
    width: moderateScale(40),
    alignItems: 'flex-end',
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSectionLeft: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  titleLeft: {
    fontSize: moderateScale(20, 0.3),
    fontWeight: '800',
  },
  subtitle: {
    fontSize: moderateScale(12, 0.3),
    color: '#6B7280',
    marginTop: verticalScale(2),
  },
  subtitleLeft: {
    fontSize: moderateScale(13, 0.3),
  },
  iconButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#F9FAFB', // Light background as seen in mockups
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  notificationDot: {
    position: 'absolute',
    top: moderateScale(10),
    right: moderateScale(10),
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: '#EF4444',
  },
});
