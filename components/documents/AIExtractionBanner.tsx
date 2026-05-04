import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { LinearGradient } from 'expo-linear-gradient';
import { MagicWand01Icon } from "@hugeicons/core-free-icons";
import * as HugeiconsModule from "@hugeicons/react-native";

// @ts-ignore
const HugeiconsIcon = HugeiconsModule.HugeiconsIcon || HugeiconsModule.default?.HugeiconsIcon || (HugeiconsModule as any);

interface AIExtractionBannerProps {
  title?: string;
  subtitle?: string;
}

export default function AIExtractionBanner({
  title = "AI Data Extraction Active",
  subtitle = "Risto AI automatically extracts supplier, date, line items, quantities, and unit prices from your uploads.",
}: AIExtractionBannerProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F1612', '#C28522']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.banner}
      >
        <View style={styles.iconBox}>
          <HugeiconsIcon icon={MagicWand01Icon} size={moderateScale(20)} color="#FA8C4C" />
        </View>
        <View style={styles.textContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(10),
    marginBottom: verticalScale(17),
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scale(7),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(17),
    minHeight: verticalScale(86),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 5,
  },
  iconBox: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: scale(7),
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(11),
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '800',
    color: '#FA8C4C',
    marginBottom: verticalScale(5),
  },
  subtitle: {
    fontSize: moderateScale(9, 0.3),
    color: 'rgba(255,255,255,0.85)',
    lineHeight: moderateScale(13, 0.3),
  },
});
