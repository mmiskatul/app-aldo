import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
} from "react-native-heroicons/outline";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

type CashTransactionType =
  | "bank_deposit"
  | "cash_deposit"
  | "pos_payment"
  | "cash_in"
  | "bank_transfer_payment"
  | "cash_withdrawal"
  | "cash_out"
  | "cash_expense";

interface Deposit {
  id: string;
  display_title: string;
  deposit_date_formatted: string;
  amount_formatted: string;
  amount: number;
  deposit_date?: string;
  type?: CashTransactionType;
  bank_account?: string;
  notes?: string | null;
  source_kind?: string | null;
  source_id?: string | null;
  source_subtype?: string | null;
  created_at?: string;
}

interface RecentDepositsProps {
  deposits?: Deposit[];
}

const getIconType = (item: Deposit): "bank" | "cash" | "pos" => {
  if (item.type === "pos_payment" || item.source_subtype === "pos_payments") {
    return "pos";
  }
  if (
    item.type === "cash_deposit" ||
    item.type === "cash_in" ||
    item.type === "cash_withdrawal" ||
    item.type === "cash_out" ||
    item.type === "cash_expense" ||
    item.amount < 0
  ) {
    return "cash";
  }
  return "bank";
};

export default function RecentDeposits({ deposits }: RecentDepositsProps) {
  const router = useRouter();
  const displayDeposits = deposits ?? [];

  const openTransactionDetails = (item: Deposit) => {
    router.push({
      pathname: "/(tabs)/home/cash-transaction-details",
      params: {
        id: item.id,
        readonly: item.id.startsWith("auto-") || item.source_kind ? "true" : "false",
        amount: String(item.amount ?? 0),
        displayTitle: item.display_title,
        depositDate: item.deposit_date || item.deposit_date_formatted,
        depositDateFormatted: item.deposit_date_formatted,
        amountFormatted: item.amount_formatted,
        type: item.type || "bank_deposit",
        bankAccount: item.bank_account || item.display_title,
        notes: item.notes || "",
        sourceKind: item.source_kind || "",
        sourceId: item.source_id || "",
        sourceSubtype: item.source_subtype || "",
        createdAt: item.created_at || "",
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
      </View>

      {!displayDeposits.length ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No recent transactions yet</Text>
        </View>
      ) : (
        displayDeposits.map((item) => {
          const isPositive = item.amount >= 0;
          const hasAmount = Boolean(item.amount_formatted);
          const displayAmount = hasAmount
            ? isPositive
              ? `+${item.amount_formatted}`
              : `-${item.amount_formatted.replace("-", "")}`
            : null;
          const iconType = getIconType(item);

          return (
            <View key={item.id} style={styles.transactionCard}>
              <View
                style={[
                  styles.iconContainer,
                  iconType === "pos"
                    ? styles.iconContainerPos
                    : iconType === "cash"
                      ? styles.iconContainerCash
                      : styles.iconContainerBank,
                ]}
              >
                {iconType === "bank" ? (
                  <BuildingLibraryIcon
                    size={moderateScale(20)}
                    color="#FA8C4C"
                  />
                ) : iconType === "pos" ? (
                  <CreditCardIcon size={moderateScale(20)} color="#2563EB" />
                ) : (
                  <BanknotesIcon size={moderateScale(20)} color="#6B7280" />
                )}
              </View>

              <View style={styles.detailsContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.display_title}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.deposit_date_formatted}
                </Text>
              </View>

              {displayAmount ? (
                <Text
                  style={[
                    styles.amount,
                    isPositive ? styles.amountPositive : styles.amountNegative,
                  ]}
                >
                  {displayAmount}
                </Text>
              ) : null}

              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => openTransactionDetails(item)}
                activeOpacity={0.75}
              >
                <Feather name="eye" size={moderateScale(18)} color="#4B5563" />
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(40),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "800",
    color: "#111827",
  },
  transactionCard: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: verticalScale(12),
    alignItems: "center",
  },
  emptyState: {
    backgroundColor: "#F9FAFB",
    borderRadius: scale(12),
    paddingVertical: verticalScale(20),
    paddingHorizontal: scale(16),
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: moderateScale(14, 0.3),
    color: "#6B7280",
    fontWeight: "500",
  },
  iconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(16),
  },
  iconContainerBank: {
    backgroundColor: "#FFF0E5",
  },
  iconContainerCash: {
    backgroundColor: "#E5E7EB",
  },
  iconContainerPos: {
    backgroundColor: "#DBEAFE",
  },
  detailsContainer: {
    flex: 1,
    marginRight: scale(8),
  },
  title: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: moderateScale(12, 0.3),
    color: "#6B7280",
    fontWeight: "500",
  },
  amount: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: "800",
    marginRight: scale(10),
  },
  amountPositive: {
    color: "#10B981",
  },
  amountNegative: {
    color: "#111827",
  },
  viewButton: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
});
