import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTranslation } from "../../../utils/i18n";

interface RevenueInputMethodsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function RevenueInputMethodsModal({
  visible,
  onClose,
}: RevenueInputMethodsModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalCard}>
          <View style={styles.handle} />

          <Text style={styles.title}>{t("revenue_input_methods_title")}</Text>
          <Text style={styles.subtitle}>
            {t("revenue_input_methods_subtitle")}
          </Text>

          <View style={styles.methodBlock}>
            <View style={styles.methodTitleRow}>
              <Text style={styles.methodTitle}>{t("method_1")}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t("detailed_badge")}</Text>
              </View>
            </View>
            <Text style={styles.methodDescription}>
              {t("method_1_description")}
            </Text>
          </View>

          <View style={styles.methodBlock}>
            <View style={styles.methodTitleRow}>
              <Text style={styles.methodTitle}>{t("method_2")}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t("smart_badge")}</Text>
              </View>
            </View>
            <Text style={styles.methodDescription}>
              {t("method_2_description")}
            </Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t("close")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(16),
  },
  modalCard: {
    width: "100%",
    maxWidth: scale(330),
    backgroundColor: "#FFFFFF",
    borderRadius: scale(28),
    paddingHorizontal: scale(30),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(26),
  },
  handle: {
    alignSelf: "center",
    width: scale(42),
    height: verticalScale(3),
    borderRadius: scale(2),
    backgroundColor: "#E5E7EB",
    marginBottom: verticalScale(16),
  },
  title: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(12, 0.3),
    color: "#6B7280",
    textAlign: "center",
    lineHeight: moderateScale(17, 0.3),
    marginBottom: verticalScale(22),
    paddingHorizontal: scale(10),
  },
  methodBlock: {
    borderLeftWidth: scale(2),
    borderLeftColor: "#FA8C4C",
    paddingLeft: scale(16),
    marginBottom: verticalScale(22),
  },
  methodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(7),
  },
  methodTitle: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginRight: scale(8),
  },
  badge: {
    backgroundColor: "#FFE8CC",
    borderRadius: scale(8),
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(2),
  },
  badgeText: {
    fontSize: moderateScale(7, 0.3),
    fontWeight: "800",
    color: "#C45B1D",
  },
  methodDescription: {
    fontSize: moderateScale(12, 0.3),
    color: "#4B5563",
    lineHeight: moderateScale(19, 0.3),
  },
  closeButton: {
    height: verticalScale(50),
    borderRadius: scale(8),
    backgroundColor: "#FF8748",
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(4),
  },
  closeButtonText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
