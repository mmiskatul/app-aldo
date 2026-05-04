import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import * as ImagePicker from "expo-image-picker";
import ImagePickerModal from "../../ui/ImagePickerModal";
import { showErrorMessage } from "../../../utils/feedback";

interface Step3Props {
  profilePhoto: string | null;
  setProfilePhoto: (val: string | null) => void;
  interiorPhoto: string | null;
  setInteriorPhoto: (val: string | null) => void;
  exteriorPhoto: string | null;
  setExteriorPhoto: (val: string | null) => void;
  onNext: () => void;
}

export default function Step3PhotoUpload({
  profilePhoto,
  setProfilePhoto,
  interiorPhoto,
  setInteriorPhoto,
  exteriorPhoto,
  setExteriorPhoto,
  onNext,
}: Step3Props) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [photoTarget, setPhotoTarget] = useState<"profile" | "interior" | "exterior" | null>(
    null
  );

  const pickImage = async (mode: "camera" | "gallery") => {
    try {
      let result;
      const imageAspect: [number, number] = photoTarget === "profile" ? [1, 1] : [4, 3];
      if (mode === "camera") {
        const permissionResult =
          await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
          showErrorMessage("You've refused to allow this app to access your camera!");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: imageAspect,
          quality: 1,
        });
      } else {
        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          showErrorMessage("You've refused to allow this app to access your photos!");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: imageAspect,
          quality: 1,
        });
      }

      setShowImagePicker(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (photoTarget === "profile") {
          setProfilePhoto(result.assets[0].uri);
        } else if (photoTarget === "interior") {
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

  const openPicker = (target: "profile" | "interior" | "exterior") => {
    setPhotoTarget(target);
    setShowImagePicker(true);
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Upload Restaurant Photos</Text>
      <Text style={styles.subtitle}>
        Add your profile picture and restaurant photos so Risto AI can personalize your account.
      </Text>

      <Text style={styles.uploadSectionTitle}>Profile Picture</Text>
      {profilePhoto ? (
        <View style={styles.uploadedImageContainer}>
          <Image source={{ uri: profilePhoto }} style={styles.uploadedImage} />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={() => openPicker("profile")}
          >
            <Feather name="edit-2" size={moderateScale(16)} color="#FFFFFF" />
            <Text style={styles.changeImageText}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadBox}
          activeOpacity={0.8}
          onPress={() => openPicker("profile")}
        >
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={moderateScale(32)}
            color="#FA8C4C"
            style={{ marginBottom: verticalScale(10) }}
          />
          <Text style={styles.uploadMainText}>Tap to upload profile picture</Text>
          <Text style={styles.uploadSubText}>Supports JPG, PNG</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.uploadSectionTitle}>Interior Photo</Text>
      {interiorPhoto ? (
        <View style={styles.uploadedImageContainer}>
          <Image source={{ uri: interiorPhoto }} style={styles.uploadedImage} />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={() => openPicker("interior")}
          >
            <Feather name="edit-2" size={moderateScale(16)} color="#FFFFFF" />
            <Text style={styles.changeImageText}>Change</Text>
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
          <Text style={styles.uploadMainText}>Tap to upload interior view</Text>
          <Text style={styles.uploadSubText}>Supports JPG, PNG</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.uploadSectionTitle}>Exterior Photo</Text>
      {exteriorPhoto ? (
        <View style={styles.uploadedImageContainer}>
          <Image source={{ uri: exteriorPhoto }} style={styles.uploadedImage} />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={() => openPicker("exterior")}
          >
            <Feather name="edit-2" size={moderateScale(16)} color="#FFFFFF" />
            <Text style={styles.changeImageText}>Change</Text>
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
          <Text style={styles.uploadMainText}>Tap to upload exterior view</Text>
          <Text style={styles.uploadSubText}>
            Required for entrance identification
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.spacer} />

      <TouchableOpacity style={styles.continueButton} onPress={onNext}>
        <Text style={styles.continueButtonText}>Continue</Text>
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
});
