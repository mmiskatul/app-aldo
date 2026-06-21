import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "../../../utils/i18n";

export interface Method2Data {
  pos_payments: string;
  cash_payments: string;
  bank_transfer_payments: string;
  expenses_in_cash: string;
  opening_cash: string;
  closing_cash: string;
  lunch_covers: string;
  dinner_covers: string;
}

interface Props {
  data: Method2Data;
  onChange: (key: keyof Method2Data, val: string) => void;
  onInfoPress?: () => void;
}

export default function Method2Form({ data, onChange, onInfoPress }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Feather
            name="credit-card"
            size={moderateScale(18)}
            color="#FA8C4C"
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>{t("payment_inputs")}</Text>
        </View>
        <TouchableOpacity
          style={styles.infoIconContainer}
          onPress={onInfoPress}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Revenue input methods"
        >
          <Feather name="info" size={moderateScale(12)} color="#B45309" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t("pos_payments")} (+)</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.prefixSign}>â‚¬</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={data.pos_payments}
            onChangeText={(val) => onChange("pos_payments", val)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t("cash_payments")} (+)</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.prefixSign}>â‚¬</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={data.cash_payments}
            onChangeText={(val) => onChange("cash_payments", val)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t("bank_transfer_payments")} (+)</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.prefixSign}>â‚¬</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={data.bank_transfer_payments}
            onChangeText={(val) => onChange("bank_transfer_payments", val)}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: scale(8) }]}>
          <Text style={styles.label}>{t("initial_cash")} (-)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { paddingLeft: scale(16) }]}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={data.opening_cash}
              onChangeText={(val) => onChange("opening_cash", val)}
            />
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: scale(8) }]}>
          <Text style={styles.label}>{t("final_cash")} (+)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { paddingLeft: scale(16) }]}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={data.closing_cash}
              onChangeText={(val) => onChange("closing_cash", val)}
            />
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t("cash_expenses_paid_from_drawer")} (-)</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.prefixSign}>â‚¬</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={data.expenses_in_cash}
            onChangeText={(val) => onChange("expenses_in_cash", val)}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: scale(8) }]}>
          <Text style={styles.label}>{t("lunch_coperti")}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { paddingLeft: scale(16) }]}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={data.lunch_covers}
              onChangeText={(val) => onChange("lunch_covers", val)}
            />
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: scale(8) }]}>
          <Text style={styles.label}>{t("dinner_coperti")}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { paddingLeft: scale(16) }]}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={data.dinner_covers}
              onChangeText={(val) => onChange("dinner_covers", val)}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: verticalScale(100),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIconContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: scale(12),
    width: moderateScale(24),
    height: moderateScale(24),
    justifyContent: "center",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: scale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "800",
    color: "#111827",
  },
  inputGroup: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(13, 0.3),
    color: "#374151",
    fontWeight: "600",
    marginBottom: verticalScale(8),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: scale(12),
    height: verticalScale(54),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(16),
  },
  prefixSign: {
    fontSize: moderateScale(14, 0.3),
    color: "#6B7280",
    marginRight: scale(8),
    fontWeight: "600",
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16, 0.3),
    color: "#111827",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
