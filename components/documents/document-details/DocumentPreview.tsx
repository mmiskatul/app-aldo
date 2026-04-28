import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { useTranslation } from "../../../utils/i18n";

type DocumentPreviewLineItem = {
  product_name?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
};

interface DocumentPreviewProps {
  status: string;
  supplierName?: string | null;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  totalAmount?: number;
  vatAmount?: number;
  lineItems?: DocumentPreviewLineItem[];
}

const formatCurrency = (value: number | undefined) =>
  `\u20AC${(value || 0).toFixed(2)}`;

export default function DocumentPreview({
  status,
  supplierName,
  invoiceNumber,
  invoiceDate,
  totalAmount,
  vatAmount,
  lineItems = [],
}: DocumentPreviewProps) {
  const { t } = useTranslation();
  const previewItems = lineItems.slice(0, 5);
  const subtotal =
    typeof totalAmount === "number" && typeof vatAmount === "number"
      ? Math.max(totalAmount - vatAmount, 0)
      : previewItems.reduce((sum, item) => sum + Number(item.total_price || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("document_preview")}</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <View style={styles.previewCard}>
        <View style={styles.invoiceSheet}>
          <View style={styles.invoiceTopRow}>
            <View>
              <Text style={styles.invoiceHeading}>{t("invoice")}</Text>
              <Text style={styles.mutedText}>{supplierName || "Supplier"}</Text>
            </View>
            <View style={styles.metaGroup}>
              <Text style={styles.metaLabel}>No.</Text>
              <Text style={styles.metaValue}>{invoiceNumber || "N/A"}</Text>
              <Text style={[styles.metaLabel, styles.metaGap]}>Date</Text>
              <Text style={styles.metaValue}>{invoiceDate || "N/A"}</Text>
            </View>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.itemColumn]}>Item</Text>
            <Text style={styles.tableHeaderText}>Qty</Text>
            <Text style={styles.tableHeaderText}>Total</Text>
          </View>

          {previewItems.length > 0 ? (
            previewItems.map((item, index) => (
              <View key={`${item.product_name || "item"}-${index}`} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.itemColumn]} numberOfLines={1}>
                  {item.product_name || "Line item"}
                </Text>
                <Text style={styles.tableCell}>{item.quantity ?? 0}</Text>
                <Text style={styles.tableCell}>{formatCurrency(item.total_price)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No line items available</Text>
            </View>
          )}

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VAT</Text>
              <Text style={styles.summaryValue}>{formatCurrency(vatAmount)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(24),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  title: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4EA",
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  statusDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: "#10B981",
    marginRight: scale(4),
  },
  statusText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: "600",
    color: "#10B981",
  },
  previewCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: scale(16),
    padding: scale(10),
  },
  invoiceSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    padding: scale(16),
    minHeight: verticalScale(280),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  invoiceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(18),
  },
  invoiceHeading: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(4),
    letterSpacing: 0.8,
  },
  mutedText: {
    fontSize: moderateScale(11, 0.3),
    color: "#6B7280",
    maxWidth: scale(140),
  },
  metaGroup: {
    alignItems: "flex-end",
    maxWidth: scale(120),
  },
  metaLabel: {
    fontSize: moderateScale(10, 0.3),
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  metaGap: {
    marginTop: verticalScale(6),
  },
  metaValue: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: verticalScale(8),
    marginBottom: verticalScale(6),
  },
  tableHeaderText: {
    flex: 0.8,
    fontSize: moderateScale(10, 0.3),
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  itemColumn: {
    flex: 1.8,
    paddingRight: scale(8),
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: verticalScale(6),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tableCell: {
    flex: 0.8,
    fontSize: moderateScale(11, 0.3),
    color: "#111827",
  },
  emptyRow: {
    paddingVertical: verticalScale(18),
    alignItems: "center",
  },
  emptyText: {
    fontSize: moderateScale(12, 0.3),
    color: "#9CA3AF",
  },
  summarySection: {
    marginTop: verticalScale(14),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(6),
  },
  summaryLabel: {
    fontSize: moderateScale(11, 0.3),
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  totalRow: {
    marginTop: verticalScale(4),
    paddingTop: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: "800",
    color: "#111827",
  },
  totalValue: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: "800",
    color: "#111827",
  },
});
