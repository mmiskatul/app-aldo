import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import DataHistoryList from "../../../components/home/data-management/DataHistoryList";
import DataMetrics from "../../../components/home/data-management/DataMetrics";

export default function DataManagementScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // Hide the tab bar when on this screen
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
    }, [navigation]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={moderateScale(20)} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Management</Text>
        <TouchableOpacity style={styles.bellButton}>
          <Feather name="bell" size={moderateScale(18)} color="#111827" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>Daily Data Management</Text>
        <Text style={styles.pageSubtitle}>
          Track and manage your restaurant performance
        </Text>

        <DataMetrics />
        <DataHistoryList />
      </ScrollView>

      {/* Sticky Add Data Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => router.push('/(tabs)/home/add-daily-data')}
        >
          <Feather
            name="plus"
            size={moderateScale(18)}
            color="#FFFFFF"
            style={{ marginRight: scale(6) }}
          />
          <Text style={styles.fabText}>Add Daily Data</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  bellButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationDot: {
    position: "absolute",
    top: scale(10),
    right: scale(12),
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: "#EF4444",
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
  },
  pageTitle: {
    fontSize: moderateScale(22, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(4),
  },
  pageSubtitle: {
    fontSize: moderateScale(12, 0.3),
    color: "#6B7280",
    marginBottom: verticalScale(24),
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: verticalScale(40),
    right: scale(20),
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FA8C4C",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(14),
    borderRadius: scale(12),
    shadowColor: "#FA8C4C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
