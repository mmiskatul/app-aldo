import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { scale, moderateScale, verticalScale } from "react-native-size-matters";
import { useTranslation } from "../../utils/i18n";

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCameraSelect: () => void;
  onGallerySelect: () => void;
}

export default function ImagePickerModal({
  visible,
  onClose,
  onCameraSelect,
  onGallerySelect,
}: ImagePickerModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t("upload_photo")}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={moderateScale(24)} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={onCameraSelect}>
              <View style={styles.iconCircle}>
                <Feather name="camera" size={moderateScale(22)} color="#FA8C4C" />
              </View>
              <Text style={styles.optionText}>{t("take_photo")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={onGallerySelect}>
              <View style={styles.iconCircle}>
                <Feather name="image" size={moderateScale(22)} color="#FA8C4C" />
              </View>
              <Text style={styles.optionText}>{t("choose_from_gallery")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingBottom: verticalScale(40),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  optionsContainer: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(16),
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(16),
  },
  iconCircle: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: "#FFF9F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(16),
  },
  optionText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "600",
    color: "#111827",
  },
});
