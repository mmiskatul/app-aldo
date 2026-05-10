import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import * as ImagePicker from "expo-image-picker";
import ImagePickerModal from "../../ui/ImagePickerModal";
import { showErrorMessage } from "../../../utils/feedback";
import { useTranslation } from "../../../utils/i18n";

interface Step3Props {
  interiorPhoto: string | null;
  setInteriorPhoto: (val: string | null) => void;
  exteriorPhoto: string | null;
  setExteriorPhoto: (val: string | null) => void;
  onNext: () => void;
}

export default function Step3PhotoUpload({
  interiorPhoto,
  setInteriorPhoto,
  exteriorPhoto,
  setExteriorPhoto,
  onNext,
}: Step3Props) {
  const { t } = useTranslation();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [photoTarget, setPhotoTarget] = useState<"interior" | "exterior" | null>(
    null
  );

  const pickImage = async (mode: "camera" | "gallery") => {
    try {
      let result;
      if (mode === "camera") {
        const permissionResult =
          await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
          showErrorMessage(t("camera_permission_required"));
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.6,
        });
      } else {
        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          showErrorMessage(t("gallery_permission_required"));
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.6,
        });
      }

      setShowImagePicker(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (photoTarget === "interior") {
          setInteriorPhoto(result.assets[0].uri);
        } else if (photoTarget === "exterior") {
          setExteriorPhoto(result.assets[0].uri);
        }
      }
      setPhotoTarget(null);
    } catch (error) {
      console.log("Error picking image:", error);
      setShowImagePicker(false);
      setPhotoTarget(null);
    }
  };

  const openPicker = (target: "interior" | "exterior") => {
    setPhotoTarget(target);
    setShowImagePicker(true);
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>{t("onboarding_photo_title")}</Text>
      <Text style={styles.subtitle}>
        {t("onboarding_photo_subtitle")}
      </Text>

      <Text style={styles.uploadSectionTitle}>{t("onboarding_interior_photo_title")}</Text>
      {interiorPhoto ? (
        <View style={styles.uploadedImageContainer}>
          <Image source={{ uri: interiorPhoto }} style={styles.uploadedImage} />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={() => openPicker("interior")}
          >
            <Feather name="edit-2" size={moderateScale(16)} color="#FFFFFF" />
            <Text style={styles.changeImageText}>{t("onboarding_change_photo")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setInteriorPhoto(null)}
            accessibilityLabel={t("onboarding_remove_interior_photo")}
          >
            <Feather name="x" size={moderateScale(18)} color="#111827" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadBox}
          activeOpacity={0.8}
          onPress={() => openPicker("interior")}
        >
          <MaterialCommunityIcons
            name="storefront-outline"
            size={moderateScale(32)}
            color="#FA8C4C"
            style={{ marginBottom: verticalScale(10) }}
          />
          <Text style={styles.uploadMainText}>{t("onboarding_upload_interior")}</Text>
          <Text style={styles.uploadSubText}>{t("onboarding_upload_supports")}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.uploadSectionTitle}>{t("onboarding_exterior_photo_title")}</Text>
      {exteriorPhoto ? (
        <View style={styles.uploadedImageContainer}>
          <Image source={{ uri: exteriorPhoto }} style={styles.uploadedImage} />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={() => openPicker("exterior")}
          >
            <Feather name="edit-2" size={moderateScale(16)} color="#FFFFFF" />
            <Text style={styles.changeImageText}>{t("onboarding_change_photo")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setExteriorPhoto(null)}
            accessibilityLabel={t("onboarding_remove_exterior_photo")}
          >
            <Feather name="x" size={moderateScale(18)} color="#111827" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadBox}
          activeOpacity={0.8}
          onPress={() => openPicker("exterior")}
        >
          <MaterialCommunityIcons
            name="office-building-outline"
            size={moderateScale(32)}
            color="#FA8C4C"
            style={{ marginBottom: verticalScale(10) }}
          />
          <Text style={styles.uploadMainText}>{t("onboarding_upload_exterior")}</Text>
          <Text style={styles.uploadSubText}>
            {t("onboarding_upload_exterior_hint")}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.spacer} />

      <TouchableOpacity style={styles.continueButton} onPress={onNext}>
        <Text style={styles.continueButtonText}>{t("continue")}</Text>
      </TouchableOpacity>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => {
          setShowImagePicker(false);
          setPhotoTarget(null);
        }}
        onCameraSelect={() => pickImage("camera")}
        onGallerySelect={() => pickImage("gallery")}
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
  uploadSectionTitle: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginBottom: verticalScale(12),
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: "#FFEDD5",
    borderStyle: "dashed",
    borderRadius: scale(16),
    backgroundColor: "#FFF9F5",
    padding: scale(30),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(24),
  },
  uploadMainText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "600",
    color: "#111827",
    marginBottom: verticalScale(6),
  },
  uploadSubText: {
    fontSize: moderateScale(12, 0.3),
    color: "#6B7280",
  },
  uploadedImageContainer: {
    height: verticalScale(160),
    borderRadius: scale(16),
    overflow: "hidden",
    marginBottom: verticalScale(24),
    position: "relative",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  changeImageButton: {
    position: "absolute",
    bottom: verticalScale(12),
    right: scale(12),
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(20),
  },
  changeImageText: {
    color: "#FFFFFF",
    fontSize: moderateScale(12, 0.3),
    fontWeight: "600",
    marginLeft: scale(4),
  },
  removeImageButton: {
    position: "absolute",
    top: verticalScale(10),
    right: scale(10),
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
