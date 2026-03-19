import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  alignTitle?: 'left' | 'center';
}

/**
 * Common Header component for the application.
 * Supports back button, centered or left-aligned titles, subtitles, and custom right components.
 */
export default function Header({ 
  title, 
  subtitle, 
  showBackButton = true, 
  onBackPress, 
  rightComponent,
  alignTitle = 'center'
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.sideContainer}>
          {showBackButton && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ChevronLeftIcon size={moderateScale(24)} color="#111827" />
            </TouchableOpacity>
          )}
        </View>

        {alignTitle === 'center' && (
          <View style={styles.centerContainer}>
            <Text style={styles.centerTitle}>{title}</Text>
          </View>
        )}

        <View style={[styles.sideContainer, styles.rightContainer]}>
          {rightComponent}
        </View>
      </View>

      {alignTitle === 'left' && (
        <View style={styles.leftTitleContainer}>
          <Text style={styles.leftTitle}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: verticalScale(12),
    backgroundColor: 'transparent',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: verticalScale(48),
  },
  sideContainer: {
    width: scale(48),
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -scale(4),
  },
  centerTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
  },
  leftTitleContainer: {
    marginTop: verticalScale(12),
  },
  leftTitle: {
    fontSize: moderateScale(22, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: moderateScale(14, 0.3),
    color: '#6B7280',
    lineHeight: moderateScale(20, 0.3),
  },
});
