import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { CpuChipIcon, ArrowRightIcon } from 'react-native-heroicons/outline';

import { useRouter } from 'expo-router';

export default function AIInsightBox() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CpuChipIcon size={moderateScale(14)} color="#FA8C4C" style={styles.icon} />
        <Text style={styles.headerText}>RISTO AI INSIGHT</Text>
      </View>
      
      <Text style={styles.insightText}>
        Food cost increased by 12% this week compared to the previous period.
      </Text>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => router.push("/(tabs)/home/view-insight")}
      >
        <Text style={styles.actionText}>View Insight</Text>
        <ArrowRightIcon size={moderateScale(14)} color="#FFFFFF" style={styles.arrow} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#352109', // Dark brown to mimic gradient from mockup
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: verticalScale(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  icon: {
    marginRight: scale(6),
  },
  headerText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '700',
    color: '#D1D5DB', // Light gray
    letterSpacing: 0.5,
  },
  insightText: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: moderateScale(22, 0.3),
    marginBottom: verticalScale(20),
    width: '90%', // Limit width so it wraps similar to design
  },
  actionButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FA8C4C',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
  },
  actionText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arrow: {
    marginLeft: scale(6),
  },
});
