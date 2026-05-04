import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";

interface DocumentsHeaderProps {
  searchQuery: string;
  dateLabel: string;
  supplierLabel: string;
  statusLabel: string;
  onSearchChange: (value: string) => void;
  onDatePress: () => void;
  onSupplierPress: () => void;
  onStatusPress: () => void;
  onUploadPress: () => void;
}

export default function DocumentsHeader({
  searchQuery,
  dateLabel,
  supplierLabel,
  statusLabel,
  onSearchChange,
  onDatePress,
  onSupplierPress,
  onStatusPress,
  onUploadPress,
}: DocumentsHeaderProps) {
  const statusActive = statusLabel !== "Status";

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={moderateScale(16)} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search invoices, suppliers..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <View style={styles.controlsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          <TouchableOpacity style={styles.filterChip} onPress={onDatePress} activeOpacity={0.75}>
            <Text style={styles.filterText}>{dateLabel}</Text>
            <Feather name="chevron-down" size={moderateScale(13)} color="#4B5563" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterChip} onPress={onSupplierPress} activeOpacity={0.75}>
            <Text style={styles.filterText} numberOfLines={1}>{supplierLabel}</Text>
            <Feather name="chevron-down" size={moderateScale(13)} color="#4B5563" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, statusActive && styles.filterChipActive]}
            onPress={onStatusPress}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterText, statusActive && styles.filterTextActive]}>
              {statusLabel}
            </Text>
            <Feather name="filter" size={moderateScale(13)} color={statusActive ? "#FA8C4C" : "#4B5563"} />
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={styles.uploadBtn} onPress={onUploadPress} activeOpacity={0.85}>
          <Feather name="upload" size={moderateScale(12)} color="#FFFFFF" style={styles.uploadIcon} />
          <Text style={styles.uploadBtnText}>Upload Invoice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(10),
    marginBottom: verticalScale(16),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: scale(10),
    paddingHorizontal: scale(12),
    height: verticalScale(34),
    marginBottom: verticalScale(13),
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(10, 0.3),
    color: "#111827",
    fontWeight: "500",
    paddingVertical: 0,
  },
  controlsRow: {
    gap: verticalScale(10),
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: scale(8),
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: scale(12),
    height: verticalScale(24),
    borderRadius: scale(14),
    marginRight: scale(8),
    maxWidth: scale(120),
  },
  filterChipActive: {
    backgroundColor: "#FFF4ED",
    borderColor: "#FFDDC2",
  },
  filterText: {
    fontSize: moderateScale(9, 0.3),
    fontWeight: "600",
    color: "#111827",
    marginRight: scale(5),
  },
  filterTextActive: {
    color: "#FA8C4C",
  },
  uploadBtn: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FA8C4C",
    paddingHorizontal: scale(12),
    height: verticalScale(31),
    borderRadius: scale(7),
  },
  uploadIcon: {
    marginRight: scale(5),
  },
  uploadBtnText: {
    color: "#FFFFFF",
    fontSize: moderateScale(8, 0.3),
    fontWeight: "800",
  },
});
