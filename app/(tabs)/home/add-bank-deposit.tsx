import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import apiClient from "../../../api/apiClient";
import DatePicker from "../../../components/ui/DatePicker";
import Header from "../../../components/ui/Header";
import { showErrorMessage, showSuccessMessage } from "../../../utils/feedback";
import { useTranslation } from "../../../utils/i18n";

interface BankAccount {
  id?: string;
  bank_account: string;
  deposited_amount?: number;
  created_at?: string;
}

export default function AddBankDepositScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedAccount, setSelectedAccount] = useState("");

  const [isSavingDeposit, setIsSavingDeposit] = useState(false);

  const handleSaveDeposit = async () => {
    const trimmedAccount = selectedAccount.trim();
    const parsedAmount = parseFloat(amount.trim().replace(/,/g, ".")) || 0;

    if (parsedAmount <= 0 || !trimmedAccount) {
      showErrorMessage(
        t("valid_amount_bank_account"),
        t("missing_fields")
      );
      return;
    }

    setIsSavingDeposit(true);
    try {
      const depositDateString = date.toISOString().split("T")[0];

      const payload = {
        deposit_date: depositDateString,
        amount: parsedAmount,
        type: "bank_deposit",
        bank_account: trimmedAccount,
        notes: notes.trim(),
      };

      await apiClient.post("/api/v1/restaurant/cash/deposits", payload);

      showSuccessMessage("Bank deposit saved successfully.");
      router.back();
    } catch (error) {
      console.error("Error saving deposit:", error);
      showErrorMessage("Could not save deposit. Please try again.");
    } finally {
      setIsSavingDeposit(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header title="Add Bank Deposit" showBack={true} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
              <Text style={styles.bannerSubtitle}>
                Record cash and check drops for today.
              </Text>
            </View>
          </View>

          {/* Date */}
          <DatePicker
            label="Deposit Date"
            value={date}
            onChange={setDate}
            leftIcon={
              <Feather
                name="calendar"
                size={moderateScale(18)}
                color="#6B7280"
              />
            }
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
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Bank Account */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bank Account</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter bank account name"
                placeholderTextColor="#9CA3AF"
                value={selectedAccount}
                onChangeText={setSelectedAccount}
              />
            </View>
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
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </ScrollView>

        <View style={styles.bottomFooter}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!(parseFloat(amount.trim().replace(/,/g, ".")) > 0) || !selectedAccount.trim()) && { opacity: 0.7 },
            ]}
            onPress={handleSaveDeposit}
            disabled={isSavingDeposit || !(parseFloat(amount.trim().replace(/,/g, ".")) > 0) || !selectedAccount.trim()}
          >
            {isSavingDeposit ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather
                  name="save"
                  size={moderateScale(18)}
                  color="#FFFFFF"
                  style={styles.saveIcon}
                />
                <Text style={styles.saveButtonText}>Save Deposit</Text>
              </>
            )}
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
    flexDirection: "row",
    backgroundColor: "#FFF8F3", // Light orange tint
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(24),
    borderWidth: 1,
    borderColor: "#FCE7D6",
    alignItems: "center",
  },
  bannerIconContainer: {
    backgroundColor: "#FA8C4C",
    borderRadius: scale(12),
    width: moderateScale(48),
    height: moderateScale(48),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(16),
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: "800",
    color: "#FA8C4C",
    letterSpacing: 0.5,
    marginBottom: verticalScale(4),
  },
  bannerSubtitle: {
    fontSize: moderateScale(13, 0.3),
    color: "#4B5563",
    lineHeight: moderateScale(18),
  },
  inputGroup: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#374151",
    marginBottom: verticalScale(8),
  },
  dropdownInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: scale(12),
    height: verticalScale(50),
    paddingHorizontal: scale(16),
    backgroundColor: "#FFFFFF",
  },
  dropdownPlaceholder: {
    fontSize: moderateScale(15, 0.3),
    color: "#111827",
  },
  textInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: scale(12),
    height: verticalScale(50),
    paddingHorizontal: scale(16),
    backgroundColor: "#FFFFFF",
  },
  prefix: {
    fontSize: moderateScale(16, 0.3),
    color: "#111827",
    fontWeight: "700",
  },
  textInput: {
    flex: 1,
    fontSize: moderateScale(16, 0.3),
    color: "#111827",
    fontWeight: "600",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: scale(12),
    height: verticalScale(120),
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    backgroundColor: "#FFFFFF",
    fontSize: moderateScale(15, 0.3),
    color: "#111827",
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
  dropdownText: {
    fontSize: moderateScale(15, 0.3),
    color: "#111827",
    fontWeight: "500",
  },
  newCategoryPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FCE7D6",
    backgroundColor: "#FFF8F3",
    borderRadius: scale(20),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    marginTop: verticalScale(8),
  },
  newCategoryText: {
    color: "#FA8C4C",
    fontSize: moderateScale(12, 0.3),
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  categoryListContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    maxHeight: "80%",
    paddingBottom: verticalScale(30),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  categoryItemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  categoryItemMain: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(16),
    paddingLeft: scale(20),
    paddingRight: scale(10),
  },
  actionButton: {
    padding: scale(10),
  },
  deleteCategoryButton: {
    padding: scale(16),
  },
  categoryItemText: {
    fontSize: moderateScale(16, 0.3),
    color: "#4B5563",
  },
  selectedCategoryItemText: {
    color: "#FA8C4C",
    fontWeight: "600",
  },
  newCategoryContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(16),
    margin: scale(20),
    padding: scale(24),
    marginBottom: "50%",
  },
  modalInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    fontSize: moderateScale(16, 0.3),
    color: "#111827",
    paddingVertical: verticalScale(8),
    marginVertical: verticalScale(20),
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    marginRight: scale(8),
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: moderateScale(15, 0.3),
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#FA8C4C",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15, 0.3),
    fontWeight: "600",
  },
  depositedAmountText: {
    fontSize: moderateScale(14, 0.3),
    color: "#10B981",
    fontWeight: "600",
  },
});
