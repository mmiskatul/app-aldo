import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import Input from "../../ui/Input";
import TypeModal from "../../ui/TypeModal";
import { useTranslation } from "../../../utils/i18n";

const RESTAURANT_TYPES = [
  "Pizzeria",
  "Fine Dining",
  "Fast Food",
  "Cafe",
  "Casual Dining",
  "Other",
];

interface Step1Props {
  restaurantName: string;
  setRestaurantName: (val: string) => void;
  restaurantType: string;
  setRestaurantType: (val: string) => void;
  onNext: () => void;
}

export default function Step1RestaurantInfo({
  restaurantName,
  setRestaurantName,
  restaurantType,
  setRestaurantType,
  onNext,
}: Step1Props) {
  const { t } = useTranslation();
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const restaurantTypeOptions = RESTAURANT_TYPES.map((value) => ({
    value,
    label: t(`restaurant_type_${value.toLowerCase().replace(/\s+/g, "_")}` as any),
  }));
  const selectedRestaurantTypeLabel =
    restaurantTypeOptions.find((option) => option.value === restaurantType)?.label || restaurantType;

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>{t('onboarding_restaurant_title')}</Text>
      <Text style={styles.subtitle}>
        {t('onboarding_restaurant_subtitle')}
      </Text>

      <Input
        label={t('restaurant_name')}
        placeholder={t('onboarding_restaurant_name_placeholder')}
        value={restaurantName}
        onChangeText={setRestaurantName}
      />

      <View style={styles.dropdownWrapper}>
        <Text style={styles.dropdownLabel}>{t('restaurant_type')}</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowTypeDropdown(!showTypeDropdown)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dropdownButtonText,
              !restaurantType ? styles.dropdownPlaceholder : null,
            ]}
          >
            {selectedRestaurantTypeLabel || t('select_option')}
          </Text>
          <Feather
            name={showTypeDropdown ? "chevron-up" : "chevron-down"}
            size={moderateScale(20)}
            color="#111827"
          />
        </TouchableOpacity>

        <TypeModal
          visible={showTypeDropdown}
          onClose={() => setShowTypeDropdown(false)}
          title={t('select_restaurant_type')}
          options={restaurantTypeOptions}
          selectedValue={restaurantType}
          onSelect={(val) => setRestaurantType(val)}
        />
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity style={styles.continueButton} onPress={onNext}>
        <Text style={styles.continueButtonText}>{t('continue')}</Text>
        <Feather
          name="arrow-right"
          size={moderateScale(18)}
          color="#FFFFFF"
          style={{ marginLeft: scale(8) }}
        />
      </TouchableOpacity>
      <Text style={styles.bottomFooterText}>
        {t('onboarding_change_later')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: { flex: 1 },
  title: {
    fontSize: moderateScale(28, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(34, 0.3),
  },
  subtitle: {
    fontSize: moderateScale(15, 0.3),
    color: "#4B5563",
    lineHeight: moderateScale(24, 0.3),
    marginBottom: verticalScale(30),
  },
  spacer: { flex: 1, minHeight: verticalScale(30) },
  continueButton: {
    flexDirection: "row",
    backgroundColor: "#FA8C4C",
    height: verticalScale(56),
    borderRadius: scale(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  continueButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bottomFooterText: {
    textAlign: "center",
    fontSize: moderateScale(12, 0.3),
    color: "#6B7280",
  },
  dropdownWrapper: {
    marginBottom: verticalScale(20),
    position: "relative",
    zIndex: 10,
  },
  dropdownLabel: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#374151",
    marginBottom: verticalScale(8),
  },
  dropdownButton: {
    height: verticalScale(52),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  dropdownButtonText: {
    fontSize: moderateScale(15, 0.3),
    color: "#111827",
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
  },
});
