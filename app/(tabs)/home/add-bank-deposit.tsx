import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BuildingLibraryIcon } from "react-native-heroicons/outline";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Header from "../../../components/ui/Header";
import DatePicker from "../../../components/ui/DatePicker";

export default function AddBankDepositScreen() {
  const router = useRouter();
  const [date, setDate] = useState(new Date("2023-10-27T00:00:00"));

  return (
    <View style={styles.safeArea}>
      <Header title="Add Bank Deposit" showBack={true} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Daily Reconciliation Banner */}
          <View style={styles.bannerContainer}>
            <View style={styles.bannerIconContainer}>
              <BuildingLibraryIcon size={moderateScale(24)} color="#FFFFFF" />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>DAILY RECONCILIATION</Text>
              <Text style={styles.bannerSubtitle}>Record cash and check drops for today.</Text>
            </View>
          </View>

          {/* Date */}
          <DatePicker
            label="Deposit Date"
            value={date}
            onChange={setDate}
            leftIcon={<Feather name="calendar" size={moderateScale(18)} color="#6B7280" />}
          />

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount Deposited</Text>
            <View style={styles.textInputContainer}>
              <Text style={styles.prefix}>€ </Text>
              <TextInput
                style={styles.textInput}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Deposit Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deposit Type</Text>
            <TouchableOpacity style={styles.dropdownInput}>
              <Text style={styles.dropdownPlaceholder}>Cash & Coins</Text>
              <Feather name="chevron-down" size={moderateScale(20)} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="e.g. End of shift deposit for Friday night..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.bottomFooter}>
          <TouchableOpacity style={styles.saveButton}>
            <Feather name="save" size={moderateScale(18)} color="#FFFFFF" style={styles.saveIcon} />
            <Text style={styles.saveButtonText}>Save Expense</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(100),
  },
  bannerContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF8F3', // Light orange tint
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(24),
    borderWidth: 1,
    borderColor: '#FCE7D6',
    alignItems: 'center',
  },
  bannerIconContainer: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(12),
    width: moderateScale(48),
    height: moderateScale(48),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '800',
    color: '#FA8C4C',
    letterSpacing: 0.5,
    marginBottom: verticalScale(4),
  },
  bannerSubtitle: {
    fontSize: moderateScale(13, 0.3),
    color: '#4B5563',
    lineHeight: moderateScale(18),
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#374151',
    marginBottom: verticalScale(8),
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(12),
    height: verticalScale(50),
    paddingHorizontal: scale(16),
    backgroundColor: '#FFFFFF',
  },
  dropdownPlaceholder: {
    fontSize: moderateScale(15, 0.3),
    color: '#111827',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(12),
    height: verticalScale(50),
    paddingHorizontal: scale(16),
    backgroundColor: '#FFFFFF',
  },
  prefix: {
    fontSize: moderateScale(16, 0.3),
    color: '#111827',
    fontWeight: '700',
  },
  textInput: {
    flex: 1,
    fontSize: moderateScale(16, 0.3),
    color: '#111827',
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: scale(12),
    height: verticalScale(120),
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    backgroundColor: '#FFFFFF',
    fontSize: moderateScale(15, 0.3),
    color: '#111827',
  },
  bottomFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#FA8C4C",
    borderRadius: scale(12),
    paddingVertical: verticalScale(14),
    justifyContent: "center",
    alignItems: "center",
  },
  saveIcon: {
    marginRight: scale(8),
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
  },
});
