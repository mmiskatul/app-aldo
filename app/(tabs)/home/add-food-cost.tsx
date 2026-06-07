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
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import apiClient from "../../../api/apiClient";
import Header from "../../../components/ui/Header";
import DatePicker from "../../../components/ui/DatePicker";
import { useAppStore } from "../../../store/useAppStore";
import { formatApiDate } from "../../../utils/date";

export default function AddFoodCostScreen() {
  const router = useRouter();
  const clearHomeScreenCache = useAppStore((state) => state.clearHomeScreenCache);
  const clearAnalyticsScreenCache = useAppStore((state) => state.clearAnalyticsScreenCache);
  const bumpInventoryRefreshToken = useAppStore((state) => state.bumpInventoryRefreshToken);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const canSave = title.trim().length > 0 && Number(amount) > 0 && !loading;

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    try {
      setLoading(true);
      await apiClient.post("/api/v1/restaurant/food-cost-entries", {
        title: title.trim(),
        amount: Number(amount),
        expense_date: formatApiDate(expenseDate),
      });
      clearHomeScreenCache();
      clearAnalyticsScreenCache();
      bumpInventoryRefreshToken();
      router.back();
    } catch (error: any) {
      console.error("Error saving food cost entry:", error?.response?.data || error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header title="Add Daily Food Cost" showBack={true} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Food cost title"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountWrap}>
              <Text style={styles.prefix}>€</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          <DatePicker label="Date" value={expenseDate} onChange={setExpenseDate} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !canSave && styles.buttonDisabled]}
            disabled={!canSave}
            onPress={handleSave}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="save" size={moderateScale(18)} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Save Daily Food Cost</Text>
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
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(24),
    gap: verticalScale(18),
  },
  inputGroup: {
    gap: verticalScale(8),
  },
  label: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: "600",
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(12),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(14),
    fontSize: moderateScale(14, 0.3),
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(12),
    backgroundColor: "#F9FAFB",
    paddingHorizontal: scale(14),
  },
  prefix: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginRight: scale(6),
  },
  amountInput: {
    flex: 1,
    paddingVertical: verticalScale(14),
    fontSize: moderateScale(14, 0.3),
    color: "#111827",
  },
  footer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(24),
    paddingTop: verticalScale(12),
  },
  button: {
    height: verticalScale(52),
    borderRadius: scale(14),
    backgroundColor: "#FA8C4C",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: scale(8),
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15, 0.3),
    fontWeight: "700",
  },
});
