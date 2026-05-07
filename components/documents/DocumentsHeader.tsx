import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useTranslation } from "../../utils/i18n";

interface DocumentsHeaderProps {
  searchQuery: string;
  dateLabel: string;
  supplierLabel: string;
  statusLabel: string;
  statusDefaultLabel: string;
  onSearchChange: (value: string) => void;
  onDatePress: () => void;
  selectedDate: Date;
  showDatePicker: boolean;
  onDateChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
  onDatePickerDone: () => void;
  onSupplierPress: () => void;
  onStatusPress: () => void;
  onUploadPress: () => void;
}

export default function DocumentsHeader({
  searchQuery,
  dateLabel,
  supplierLabel,
  statusLabel,
  statusDefaultLabel,
  onSearchChange,
  onDatePress,
  selectedDate,
  showDatePicker,
  onDateChange,
  onDatePickerDone,
  onSupplierPress,
  onStatusPress,
  onUploadPress,
}: DocumentsHeaderProps) {
  const { t } = useTranslation();
  const statusActive = statusLabel !== statusDefaultLabel;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={moderateScale(16)} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("documents_search_placeholder", { defaultValue: "Search invoices, suppliers..." })}
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
          <Text style={styles.uploadBtnText}>{t("upload_invoice")}</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker ? (
        <View style={Platform.OS === "ios" ? styles.iosPickerWrapper : undefined}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "android" ? "calendar" : "spinner"}
            onChange={onDateChange}
          />
          {Platform.OS === "ios" ? (
            <TouchableOpacity style={styles.iosPickerDoneButton} onPress={onDatePickerDone}>
              <Text style={styles.iosPickerDoneText}>{t("done")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
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
  iosPickerWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: verticalScale(10),
    overflow: "hidden",
  },
  iosPickerDoneButton: {
    backgroundColor: "#FA8C4C",
    paddingVertical: verticalScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  iosPickerDoneText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15, 0.3),
    fontWeight: "600",
  },
});
