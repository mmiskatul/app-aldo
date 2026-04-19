import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTranslation } from "../../utils/i18n";

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLang: "en" | "it";
  onSelectLang: (lang: "en" | "it") => void;
}

export default function LanguageModal({
  visible,
  onClose,
  selectedLang,
  onSelectLang,
}: LanguageModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={[
              styles.langOptionBtn,
              selectedLang === "en" ? styles.langOptionBtnActive : null,
            ]}
            onPress={() => onSelectLang("en")}
          >
            <Text style={styles.flagEmoji}>🇺🇸</Text>
            <Text
              style={[
                styles.langOptionText,
                selectedLang === "en" ? styles.langOptionTextActive : null,
              ]}
            >
              {t('english')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langOptionBtn,
              selectedLang === "it" ? styles.langOptionBtnActive : null,
            ]}
            onPress={() => onSelectLang("it")}
          >
            <Text style={styles.flagEmoji}>🇮🇹</Text>
            <Text
              style={[
                styles.langOptionText,
                selectedLang === "it" ? styles.langOptionTextActive : null,
              ]}
            >
              {t('italian')}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  dropdownMenu: {
    position: "absolute",
    top: verticalScale(85), // Pushed further down
    right: scale(20),
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    padding: scale(8),
    width: scale(130), // Narrower
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  langOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(8), // Reduced
    paddingHorizontal: scale(10), // Reduced
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginBottom: verticalScale(6),
  },
  langOptionBtnActive: {
    borderColor: "#FDBA74",
    backgroundColor: "#FFEFE6",
  },
  flagEmoji: {
    fontSize: moderateScale(14), // Scaled down
    marginRight: scale(8),
  },
  langOptionText: {
    fontSize: moderateScale(12, 0.3), // Scaled down
    fontWeight: "600",
    color: "#374151",
  },
  langOptionTextActive: {
    color: "#FA8C4C",
  },
});
