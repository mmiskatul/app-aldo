import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
} from "react-native-heroicons/outline";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import apiClient from "../../../api/apiClient";
import DatePicker from "../../../components/ui/DatePicker";
import Header from "../../../components/ui/Header";
import { useAppStore } from "../../../store/useAppStore";
import {
  showDialog,
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
} from "../../../utils/feedback";
import { useTranslation } from "../../../utils/i18n";

type CashTransactionType =
  | "bank_deposit"
  | "cash_deposit"
  | "pos_payment"
  | "cash_in"
  | "bank_transfer_payment"
  | "cash_withdrawal"
  | "cash_out"
  | "cash_expense";

type CashTransaction = {
  id: string;
  deposit_date: string;
  deposit_date_formatted?: string;
  amount: number;
  amount_formatted?: string;
  type: CashTransactionType;
  bank_account: string;
  display_title?: string;
  notes?: string | null;
  source_kind?: string | null;
  source_id?: string | null;
  source_subtype?: string | null;
  created_at?: string;
};

const toSingleParam = (value: string | string[] | undefined, fallback = "") => {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  return value ?? fallback;
};

const parseDateValue = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(`${value.slice(0, 10)}T00:00:00`);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const formatCurrency = (value: number) =>
  `€${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateForApi = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const CASH_TRANSACTION_TYPES = new Set<string>([
  "bank_deposit",
  "cash_deposit",
  "pos_payment",
  "cash_in",
  "bank_transfer_payment",
  "cash_withdrawal",
  "cash_out",
  "cash_expense",
]);

const resolveCashTransactionType = (value: string): CashTransactionType =>
  CASH_TRANSACTION_TYPES.has(value) ? (value as CashTransactionType) : "bank_deposit";

const formatType = (type: CashTransaction["type"], t: ReturnType<typeof useTranslation>["t"]) => {
  switch (type) {
    case "cash_deposit":
      return t("cash_deposit");
    case "pos_payment":
      return t("pos_payments");
    case "cash_in":
      return t("cash_in");
    case "bank_transfer_payment":
      return t("bank_transfer_payments");
    case "cash_withdrawal":
      return t("cash_withdrawals");
    case "cash_out":
      return t("cash_out");
    case "cash_expense":
      return t("cash");
    default:
      return t("bank_deposits");
  }
};

const getSummaryIconType = (type: CashTransaction["type"]): "bank" | "cash" | "pos" => {
  if (type === "pos_payment") {
    return "pos";
  }
  if (
    type === "cash_deposit" ||
    type === "cash_in" ||
    type === "cash_withdrawal" ||
    type === "cash_out" ||
    type === "cash_expense"
  ) {
    return "cash";
  }
  return "bank";
};

const formatSourceLabel = (value: string | null | undefined, t: ReturnType<typeof useTranslation>["t"]) => {
  if (!value) {
    return t("manual");
  }
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function CashTransactionDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const setCashOverviewData = useAppStore((state) => state.setCashOverviewData);
  const setHomeScreenCache = useAppStore((state) => state.setHomeScreenCache);

  const id = toSingleParam(params.id);
  const isReadonly = toSingleParam(params.readonly) === "true" || id.startsWith("auto-");

  const initialTransaction = useMemo<CashTransaction | null>(() => {
    if (!id) {
      return null;
    }

    const typeParam = toSingleParam(params.type, "bank_deposit");
    const amount = Number.parseFloat(toSingleParam(params.amount, "0")) || 0;
    return {
      id,
      deposit_date: toSingleParam(params.depositDate),
      deposit_date_formatted: toSingleParam(params.depositDateFormatted),
      amount,
      amount_formatted: toSingleParam(params.amountFormatted),
      type: resolveCashTransactionType(typeParam),
      bank_account: toSingleParam(params.bankAccount) || toSingleParam(params.displayTitle),
      display_title: toSingleParam(params.displayTitle),
      notes: toSingleParam(params.notes),
      source_kind: toSingleParam(params.sourceKind) || null,
      source_id: toSingleParam(params.sourceId) || null,
      source_subtype: toSingleParam(params.sourceSubtype) || null,
      created_at: toSingleParam(params.createdAt),
    };
  }, [id, params]);

  const [transaction, setTransaction] = useState<CashTransaction | null>(initialTransaction);
  const [loading, setLoading] = useState(!isReadonly && Boolean(id));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState(() => parseDateValue(initialTransaction?.deposit_date || ""));
  const [amount, setAmount] = useState(initialTransaction?.amount ? String(initialTransaction.amount) : "");
  const [bankAccount, setBankAccount] = useState(initialTransaction?.bank_account || "");
  const [notes, setNotes] = useState(initialTransaction?.notes || "");

  const applyTransaction = useCallback((nextTransaction: CashTransaction) => {
    setTransaction(nextTransaction);
    setDate(parseDateValue(nextTransaction.deposit_date));
    setAmount(String(nextTransaction.amount ?? ""));
    setBankAccount(nextTransaction.bank_account || "");
    setNotes(nextTransaction.notes || "");
  }, []);

  const fetchTransaction = useCallback(async () => {
    if (!id || isReadonly) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get<CashTransaction>(
        `/api/v1/restaurant/cash/deposits/${id}`
      );
      applyTransaction(response.data);
    } catch (error) {
      console.error("Error loading cash transaction:", error);
      showErrorMessage(t("transaction_not_found"));
    } finally {
      setLoading(false);
    }
  }, [applyTransaction, id, isReadonly]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  const handleSave = async () => {
    if (!transaction) {
      return;
    }

    const parsedAmount = Number.parseFloat(amount);
    if (!bankAccount.trim() || !Number.isFinite(parsedAmount) || parsedAmount < 0) {
      showErrorMessage(t("valid_amount_bank_account"), t("missing_fields"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        deposit_date: formatDateForApi(date),
        amount: parsedAmount,
        type: transaction.type === "cash_deposit" ? "cash_deposit" : "bank_deposit",
        bank_account: bankAccount.trim(),
        notes: notes.trim(),
      };
      const response = await apiClient.patch<CashTransaction>(
        `/api/v1/restaurant/cash/deposits/${transaction.id}`,
        payload
      );
      applyTransaction(response.data);
      setCashOverviewData(null);
      setHomeScreenCache({ cashByPeriod: {}, recentActivity: null });
      setIsEditing(false);
      showSuccessMessage(t("transaction_updated"));
    } catch (error) {
      console.error("Error updating cash transaction:", error);
      showErrorMessage(t("save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const deleteTransaction = async () => {
    if (!transaction) {
      return;
    }

    setDeleting(true);
    try {
      showInfoMessage(t("deleting_transaction"));
      await apiClient.delete(`/api/v1/restaurant/cash/deposits/${transaction.id}`);
      setCashOverviewData(null);
      setHomeScreenCache({ cashByPeriod: {}, recentActivity: null });
      showSuccessMessage(t("transaction_deleted"));
      router.back();
    } catch (error) {
      console.error("Error deleting cash transaction:", error);
      showErrorMessage(t("delete_failed"));
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = () => {
    showDialog(t("delete_transaction"), t("delete_transaction_message"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => {
          void deleteTransaction();
        },
      },
    ]);
  };

  const displayAmount = formatCurrency(transaction?.amount ?? 0);
  const displayDate = transaction?.deposit_date_formatted || transaction?.deposit_date || "-";
  const isSourceControlled = Boolean(transaction?.source_kind);
  const isReadOnlyTransaction = isReadonly || isSourceControlled;
  const summaryIconType = transaction ? getSummaryIconType(transaction.type) : "bank";

  return (
    <View style={styles.safeArea}>
      <Header title={t("transaction_details")} showBack={true} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FA8C4C" />
        </View>
      ) : !transaction ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t("transaction_not_found")}</Text>
          <Text style={styles.emptyText}>{t("transaction_not_found_subtitle")}</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                {summaryIconType === "pos" ? (
                  <CreditCardIcon size={moderateScale(28)} color="#FFFFFF" />
                ) : summaryIconType === "cash" ? (
                  <BanknotesIcon size={moderateScale(28)} color="#FFFFFF" />
                ) : (
                  <BuildingLibraryIcon size={moderateScale(28)} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.summaryLabel}>{formatType(transaction.type, t)}</Text>
              <Text style={styles.summaryAmount}>{displayAmount}</Text>
              <Text style={styles.summaryMeta}>{displayDate}</Text>
            </View>

            {isReadOnlyTransaction ? (
              <View style={styles.noticeCard}>
                <Feather name="info" size={moderateScale(18)} color="#FA8C4C" />
                <Text style={styles.noticeText}>
                  {t("transaction_generated_notice")}
                </Text>
              </View>
            ) : null}

            {isEditing ? (
              <View style={styles.formCard}>
                <DatePicker
                  label={t("transaction_date")}
                  value={date}
                  onChange={setDate}
                  leftIcon={
                    <Feather name="calendar" size={moderateScale(18)} color="#6B7280" />
                  }
                />

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t("amount")}</Text>
                  <View style={styles.textInputContainer}>
                    <Text style={styles.prefix}>€ </Text>
                    <TextInput
                      style={styles.textInput}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t("bank_account")}</Text>
                  <View style={styles.textInputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={bankAccount}
                      onChangeText={setBankAccount}
                      placeholder={t("enter_bank_account")}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t("notes")}</Text>
                  <TextInput
                    style={styles.textArea}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder={t("optional_notes")}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.detailsCard}>
                <DetailRow label={t("account")} value={transaction.bank_account || "-"} />
                <DetailRow label={t("type")} value={formatType(transaction.type, t)} />
                <DetailRow label={t("date")} value={displayDate} />
                <DetailRow label={t("source")} value={formatSourceLabel(transaction.source_kind, t)} />
                {transaction.source_subtype ? (
                  <DetailRow label={t("source_field")} value={formatSourceLabel(transaction.source_subtype, t)} />
                ) : null}
                <DetailRow label={t("notes")} value={transaction.notes || t("no_notes")} />
              </View>
            )}
          </ScrollView>

          {!isReadOnlyTransaction ? (
            <View style={styles.footer}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.secondaryButton, styles.footerButton]}
                    onPress={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    <Text style={styles.secondaryButtonText}>{t("cancel")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryButton, styles.footerButton]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>{t("save")}</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.secondaryButton, styles.footerButton]}
                    onPress={() => setIsEditing(true)}
                    disabled={deleting}
                  >
                    <Feather name="edit-2" size={moderateScale(16)} color="#FA8C4C" />
                    <Text style={styles.secondaryButtonText}>{t("edit_data")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteButton, styles.footerButton]}
                    onPress={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Feather name="trash-2" size={moderateScale(16)} color="#FFFFFF" />
                        <Text style={styles.deleteButtonText}>{t("delete")}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          ) : null}
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: scale(24),
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(8),
  },
  emptyText: {
    fontSize: moderateScale(14, 0.3),
    color: "#6B7280",
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(120),
  },
  summaryCard: {
    backgroundColor: "#111827",
    borderRadius: scale(22),
    padding: scale(22),
    alignItems: "center",
    marginBottom: verticalScale(18),
  },
  summaryIcon: {
    width: moderateScale(58),
    height: moderateScale(58),
    borderRadius: moderateScale(18),
    backgroundColor: "#FA8C4C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(14),
  },
  summaryLabel: {
    color: "#F9FAFB",
    fontSize: moderateScale(13, 0.3),
    fontWeight: "700",
    marginBottom: verticalScale(8),
  },
  summaryAmount: {
    color: "#FFFFFF",
    fontSize: moderateScale(30, 0.3),
    fontWeight: "900",
    marginBottom: verticalScale(6),
  },
  summaryMeta: {
    color: "#D1D5DB",
    fontSize: moderateScale(13, 0.3),
    fontWeight: "600",
  },
  noticeCard: {
    flexDirection: "row",
    backgroundColor: "#FFF8F3",
    borderWidth: 1,
    borderColor: "#FCE7D6",
    borderRadius: scale(14),
    padding: scale(14),
    marginBottom: verticalScale(16),
  },
  noticeText: {
    flex: 1,
    color: "#4B5563",
    fontSize: moderateScale(13, 0.3),
    lineHeight: moderateScale(19),
    marginLeft: scale(10),
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(18),
    paddingHorizontal: scale(16),
  },
  detailRow: {
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: moderateScale(12, 0.3),
    color: "#6B7280",
    fontWeight: "700",
    marginBottom: verticalScale(6),
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: moderateScale(16, 0.3),
    color: "#111827",
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(18),
    padding: scale(16),
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
    minHeight: verticalScale(110),
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    backgroundColor: "#FFFFFF",
    fontSize: moderateScale(15, 0.3),
    color: "#111827",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(18),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerButton: {
    flex: 1,
    marginHorizontal: scale(4),
  },
  primaryButton: {
    backgroundColor: "#FA8C4C",
    borderRadius: scale(12),
    minHeight: verticalScale(48),
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15, 0.3),
    fontWeight: "800",
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "#FFF8F3",
    borderWidth: 1,
    borderColor: "#FCE7D6",
    borderRadius: scale(12),
    minHeight: verticalScale(48),
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FA8C4C",
    fontSize: moderateScale(15, 0.3),
    fontWeight: "800",
    marginLeft: scale(6),
  },
  deleteButton: {
    flexDirection: "row",
    backgroundColor: "#EF4444",
    borderRadius: scale(12),
    minHeight: verticalScale(48),
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15, 0.3),
    fontWeight: "800",
    marginLeft: scale(6),
  },
});
