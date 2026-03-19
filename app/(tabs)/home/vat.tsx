import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Cash01Icon, Invoice03Icon } from "@hugeicons/core-free-icons";
import * as HugeiconsModule from "@hugeicons/react-native";
import Header from '../../../components/ui/Header';
import VatBalance from '../../../components/home/VatBalance'; 

// @ts-ignore
const HugeiconsIcon = HugeiconsModule.HugeiconsIcon || HugeiconsModule.default?.HugeiconsIcon || (HugeiconsModule as any);

export default function VatScreen() {
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({
        tabBarStyle: { display: "none" },
      });
      return () => {
        parent?.setOptions({
          tabBarStyle: {
            display: "flex",
            position: "absolute",
            backgroundColor: "#FFF0E5",
            borderTopLeftRadius: scale(20),
            borderTopRightRadius: scale(20),
            height: verticalScale(60),
            paddingBottom: verticalScale(8),
            paddingTop: verticalScale(8),
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
        });
      };
    }, [navigation])
  );

  return (
    <View style={styles.container}>
      <Header title="VAT" showBack={true} />
      <ScrollView contentContainerStyle={styles.content}>
      {/* VAT Card */}
      <VatBalance />

      <Text style={styles.sectionTitle}>Monthly Breakdown</Text>

      {/* VAT Payable Card */}
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownHeader}>
          <View>
            <Text style={styles.breakdownLabel}>VAT PAYABLE</Text>
            <Text style={styles.breakdownAmount}>€100</Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: '#FFF0E5' }]}>
            <HugeiconsIcon icon={Cash01Icon} size={moderateScale(24)} color="#FA8C4C" />
          </View>
        </View>
        <View style={styles.breakdownFooter}>
          <Feather name="info" size={moderateScale(12)} color="#9CA3AF" />
          <Text style={styles.breakdownFooterText}>Calculated from all automatically fetched invoices</Text>
        </View>
      </View>

      {/* VAT Recoverable Card */}
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownHeader}>
          <View>
            <Text style={styles.breakdownLabel}>VAT RECOVERABLE</Text>
            <Text style={styles.breakdownAmount}>€20</Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: '#E6F4EA' }]}>
            <HugeiconsIcon icon={Invoice03Icon} size={moderateScale(24)} color="#10B981" />
          </View>
        </View>
      </View>
      
      <View style={styles.spacer} />

      {/* Action Buttons */}
      <TouchableOpacity style={styles.fileReturnButton} activeOpacity={0.8}>
        <View>
          <Text style={styles.fileReturnTitle}>File VAT Return</Text>
          <Text style={styles.fileReturnSubtitle}>Deadline: Feb 20, 2026</Text>
        </View>
        <View style={styles.reviewPill}>
          <Text style={styles.reviewPillText}>Review</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.downloadButton} activeOpacity={0.8}>
        <Feather name="download" size={moderateScale(18)} color="#FFFFFF" />
        <Text style={styles.downloadButtonText}>Download VAT Report</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
  },
  sectionTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: verticalScale(4),
  },
  breakdownAmount: {
    fontSize: moderateScale(28, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  iconBox: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(12),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  breakdownFooterText: {
    fontSize: moderateScale(11, 0.3),
    color: '#9CA3AF',
    marginLeft: scale(6),
  },
  spacer: {
    height: verticalScale(16),
  },
  fileReturnButton: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(16),
    padding: scale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  fileReturnTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: verticalScale(4),
  },
  fileReturnSubtitle: {
    fontSize: moderateScale(13, 0.3),
    color: 'rgba(255,255,255,0.8)',
  },
  reviewPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
  },
  reviewPillText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#FA8C4C',
  },
  downloadButton: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(16),
    padding: scale(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: scale(8),
  },
});
