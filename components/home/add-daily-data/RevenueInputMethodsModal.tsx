import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

interface RevenueInputMethodsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function RevenueInputMethodsModal({
  visible,
  onClose,
}: RevenueInputMethodsModalProps) {
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

          <Text style={styles.title}>Revenue Input Methods</Text>
          <Text style={styles.subtitle}>
            Choose the logic that fits your restaurant's operational flow.
          </Text>

          <View style={styles.methodBlock}>
            <View style={styles.methodTitleRow}>
              <Text style={styles.methodTitle}>Method 1</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>DETAILED</Text>
              </View>
            </View>
            <Text style={styles.methodDescription}>
              Best for restaurants that track detailed daily financial operations. Allows detailed tracking of cash register activity including cash in, cash out, withdrawals, and cash expenses.
            </Text>
          </View>

          <View style={styles.methodBlock}>
            <View style={styles.methodTitleRow}>
              <Text style={styles.methodTitle}>Method 2</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>SMART</Text>
              </View>
            </View>
            <Text style={styles.methodDescription}>
              Simplified input for restaurants that already know their daily revenue breakdown. Uses only enter payment types and customer covers, while the system helps estimate the cash balance using opening and closing cash.
            </Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
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
