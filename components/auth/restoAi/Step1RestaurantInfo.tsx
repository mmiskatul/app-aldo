import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import * as ImagePicker from "expo-image-picker";
import Input from "../../ui/Input";
import ImagePickerModal from "../../ui/ImagePickerModal";
import ProfilePlaceholderAvatar from "../../ui/ProfilePlaceholderAvatar";
import TypeModal from "../../ui/TypeModal";
import { showErrorMessage } from "../../../utils/feedback";
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
  profilePhoto: string | null;
  setProfilePhoto: (val: string | null) => void;
  restaurantName: string;
  setRestaurantName: (val: string) => void;
  restaurantType: string;
  setRestaurantType: (val: string) => void;
  onNext: () => void;
}

export default function Step1RestaurantInfo({
  profilePhoto,
  setProfilePhoto,
  restaurantName,
  setRestaurantName,
  restaurantType,
  setRestaurantType,
  onNext,
}: Step1Props) {
  const { t } = useTranslation();
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const restaurantTypeOptions = RESTAURANT_TYPES.map((value) => ({
    value,
    label: t(`restaurant_type_${value.toLowerCase().replace(/\s+/g, "_")}` as any),
  }));
  const selectedRestaurantTypeLabel =
    restaurantTypeOptions.find((option) => option.value === restaurantType)?.label || restaurantType;

  const pickProfileImage = async (mode: "camera" | "gallery") => {
    try {
      let result;
      if (mode === "camera") {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          showErrorMessage(t("camera_permission_required"));
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          showErrorMessage(t("gallery_permission_required"));
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      setShowImagePicker(false);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error picking profile image:", error);
      setShowImagePicker(false);
    }
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>{t('onboarding_restaurant_title')}</Text>
      <Text style={styles.subtitle}>
        {t('onboarding_restaurant_subtitle')}
      </Text>

      <View style={styles.profileImageSection}>
        <View style={styles.imageWrapper}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.avatar} />
          ) : (
            <ProfilePlaceholderAvatar size={scale(100)} style={styles.avatar} />
          )}
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => setShowImagePicker(true)}
            accessibilityLabel={t("change_photo")}
          >
            <Feather name="camera" size={moderateScale(14)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {profilePhoto ? (
          <TouchableOpacity
            onPress={() => setProfilePhoto(null)}
            style={styles.removeImageButton}
            accessibilityLabel={t("remove_photo")}
          >
            <Feather name="trash-2" size={moderateScale(16)} color="#EF4444" />
          </TouchableOpacity>
        ) : null}
      </View>

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

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onCameraSelect={() => pickProfileImage("camera")}
        onGallerySelect={() => pickProfileImage("gallery")}
      />
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
  profileImageSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(24),
  },
  imageWrapper: {
    position: "relative",
    marginBottom: verticalScale(12),
  },
  avatar: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    borderWidth: 4,
    borderColor: "#FFE4D1",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FA8C4C",
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  removeImageButton: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
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
