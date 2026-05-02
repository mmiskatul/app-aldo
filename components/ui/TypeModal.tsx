import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { scale, moderateScale, verticalScale } from "react-native-size-matters";

interface TypeModalProps {
  visible: boolean;
  onClose: () => void;
  options: Array<string | { label: string; value: string }>;
  selectedValue: string;
  onSelect: (value: string) => void;
  title?: string;
}

export default function TypeModal({
  visible,
  onClose,
  options,
  selectedValue,
  onSelect,
  title = "Select Option",
}: TypeModalProps) {
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
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={moderateScale(24)} color="#111827" />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalScrollList}
            showsVerticalScrollIndicator={false}
          >
            {options.map((option, idx) => {
              const normalized = typeof option === "string"
                ? { label: option, value: option }
                : option;
              return (
              <TouchableOpacity
                key={`${normalized.value}-${idx}`}
                style={styles.modalDropdownItem}
                onPress={() => {
                  onSelect(normalized.value);
                  onClose();
                }}
              >
                <Text style={styles.modalDropdownItemText}>{normalized.label}</Text>
                {selectedValue === normalized.value && (
                  <Feather name="check" size={moderateScale(20)} color="#FA8C4C" />
                )}
              </TouchableOpacity>
            )})}
          </ScrollView>
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
    maxHeight: "75%",
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
  modalScrollList: {
    paddingVertical: verticalScale(10),
  },
  modalDropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(24),
  },
  modalDropdownItemText: {
    fontSize: moderateScale(16, 0.3),
    color: "#111827",
  },
});
