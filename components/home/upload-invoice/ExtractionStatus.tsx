import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ExtractionStatusProps {
  progress: number; // 0 to 100
}

export default function ExtractionStatus({ progress }: ExtractionStatusProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolate = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });
  return (
    <LinearGradient
      colors={['#1F1612', '#C28522']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.extractionCard}
    >
      <View style={styles.extractionHeader}>
        <View style={styles.spinnerPlaceholder}>
          <Feather name="loader" size={moderateScale(14)} color="#FFFFFF" />
        </View>
        <Text style={styles.extractionText}>AI is extracting invoice data...</Text>
      </View>
      <View style={styles.progressBarTrack}>
        <Animated.View style={[styles.progressBarFill, { width: widthInterpolate }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  extractionCard: {
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  extractionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  spinnerPlaceholder: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  extractionText: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  progressBarTrack: {
    height: verticalScale(4),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: scale(2),
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(2),
  },
});
