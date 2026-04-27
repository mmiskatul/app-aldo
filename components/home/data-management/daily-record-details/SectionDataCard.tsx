import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export interface SectionDataField {
  key: string;
  label: string;
  value: number | string | null;
  value_type: "currency" | "integer" | "text";
}

interface SectionDataCardProps {
  title: string;
  fields: SectionDataField[];
}

const formatValue = (field: SectionDataField) => {
  if (field.value == null) {
    return "-";
  }

  if (field.value_type === "currency") {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(field.value) || 0);
  }

  if (field.value_type === "integer") {
    return Number(field.value || 0).toLocaleString("en-GB");
  }

  const text = String(field.value).trim();
  return text.length > 0 ? text : "-";
};

export default function SectionDataCard({ title, fields }: SectionDataCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {fields.map((field, index) => (
        <View
          key={field.key}
          style={[styles.row, index === fields.length - 1 ? styles.rowLast : null]}
        >
          <Text style={styles.label}>{field.label}</Text>
          <Text
            style={[
              styles.value,
              field.value_type === "text" ? styles.textValue : null,
            ]}
          >
            {formatValue(field)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginBottom: verticalScale(16),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: verticalScale(12),
    marginBottom: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  rowLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  label: {
    flex: 1,
    marginRight: scale(12),
    fontSize: moderateScale(13, 0.3),
    color: "#6B7280",
    fontWeight: "600",
  },
  value: {
    flex: 1,
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  textValue: {
    fontWeight: "500",
    lineHeight: moderateScale(20),
  },
});
