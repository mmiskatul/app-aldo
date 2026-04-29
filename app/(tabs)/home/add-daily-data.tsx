import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Header from "../../../components/ui/Header";
import apiClient from "../../../api/apiClient";

import Method1Form, { Method1Data } from "../../../components/home/add-daily-data/Method1Form";
import Method2Form, { Method2Data } from "../../../components/home/add-daily-data/Method2Form";
import MethodSelector from "../../../components/home/add-daily-data/MethodSelector";
import { showErrorMessage, showSuccessMessage } from "../../../utils/feedback";
import { useAppStore } from "../../../store/useAppStore";

const parseNumberInput = (value: string) => {
  const normalized = value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseIntegerInput = (value: string) => {
  const normalized = value.replace(/[^0-9]/g, "");
  const parsed = parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getLocalBusinessDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AddDailyDataScreen() {
  const router = useRouter();
  const clearHomeScreenCache = useAppStore((state) => state.clearHomeScreenCache);
  const clearDailyDataScreenCache = useAppStore((state) => state.clearDailyDataScreenCache);
  const setCashOverviewData = useAppStore((state) => state.setCashOverviewData);
  const [selectedMethod, setSelectedMethod] = useState<"method1" | "method2">("method1");
  const [isSaving, setIsSaving] = useState(false);

  const [method1Data, setMethod1Data] = useState<Method1Data>({
    pos_payments: "",
    cash_withdrawals: "",
    cash_in: "",
    cash_out: "",
    expenses_in_cash: "",
    notes: "",
  });

  const [method2Data, setMethod2Data] = useState<Method2Data>({
    pos_payments: "",
    cash_payments: "",
    bank_transfer_payments: "",
    lunch_covers: "",
    dinner_covers: "",
    opening_cash: "",
    closing_cash: "",
  });

  const handleMethod1Change = (key: keyof Method1Data, val: string) => {
    setMethod1Data((prev) => ({ ...prev, [key]: val }));
  };

  const handleMethod2Change = (key: keyof Method2Data, val: string) => {
    setMethod2Data((prev) => ({ ...prev, [key]: val }));
  };

  const currentBusinessDate = getLocalBusinessDate();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        method: selectedMethod === "method1" ? "method_1" : "method_2",
        ...(selectedMethod === "method1"
          ? {
              method_one: {
                business_date: currentBusinessDate,
                pos_payments: parseNumberInput(method1Data.pos_payments),
                cash_withdrawals: parseNumberInput(method1Data.cash_withdrawals),
                cash_in: parseNumberInput(method1Data.cash_in),
                cash_out: parseNumberInput(method1Data.cash_out),
                expenses_in_cash: parseNumberInput(method1Data.expenses_in_cash),
                notes: method1Data.notes,
              },
            }
          : {
              method_two: {
                business_date: currentBusinessDate,
                pos_payments: parseNumberInput(method2Data.pos_payments),
                cash_payments: parseNumberInput(method2Data.cash_payments),
                bank_transfer_payments: parseNumberInput(method2Data.bank_transfer_payments),
                lunch_covers: parseIntegerInput(method2Data.lunch_covers),
                dinner_covers: parseIntegerInput(method2Data.dinner_covers),
                opening_cash: parseNumberInput(method2Data.opening_cash),
                closing_cash: parseNumberInput(method2Data.closing_cash),
              },
            }),
      };

      const res = await apiClient.post("/api/v1/restaurant/manual-entry", payload);
      console.log("Manual Entry Response:", res.data);
      clearHomeScreenCache();
      clearDailyDataScreenCache();
      setCashOverviewData(null);
      showSuccessMessage("Daily data has been saved successfully.");
      router.back();
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.detail ||
        error?.message;
      console.error(
        "Error saving manual entry:",
        error?.response?.data || error?.message || error,
      );
      showErrorMessage(apiMessage || "Could not save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header title="Add Daily Data" showBack={true} showBell={true} />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.pageTitle}>Add Daily Business Data</Text>
          <Text style={styles.pageSubtitle}>
            Enter today&apos;s revenue and expenses to track your restaurant performance.
          </Text>

          <MethodSelector selected={selectedMethod} onSelect={setSelectedMethod} />

          {selectedMethod === "method1" ? (
            <Method1Form data={method1Data} onChange={handleMethod1Change} />
          ) : (
            <Method2Form data={method2Data} onChange={handleMethod2Change} />
          )}
        </ScrollView>

        <View style={styles.bottomFooter}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="save" size={moderateScale(18)} color="#FFFFFF" style={styles.saveIcon} />
                <Text style={styles.saveButtonText}>Save Daily Data</Text>
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
    fontSize: moderateScale(14, 0.3),
    color: "#6B7280",
    marginBottom: verticalScale(24),
    lineHeight: moderateScale(20),
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
