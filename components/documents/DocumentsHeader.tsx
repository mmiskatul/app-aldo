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
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(18),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: scale(12),
    paddingHorizontal: scale(14),
    height: verticalScale(44),
    marginBottom: verticalScale(14),
  },
  searchIcon: {
    marginRight: scale(10),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(13, 0.3),
    color: "#111827",
    fontWeight: "500",
  },
  controlsRow: {
    gap: verticalScale(12),
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
    paddingHorizontal: scale(13),
    paddingVertical: verticalScale(7),
    borderRadius: scale(18),
    marginRight: scale(10),
    maxWidth: scale(130),
  },
  filterChipActive: {
    backgroundColor: "#FFF4ED",
    borderColor: "#FFDDC2",
  },
  filterText: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginRight: scale(6),
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
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(9),
    borderRadius: scale(8),
  },
  uploadIcon: {
    marginRight: scale(6),
  },
  uploadBtnText: {
    color: "#FFFFFF",
    fontSize: moderateScale(11, 0.3),
    fontWeight: "800",
  },
});
