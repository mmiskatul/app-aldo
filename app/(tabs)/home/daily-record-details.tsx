import { Feather } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Header from "../../../components/ui/Header";

import CoversCard from "../../../components/home/data-management/daily-record-details/CoversCard";
import NetProfitCard from "../../../components/home/data-management/daily-record-details/NetProfitCard";
import RegisterCard from "../../../components/home/data-management/daily-record-details/RegisterCard";
import RevenueBreakdownCard from "../../../components/home/data-management/daily-record-details/RevenueBreakdownCard";

export default function DailyRecordDetailsScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <View style={styles.safeArea}>
      <Header 
        title="Daily Record Details" 
        showBack={true} 
        rightComponent={
          <TouchableOpacity style={styles.editButton}>
            <Feather name="edit-2" size={moderateScale(18)} color="#111827" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.reportHeaderRow}>
          <View>
            <Text style={styles.reportsForLabel}>REPORTS FOR</Text>
            <Text style={styles.reportsForDate}>Feb 05, 2026</Text>
          </View>
          <View style={styles.statusBadge}>
            <Feather name="check-circle" size={moderateScale(12)} color="#047857" style={{ marginRight: scale(4) }} />
            <Text style={styles.statusBadgeText}>CLOSED</Text>
          </View>
        </View>

        <NetProfitCard />
        <RevenueBreakdownCard />
        
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: scale(8) }}>
            <CoversCard />
          </View>
          <View style={{ flex: 1, marginLeft: scale(8) }}>
            <RegisterCard />
          </View>
        </View>

        <TouchableOpacity style={styles.exportButton}>
          <Feather name="download" size={moderateScale(16)} color="#111827" style={styles.exportIcon} />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  editButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(40),
  },
  reportHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(20),
  },
  reportsForLabel: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: verticalScale(4),
  },
  reportsForDate: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5', // Light green
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: scale(16),
  },
  statusBadgeText: {
    color: '#047857', // Dark green text
    fontSize: moderateScale(11, 0.3),
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(16),
    paddingVertical: verticalScale(14),
    marginTop: verticalScale(8),
  },
  exportIcon: {
    marginRight: scale(8),
  },
  exportButtonText: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: '600',
    color: '#111827',
  },
});
