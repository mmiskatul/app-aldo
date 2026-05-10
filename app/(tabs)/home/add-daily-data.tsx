import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

interface InventorySuggestionItem {
  id: string;
  product_name: string;
  stock_quantity: number;
  unit_type: string;
}

interface InventoryUsageItem {
  rowId: string;
  inventoryItemId: string;
  productName: string;
  query: string;
  quantityUsed: string;
  availableQuantity: number;
  unitType: string;
}

interface DailyDataInventoryUsageEntry {
  inventory_item_id: string;
  product_name: string;
  quantity_used: number;
  unit_type: string;
}

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
  lunch_covers: number;
  dinner_covers: number;
  opening_cash: number;
  closing_cash: number;
  notes?: string;
  inventory_usage: DailyDataInventoryUsageEntry[];
}

const parseNumberInput = (value: string) => {
  const normalized = value.trim().replace(/,/g, ".");
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseIntegerInput = (value: string) => {
  const normalized = value.trim();
  const parsed = parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isValidNumberInput = (value: string) => {
  const normalized = value.trim().replace(/,/g, ".");
  if (!normalized) {
    return true;
  }
  return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized);
};

const isValidIntegerInput = (value: string) => {
  const normalized = value.trim();
  if (!normalized) {
    return true;
  }
  return /^\d+$/.test(normalized);
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
  const clearHomeScreenCache = useAppStore((state) => state.clearHomeScreenCache);
  const clearDailyDataScreenCache = useAppStore((state) => state.clearDailyDataScreenCache);
  const bumpInventoryRefreshToken = useAppStore((state) => state.bumpInventoryRefreshToken);
  const setCashOverviewData = useAppStore((state) => state.setCashOverviewData);
  const cachedDateItems = useAppStore((state) => state.dailyDataScreenCache.itemsBySegment.date);
  const [selectedMethod, setSelectedMethod] = useState<"method1" | "method2">("method1");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [isMethodsModalVisible, setIsMethodsModalVisible] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventorySuggestionItem[]>([]);
  const [inventoryUsage, setInventoryUsage] = useState<InventoryUsageItem[]>([
    {
      rowId: String(Date.now()),
      inventoryItemId: "",
      productName: "",
      query: "",
      quantityUsed: "",
      availableQuantity: 0,
      unitType: "",
    },
  ]);

  const [method1Data, setMethod1Data] = useState<Method1Data>({
    pos_payments: "",
    cash_withdrawals: "",
    cash_in: "",
    cash_out: "",
    expenses_in_cash: "",
    lunch_covers: "",
    dinner_covers: "",
    opening_cash: "",
    closing_cash: "",
    notes: "",
  });

  const [method2Data, setMethod2Data] = useState<Method2Data>({
    pos_payments: "",
    cash_payments: "",
    bank_transfer_payments: "",
    expenses_in_cash: "",
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
      lunch_covers: formatNumberForInput(Number(record.lunch_covers || 0)),
      dinner_covers: formatNumberForInput(Number(record.dinner_covers || 0)),
      opening_cash: formatNumberForInput(Number(record.opening_cash || 0)),
      closing_cash: formatNumberForInput(Number(record.closing_cash || 0)),
      notes: record.notes || "",
    });
    setMethod2Data({
      pos_payments: formatNumberForInput(Number(record.pos_payments || 0)),
      cash_payments: formatNumberForInput(Number(record.cash_payments || 0)),
      bank_transfer_payments: formatNumberForInput(Number(record.bank_transfer_payments || 0)),
      expenses_in_cash: formatNumberForInput(Number(record.expenses_in_cash || 0)),
      lunch_covers: formatNumberForInput(Number(record.lunch_covers || 0)),
      dinner_covers: formatNumberForInput(Number(record.dinner_covers || 0)),
      opening_cash: formatNumberForInput(Number(record.opening_cash || 0)),
      closing_cash: formatNumberForInput(Number(record.closing_cash || 0)),
    });
    setInventoryUsage(
      record.inventory_usage?.length
        ? record.inventory_usage.map((item, index) => ({
            rowId: `${item.inventory_item_id}-${index}`,
            inventoryItemId: item.inventory_item_id,
            productName: item.product_name,
            query: item.product_name,
            quantityUsed: formatNumberForInput(item.quantity_used),
            availableQuantity: 0,
            unitType: item.unit_type,
          }))
        : [
            {
              rowId: String(Date.now()),
              inventoryItemId: "",
              productName: "",
              query: "",
              quantityUsed: "",
              availableQuantity: 0,
              unitType: "",
            },
          ],
    );
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
    const fetchInventoryItems = async () => {
      try {
        const response = await apiClient.get("/api/v1/restaurant/inventory", {
          params: {
            page: 1,
            page_size: 100,
          },
        });
        setInventoryItems(response.data.items || []);
      } catch (error: any) {
        console.log("Daily inventory suggestions error:", error?.response?.data || error?.message);
      }
    };

    void fetchInventoryItems();
  }, []);

  useEffect(() => {
    if (!editingRecordId) {
      return;
    }

    if (cachedEditableRecord) {
      applyRecordToForm(cachedEditableRecord);
      return;
    }

    const fetchRecord = async () => {
      setIsLoadingRecord(true);
      try {
        const response = await apiClient.get<DailyDataEditResponse>(
          `/api/v1/restaurant/daily-data/${encodeURIComponent(editingRecordId)}`,
        );
        applyRecordToForm(response.data);
      } catch (error: any) {
        console.error("Error loading daily record for edit:", error?.response?.data || error?.message);
        showErrorMessage(t("unable_to_load_daily_record"));
      } finally {
        setIsLoadingRecord(false);
      }
    };

    void fetchRecord();
  }, [cachedEditableRecord, editingRecordId, t]);

  useEffect(() => {
    if (!inventoryItems.length) {
      return;
    }

    setInventoryUsage((current) =>
      current.map((item) => {
        if (!item.inventoryItemId) {
          return item;
        }
        const matchedItem = inventoryItems.find((inventoryItem) => inventoryItem.id === item.inventoryItemId);
        if (!matchedItem) {
          return item;
        }
        return {
          ...item,
          productName: matchedItem.product_name,
          query: item.query || matchedItem.product_name,
          availableQuantity: Number(matchedItem.stock_quantity || 0),
          unitType: matchedItem.unit_type,
        };
      }),
    );
  }, [inventoryItems]);

  const usedInventoryPayload = useMemo(
    () =>
      inventoryUsage
        .filter((item) => item.inventoryItemId && parseNumberInput(item.quantityUsed) > 0)
        .map((item) => ({
          inventory_item_id: item.inventoryItemId,
          quantity_used: parseNumberInput(item.quantityUsed),
        })),
    [inventoryUsage],
  );

  const updateUsageRow = (rowId: string, updates: Partial<InventoryUsageItem>) => {
    setInventoryUsage((current) =>
      current.map((item) => (item.rowId === rowId ? { ...item, ...updates } : item)),
    );
  };

  const selectInventoryItem = (rowId: string, item: InventorySuggestionItem) => {
    updateUsageRow(rowId, {
      inventoryItemId: item.id,
      productName: item.product_name,
      query: item.product_name,
      availableQuantity: Number(item.stock_quantity || 0),
      unitType: item.unit_type,
    });
  };

  const addUsageRow = () => {
    setInventoryUsage((current) => [
      ...current,
      {
        rowId: `${Date.now()}-${current.length}`,
        inventoryItemId: "",
        productName: "",
        query: "",
        quantityUsed: "",
        availableQuantity: 0,
        unitType: "",
      },
    ]);
  };

  const removeUsageRow = (rowId: string) => {
    setInventoryUsage((current) =>
      current.length === 1
        ? [
            {
              rowId: String(Date.now()),
              inventoryItemId: "",
              productName: "",
              query: "",
              quantityUsed: "",
              availableQuantity: 0,
              unitType: "",
            },
          ]
        : current.filter((item) => item.rowId !== rowId),
    );
  };

  const validateNumberFields = (
    fields: { label: string; value: string; integer?: boolean }[],
  ) => {
    const invalidField = fields.find((field) =>
      field.integer ? !isValidIntegerInput(field.value) : !isValidNumberInput(field.value),
    );

    if (!invalidField) {
      return null;
    }

    return `${invalidField.label} must be a valid ${invalidField.integer ? "whole number" : "non-negative number"}.`;
  };

  const validateCurrentMethod = () => {
    if (selectedMethod === "method1") {
      return validateNumberFields([
        { label: "POS Payments", value: method1Data.pos_payments },
        { label: "Cash Withdrawals", value: method1Data.cash_withdrawals },
        { label: "Cash In", value: method1Data.cash_in },
        { label: "Cash Out", value: method1Data.cash_out },
        { label: "Expenses in Cash", value: method1Data.expenses_in_cash },
        { label: "Lunch Coperti", value: method1Data.lunch_covers, integer: true },
        { label: "Dinner Coperti", value: method1Data.dinner_covers, integer: true },
        { label: "Opening Cash", value: method1Data.opening_cash },
        { label: "Closing Cash", value: method1Data.closing_cash },
      ]);
    }

    return validateNumberFields([
      { label: "POS Payments", value: method2Data.pos_payments },
      { label: "Cash Payments", value: method2Data.cash_payments },
      { label: "Invoices Paid by Bank Transfer", value: method2Data.bank_transfer_payments },
      { label: "Expenses in Cash", value: method2Data.expenses_in_cash },
      { label: "Lunch Coperti", value: method2Data.lunch_covers, integer: true },
      { label: "Dinner Coperti", value: method2Data.dinner_covers, integer: true },
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
            method1Data.cash_in,
            method1Data.cash_out,
            method1Data.expenses_in_cash,
            method1Data.lunch_covers,
            method1Data.dinner_covers,
            method1Data.opening_cash,
            method1Data.closing_cash,
            method1Data.notes,
          ]
        : [
            method2Data.pos_payments,
            method2Data.cash_payments,
            method2Data.bank_transfer_payments,
            method2Data.expenses_in_cash,
            method2Data.lunch_covers,
            method2Data.dinner_covers,
            method2Data.opening_cash,
            method2Data.closing_cash,
          ];

    const hasFilledMethodField = selectedFields.some(hasTextValue);
    const hasFilledInventoryField = inventoryUsage.some(
      (item) => hasTextValue(item.query) || hasTextValue(item.quantityUsed),
    );

    return hasFilledMethodField || hasFilledInventoryField;
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

    const invalidUsage = inventoryUsage.find((item) => {
      if (!item.query.trim() && !item.quantityUsed.trim()) {
        return false;
      }
      return !item.inventoryItemId || parseNumberInput(item.quantityUsed) <= 0;
    });
    if (invalidUsage) {
      showErrorMessage(t("select_inventory_item"));
      return;
    }

    const overUsedItem = inventoryUsage.find(
      (item) =>
        item.inventoryItemId &&
        parseNumberInput(item.quantityUsed) > Number(item.availableQuantity || 0),
    );
    if (overUsedItem) {
      showErrorMessage(t("used_quantity_exceeds_stock"));
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        method: selectedMethod === "method1" ? "method_1" : "method_2",
        inventory_usage: usedInventoryPayload,
        ...(selectedMethod === "method1"
          ? {
              method_one: {
                business_date: currentBusinessDate,
                pos_payments: parseNumberInput(method1Data.pos_payments),
                cash_withdrawals: parseNumberInput(method1Data.cash_withdrawals),
                cash_in: parseNumberInput(method1Data.cash_in),
                cash_out: parseNumberInput(method1Data.cash_out),
                expenses_in_cash: parseNumberInput(method1Data.expenses_in_cash),
                lunch_covers: parseIntegerInput(method1Data.lunch_covers),
                dinner_covers: parseIntegerInput(method1Data.dinner_covers),
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
                lunch_covers: parseIntegerInput(method2Data.lunch_covers),
                dinner_covers: parseIntegerInput(method2Data.dinner_covers),
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
              contentContainerStyle={styles.scrollContent}
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

              <View style={styles.inventoryUsageCard}>
                <Text style={styles.inventoryUsageTitle}>{t("inventory_used")}</Text>
                <Text style={styles.inventoryUsageSubtitle}>{t("inventory_used_subtitle")}</Text>

                {inventoryUsage.map((usageItem) => {
                  const query = usageItem.query.trim().toLowerCase();
                  const suggestions =
                    query.length >= 2 && usageItem.query !== usageItem.productName
                      ? inventoryItems
                          .filter((item) => item.product_name.toLowerCase().includes(query))
                          .slice(0, 4)
                      : [];
                  const quantityUsed = parseNumberInput(usageItem.quantityUsed);
                  const remainingQuantity = Math.max(Number(usageItem.availableQuantity || 0) - quantityUsed, 0);

                  return (
                    <View key={usageItem.rowId} style={styles.usageRowCard}>
                      <View style={styles.usageRowHeader}>
                        <Text style={styles.usageLabel}>{t("product_used")}</Text>
                        <TouchableOpacity onPress={() => removeUsageRow(usageItem.rowId)} hitSlop={styles.iconHitSlop}>
                          <Feather name="x" size={moderateScale(16)} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        style={styles.usageInput}
                        value={usageItem.query}
                        onChangeText={(text) =>
                          updateUsageRow(usageItem.rowId, {
                            query: text,
                            inventoryItemId: "",
                            productName: "",
                            availableQuantity: 0,
                            unitType: "",
                          })
                        }
                        placeholder={t("select_inventory_item")}
                        placeholderTextColor="#9CA3AF"
                      />

                      {suggestions.length > 0 ? (
                        <View style={styles.suggestionBox}>
                          {suggestions.map((item) => (
                            <TouchableOpacity
                              key={item.id}
                              style={styles.suggestionItem}
                              onPress={() => selectInventoryItem(usageItem.rowId, item)}
                            >
                              <Text style={styles.suggestionName}>{item.product_name}</Text>
                              <Text style={styles.suggestionMeta}>
                                {t("available")}: {Number(item.stock_quantity || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} {item.unit_type}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : null}

                      <View style={styles.quantityRow}>
                        <View style={styles.quantityInputWrap}>
                          <Text style={styles.usageLabel}>{t("quantity_used")}</Text>
                          <TextInput
                            style={styles.usageInput}
                            value={usageItem.quantityUsed}
                            onChangeText={(text) => updateUsageRow(usageItem.rowId, { quantityUsed: text })}
                            placeholder="0"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                          />
                        </View>
                        <View style={styles.availableBox}>
                          <Text style={styles.availableLabel}>{t("available")}</Text>
                          <Text style={styles.availableValue}>
                            {Number(usageItem.availableQuantity || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} {usageItem.unitType}
                          </Text>
                          <Text style={styles.remainingText}>
                            {t("remaining")}: {remainingQuantity.toLocaleString(undefined, { maximumFractionDigits: 2 })} {usageItem.unitType}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}

                <TouchableOpacity style={styles.addUsageButton} onPress={addUsageRow}>
                  <Feather name="plus" size={moderateScale(16)} color="#FA8C4C" />
                  <Text style={styles.addUsageText}>{t("add_used_item")}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={[styles.bottomFooter, { paddingBottom: Math.max(insets.bottom, verticalScale(16)) }]}>
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
