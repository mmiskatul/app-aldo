import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
} from "react-native-heroicons/outline";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTranslation } from "../../utils/i18n";

interface ActionFilterBarProps {
  activePeriod: string;
  availablePeriods: string[];
  onPeriodChange: (period: string) => void;
  onExport?: (format: "pdf" | "excel") => void;
  dropdownTop?: number;
}

export default function ActionFilterBar({
  activePeriod,
  availablePeriods,
  onPeriodChange,
  onExport,
  dropdownTop = verticalScale(165),
}: ActionFilterBarProps) {
  const { t } = useTranslation();
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);

  const formatPeriod = (p: string) => t(p as any);

  useFocusEffect(
    React.useCallback(() => {
      setIsExportMenuOpen(false);
      setIsPeriodMenuOpen(false);
      return () => {
        setIsExportMenuOpen(false);
        setIsPeriodMenuOpen(false);
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <View style={styles.actionsGroup}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setIsExportMenuOpen(true)}
        >
          <ArrowDownTrayIcon size={moderateScale(14)} color="#111827" />
          <Text style={styles.actionText}>{t("export_data")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIsPeriodMenuOpen(true)}
        >
          <Text style={styles.filterText}>{formatPeriod(activePeriod)}</Text>
          <ChevronDownIcon size={moderateScale(14)} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Export Dropdown Modal */}
      <Modal
        visible={isExportMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsExportMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsExportMenuOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.dropdownMenu, { right: scale(100), top: dropdownTop }]}
          >
            <TouchableOpacity
              style={styles.exportOptionBtn}
              onPress={() => {
                setIsExportMenuOpen(false);
                if (onExport) onExport("pdf");
              }}
            >
              <Text style={styles.exportOptionText}>PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportOptionBtn}
              onPress={() => {
                setIsExportMenuOpen(false);
                if (onExport) onExport("excel");
              }}
            >
              <Text style={styles.exportOptionText}>Excel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Period Selection Modal */}
      <Modal
        visible={isPeriodMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPeriodMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsPeriodMenuOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.dropdownMenu, { right: scale(20), top: dropdownTop }]}
          >
            {availablePeriods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.exportOptionBtn,
                  activePeriod === period && {
                    borderColor: "#FA8C4C",
                    backgroundColor: "#FFF0E5",
                  },
                ]}
                onPress={() => {
                  onPeriodChange(period.toLowerCase());
                  setIsPeriodMenuOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.exportOptionText,
                    activePeriod === period && { color: "#FA8C4C" },
                  ]}
                >
                  {formatPeriod(period)}
                </Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  spacer: {
    flex: 1,
  },
  actionsGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
    marginRight: scale(8),
  },
  actionText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: "600",
    color: "#374151",
    marginLeft: scale(6),
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0E5",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(8),
  },
  filterText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: "600",
    color: "#111827",
    marginRight: scale(6),
  },
  modalOverlay: {
    flex: 1,
  },
  dropdownMenu: {
    position: "absolute",
    // top is dynamically injected
    backgroundColor: "#E5E7EB", // Light grey container
    borderRadius: scale(8),
    padding: scale(6),
    width: scale(100),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  exportOptionBtn: {
    paddingVertical: verticalScale(6),
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: scale(4),
    marginBottom: verticalScale(6),
  },
  exportOptionText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: "500",
    color: "#111827",
  },
});
