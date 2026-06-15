import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "../../../components/ui/Header";
import apiClient from "../../../api/apiClient";

import Method1Form, { Method1Data } from "../../../components/home/add-daily-data/Method1Form";
import Method2Form, { Method2Data } from "../../../components/home/add-daily-data/Method2Form";
import MethodSelector from "../../../components/home/add-daily-data/MethodSelector";
import RevenueInputMethodsModal from "../../../components/home/add-daily-data/RevenueInputMethodsModal";
import { showErrorMessage, showSuccessMessage } from "../../../utils/feedback";
import { useAppStore } from "../../../store/useAppStore";
import type { DailyDataListCacheItem } from "../../../store/useAppStore";
import { getApiErrorMessage } from "../../../utils/api";
import { useTranslation } from "../../../utils/i18n";

interface DailyDataEditResponse {
  id: string;
  business_date: string;
  method: "method_1" | "method_2";
  pos_payments: number;
  cash_withdrawals: number;
  cash_in: number;
  cash_out: number;
  cash_payments: number;
  bank_transfer_payments: number;
  expenses_in_cash: number;
  opening_cash: number;
  closing_cash: number;
  notes?: string;
}

const parseNumberInput = (value: string) => {
  const normalized = value.trim().replace(/,/g, ".");
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isValidNumberInput = (value: string) => {
  const normalized = value.trim().replace(/,/g, ".");
  if (!normalized) {
    return true;
  }
  return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized);
};

const hasTextValue = (value: string) => value.trim().length > 0;

const getLocalBusinessDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AddDailyDataScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId?: string | string[] }>();
  const insets = useSafeAreaInsets();
  const footerBottomInset = Math.max(insets.bottom, verticalScale(20));
  const footerReservedSpace = verticalScale(118) + footerBottomInset;
  const clearHomeScreenCache = useAppStore((state) => state.clearHomeScreenCache);
  const clearDailyDataScreenCache = useAppStore((state) => state.clearDailyDataScreenCache);
  const bumpInventoryRefreshToken = useAppStore((state) => state.bumpInventoryRefreshToken);
  const setCashOverviewData = useAppStore((state) => state.setCashOverviewData);
  const cachedDateItems = useAppStore((state) => state.dailyDataScreenCache.itemsBySegment.date);
  const [selectedMethod, setSelectedMethod] = useState<"method1" | "method2">("method1");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [isMethodsModalVisible, setIsMethodsModalVisible] = useState(false);
  const appliedEditRecordRef = useRef<string | null>(null);


  const [method1Data, setMethod1Data] = useState<Method1Data>({
    pos_payments: "",
    cash_withdrawals: "",
    cash_in: "",
    cash_out: "",
    expenses_in_cash: "",
    opening_cash: "",
    closing_cash: "",
    notes: "",
  });

  const [method2Data, setMethod2Data] = useState<Method2Data>({
    pos_payments: "",
    cash_payments: "",
    bank_transfer_payments: "",
    expenses_in_cash: "",
    opening_cash: "",
    closing_cash: "",
  });

  const handleMethod1Change = (key: keyof Method1Data, val: string) => {
    setMethod1Data((prev) => ({ ...prev, [key]: val }));
  };

  const handleMethod2Change = (key: keyof Method2Data, val: string) => {
    setMethod2Data((prev) => ({ ...prev, [key]: val }));
  };

  const editingRecordId = typeof recordId === "string" && recordId.length > 0 ? recordId : null;
  const [businessDate, setBusinessDate] = useState(getLocalBusinessDate());
  const currentBusinessDate = businessDate;
  const fallbackRoute = "/(tabs)/home/data-management" as const;

  const formatNumberForInput = (value: number) => {
    const numericValue = Number(value || 0);
    return numericValue === 0 ? "" : String(numericValue);
  };

  const applyRecordToForm = (record: DailyDataEditResponse | DailyDataListCacheItem) => {
    setBusinessDate(record.business_date || getLocalBusinessDate());
    setSelectedMethod(record.method === "method_2" ? "method2" : "method1");
    setMethod1Data({
      pos_payments: formatNumberForInput(Number(record.pos_payments || 0)),
      cash_withdrawals: formatNumberForInput(Number(record.cash_withdrawals || 0)),
      cash_in: formatNumberForInput(Number(record.cash_in || 0)),
      cash_out: formatNumberForInput(Number(record.cash_out || 0)),
      expenses_in_cash: formatNumberForInput(Number(record.expenses_in_cash || 0)),
      opening_cash: formatNumberForInput(Number(record.opening_cash || 0)),
      closing_cash: formatNumberForInput(Number(record.closing_cash || 0)),
      notes: record.notes || "",
    });
    setMethod2Data({
      pos_payments: formatNumberForInput(Number(record.pos_payments || 0)),
      cash_payments: formatNumberForInput(Number(record.cash_payments || 0)),
      bank_transfer_payments: formatNumberForInput(Number(record.bank_transfer_payments || 0)),
      expenses_in_cash: formatNumberForInput(Number(record.expenses_in_cash || 0)),
      opening_cash: formatNumberForInput(Number(record.opening_cash || 0)),
      closing_cash: formatNumberForInput(Number(record.closing_cash || 0)),
    });

  };

  const cachedEditableRecord = useMemo(
    () =>
      editingRecordId
        ? cachedDateItems?.find(
            (item) =>
              (item.record_id === editingRecordId || item.id === editingRecordId) &&
              typeof item.method === "string" &&
              item.method.length > 0,
          ) || null
        : null,
    [cachedDateItems, editingRecordId],
  );



  useEffect(() => {
    if (!editingRecordId) {
      appliedEditRecordRef.current = null;
      return;
    }

    if (appliedEditRecordRef.current === editingRecordId) {
      return;
    }

    if (!editingRecordId) {
      return;
    }

    if (cachedEditableRecord) {
      applyRecordToForm(cachedEditableRecord);
      appliedEditRecordRef.current = editingRecordId;
      return;
    }

    const fetchRecord = async () => {
      setIsLoadingRecord(true);
      try {
        const response = await apiClient.get<DailyDataEditResponse>(
          `/api/v1/restaurant/daily-data/${encodeURIComponent(editingRecordId)}`,
        );
        applyRecordToForm(response.data);
        appliedEditRecordRef.current = editingRecordId;
      } catch (error: any) {
        console.error("Error loading daily record for edit:", error?.response?.data || error?.message);
        showErrorMessage(t("unable_to_load_daily_record"));
      } finally {
        setIsLoadingRecord(false);
      }
    };

    void fetchRecord();
  }, [cachedEditableRecord, editingRecordId, t]);



  const validateNumberFields = (
    fields: { label: string; value: string }[],
  ) => {
    const invalidField = fields.find((field) => !isValidNumberInput(field.value));

    if (!invalidField) {
      return null;
    }

    return `${invalidField.label} must be a valid non-negative number.`;
  };

  const validateCurrentMethod = () => {
    if (selectedMethod === "method1") {
      return validateNumberFields([
        { label: "POS Payments", value: method1Data.pos_payments },
        { label: "Cash Withdrawals", value: method1Data.cash_withdrawals },
        { label: "Cash expenses paid from the cash drawer", value: method1Data.expenses_in_cash },
        { label: "Initial Cash", value: method1Data.opening_cash },
        { label: "Final Cash", value: method1Data.closing_cash },
      ]);
    }

    return validateNumberFields([
      { label: "POS Payments", value: method2Data.pos_payments },
      { label: "Cash Payments", value: method2Data.cash_payments },
      { label: "Invoices Paid by Bank Transfer", value: method2Data.bank_transfer_payments },
      { label: "Cash expenses paid from the cash drawer", value: method2Data.expenses_in_cash },
      { label: "Opening Cash", value: method2Data.opening_cash },
      { label: "Closing Cash", value: method2Data.closing_cash },
    ]);
  };

  const hasAtLeastOneFilledField = () => {
    const selectedFields =
      selectedMethod === "method1"
        ? [
            method1Data.pos_payments,
            method1Data.cash_withdrawals,
            method1Data.expenses_in_cash,
            method1Data.opening_cash,
            method1Data.closing_cash,
            method1Data.notes,
          ]
        : [
            method2Data.pos_payments,
            method2Data.cash_payments,
            method2Data.bank_transfer_payments,
            method2Data.expenses_in_cash,
            method2Data.opening_cash,
            method2Data.closing_cash,
          ];

    return selectedFields.some(hasTextValue);
  };

  const handleSave = async () => {
    const validationMessage = validateCurrentMethod();
    if (validationMessage) {
      showErrorMessage(validationMessage);
      return;
    }

    if (!hasAtLeastOneFilledField()) {
      showErrorMessage(t("daily_data_requires_one_field"), t("missing_fields"));
      return;
    }



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
                cash_in: 0,
                cash_out: 0,
                expenses_in_cash: parseNumberInput(method1Data.expenses_in_cash),
                opening_cash: parseNumberInput(method1Data.opening_cash),
                closing_cash: parseNumberInput(method1Data.closing_cash),
                notes: method1Data.notes,
              },
            }
          : {
              method_two: {
                business_date: currentBusinessDate,
                pos_payments: parseNumberInput(method2Data.pos_payments),
                cash_payments: parseNumberInput(method2Data.cash_payments),
                bank_transfer_payments: parseNumberInput(method2Data.bank_transfer_payments),
                expenses_in_cash: parseNumberInput(method2Data.expenses_in_cash),
                opening_cash: parseNumberInput(method2Data.opening_cash),
                closing_cash: parseNumberInput(method2Data.closing_cash),
              },
            }),
      };

      const res = editingRecordId
        ? await apiClient.patch(`/api/v1/restaurant/manual-entry/${encodeURIComponent(editingRecordId)}`, payload)
        : await apiClient.post("/api/v1/restaurant/manual-entry", payload);
      console.log("Manual Entry Response:", res.data);
      clearHomeScreenCache();
      clearDailyDataScreenCache();
      bumpInventoryRefreshToken();
      setCashOverviewData(null);
      showSuccessMessage(t(editingRecordId ? "daily_data_updated_successfully" : "daily_data_saved_successfully"));
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(fallbackRoute);
      }
    } catch (error: any) {
      console.error(
        "Error saving manual entry:",
        error?.response?.data || error?.message || error,
      );
      showErrorMessage(getApiErrorMessage(error, "Could not save. Please try again."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header
        title={t(editingRecordId ? "edit_daily_data" : "add_daily_data")}
        showBack={true}
        showBell={true}
        fallbackHref={fallbackRoute}
      />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? verticalScale(12) : 0}
      >
        {isLoadingRecord ? (
          <View style={styles.loadingRecordContainer}>
            <ActivityIndicator size="small" color="#FA8C4C" />
            <Text style={styles.loadingRecordText}>{t("loading_collection")}</Text>
          </View>
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: footerReservedSpace },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.pageTitle}>
                {t(editingRecordId ? "edit_daily_business_data" : "add_daily_business_data")}
              </Text>
              <Text style={styles.pageSubtitle}>
                {t(editingRecordId ? "edit_daily_business_data_subtitle" : "add_daily_business_data_subtitle")}
              </Text>

              <MethodSelector selected={selectedMethod} onSelect={setSelectedMethod} />

              {selectedMethod === "method1" ? (
                <Method1Form
                  data={method1Data}
                  onChange={handleMethod1Change}
                  onInfoPress={() => setIsMethodsModalVisible(true)}
                />
              ) : (
                <Method2Form
                  data={method2Data}
                  onChange={handleMethod2Change}
                  onInfoPress={() => setIsMethodsModalVisible(true)}
                />
              )}


            </ScrollView>

            <View style={[styles.bottomFooter, { paddingBottom: footerBottomInset }]}>
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Confirm daily data"
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check-circle" size={moderateScale(20)} color="#FFFFFF" style={styles.saveIcon} />
                    <Text style={styles.saveButtonText}>
                      {editingRecordId ? t("save_changes") : t("confirm_daily_data")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
      <RevenueInputMethodsModal
        visible={isMethodsModalVisible}
        onClose={() => setIsMethodsModalVisible(false)}
      />
      {isSaving ? (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : null}
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
    paddingBottom: verticalScale(28),
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
  loadingRecordContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: verticalScale(10),
    paddingHorizontal: scale(24),
  },
  loadingRecordText: {
    fontSize: moderateScale(13, 0.3),
    color: "#6B7280",
  },
  inventoryUsageCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(16),
    padding: scale(16),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(22),
    backgroundColor: "#FFFFFF",
  },
  inventoryUsageTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "800",
    color: "#111827",
  },
  inventoryUsageSubtitle: {
    marginTop: verticalScale(4),
    marginBottom: verticalScale(14),
    fontSize: moderateScale(12, 0.3),
    color: "#6B7280",
    lineHeight: moderateScale(17),
  },
  usageRowCard: {
    borderRadius: scale(12),
    backgroundColor: "#F9FAFB",
    padding: scale(12),
    marginBottom: verticalScale(12),
  },
  usageRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  usageLabel: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: verticalScale(6),
  },
  usageInput: {
    minHeight: verticalScale(44),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(10),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(12),
    fontSize: moderateScale(14, 0.3),
    fontWeight: "600",
    color: "#111827",
  },
  suggestionBox: {
    marginTop: verticalScale(6),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(10),
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  suggestionItem: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(9),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  suggestionName: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  suggestionMeta: {
    marginTop: verticalScale(2),
    fontSize: moderateScale(11, 0.3),
    color: "#6B7280",
  },
  quantityRow: {
    flexDirection: "row",
    gap: scale(10),
    marginTop: verticalScale(12),
  },
  quantityInputWrap: {
    flex: 1,
  },
  availableBox: {
    flex: 1,
    borderRadius: scale(10),
    backgroundColor: "#FFF4EE",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(9),
    justifyContent: "center",
  },
  availableLabel: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: "700",
    color: "#9CA3AF",
  },
  availableValue: {
    marginTop: verticalScale(3),
    fontSize: moderateScale(13, 0.3),
    fontWeight: "800",
    color: "#111827",
  },
  remainingText: {
    marginTop: verticalScale(3),
    fontSize: moderateScale(10, 0.3),
    fontWeight: "600",
    color: "#6B7280",
  },
  addUsageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FCE7D6",
    borderRadius: scale(12),
    minHeight: verticalScale(44),
    backgroundColor: "#FFF8F3",
  },
  addUsageText: {
    marginLeft: scale(6),
    fontSize: moderateScale(13, 0.3),
    fontWeight: "800",
    color: "#FA8C4C",
  },
  iconHitSlop: {
    top: 8,
    right: 8,
    bottom: 8,
    left: 8,
  },
  bottomFooter: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(14),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#FA8C4C",
    borderRadius: scale(14),
    minHeight: verticalScale(58),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FA8C4C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.75,
  },
  saveIcon: {
    marginRight: scale(8),
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: "rgba(0, 0, 0, 0.58)",
    justifyContent: "center",
    alignItems: "center",
  },
});
