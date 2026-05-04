import React from "react";
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import Skeleton, { SkeletonCard } from "../ui/Skeleton";
import { useTranslation } from "../../utils/i18n";
import { formatEuropeanDate } from "../../utils/date";

interface DocumentProp {
  id: string;
  supplier: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  itemCount: number;
  status: "Processed" | "Pending Review";
  tag: string;
}

interface RecentDocumentsListProps {
  documents?: any[];
  loading?: boolean;
  headerContent?: React.ReactNode;
  emptyContent?: React.ReactNode;
  refreshControl?: React.ReactElement | undefined;
}

const formatDocumentDate = (value?: string | null) => {
  return formatEuropeanDate(value);
};

const formatCurrency = (value: unknown) => {
  const amount = Number(value || 0);
  return `€${(Number.isFinite(amount) ? amount : 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const DocumentCard = React.memo(function DocumentCard({
  doc,
  onOpen,
  onEdit,
}: {
  doc: DocumentProp;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const { t } = useTranslation();
  const isPending = doc.status === "Pending Review";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleBlock}>
          <Text style={styles.supplierName} numberOfLines={1}>{doc.supplier}</Text>
          <Text style={styles.invoiceDetails} numberOfLines={1}>
            Inv #{doc.invoiceNumber} - {doc.date}
          </Text>
        </View>
        <View style={[styles.statusBadge, isPending ? styles.statusWarning : styles.statusSuccess]}>
          <Text style={[styles.statusText, isPending ? styles.statusWarningText : styles.statusSuccessText]}>
            {isPending ? t("status_pending") : t("status_processed")}
          </Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amountText}>{doc.amount}</Text>
        <View style={styles.metaBox}>
          <Text style={styles.itemCountText}>{doc.itemCount} {t("items")}</Text>
          <View style={styles.divider} />
          <Text style={[styles.tagText, isPending && styles.tagWarningText]} numberOfLines={1}>
            {doc.tag}
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onOpen(doc.id)} activeOpacity={0.75}>
          <Feather name="eye" size={moderateScale(13)} color="#4B5563" style={styles.actionIcon} />
          <Text style={styles.actionButtonText}>{isPending ? t("review") : t("view")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(doc.id)} activeOpacity={0.75}>
          <Feather name="edit-2" size={moderateScale(13)} color="#4B5563" style={styles.actionIcon} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const LoadingSkeletons = React.memo(function LoadingSkeletons() {
  return (
    <View>
      {Array.from({ length: 3 }).map((_, index) => (
        <SkeletonCard key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Skeleton width={scale(120)} height={moderateScale(14)} borderRadius={7} />
              <Skeleton
                width={scale(94)}
                height={moderateScale(10)}
                borderRadius={5}
                style={{ marginTop: verticalScale(6) }}
              />
            </View>
            <Skeleton width={scale(76)} height={moderateScale(22)} borderRadius={11} />
          </View>
          <View style={styles.amountRow}>
            <Skeleton width={scale(84)} height={moderateScale(20)} borderRadius={8} />
            <Skeleton width={scale(120)} height={moderateScale(12)} borderRadius={6} />
          </View>
          <Skeleton width="100%" height={moderateScale(38)} borderRadius={8} />
        </SkeletonCard>
      ))}
    </View>
  );
});

export default function RecentDocumentsList({
  documents,
  loading = false,
  headerContent,
  emptyContent,
  refreshControl,
}: RecentDocumentsListProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const displayDocs: DocumentProp[] = React.useMemo(
    () =>
      (documents || []).map((item) => ({
        id: item.id,
        supplier: item.counterparty_name || item.supplier_name || "Unknown Supplier",
        invoiceNumber: item.document_number || item.invoice_number || "N/A",
        date: formatDocumentDate(
          item.document_date || item.invoice_date_formatted || item.invoice_date || item.upload_date,
        ),
        amount: formatCurrency(item.total_amount),
        itemCount: item.line_item_count || 0,
        status: item.status === "processed" ? "Processed" : "Pending Review",
        tag: item.status === "processed" ? (item.line_item_count ? "AUTO-CATEGORIZED" : "VERIFIED") : "PENDING",
      })),
    [documents],
  );

  const handleOpenDocument = React.useCallback(
    (documentId: string) => {
      router.push(`/(tabs)/documents/${documentId}` as any);
    },
    [router],
  );

  const handleEditDocument = React.useCallback(
    (documentId: string) => {
      router.push(`/(tabs)/documents/${documentId}?edit=1` as any);
    },
    [router],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: DocumentProp }) => (
      <DocumentCard doc={item} onOpen={handleOpenDocument} onEdit={handleEditDocument} />
    ),
    [handleEditDocument, handleOpenDocument],
  );

  const listHeader = React.useMemo(
    () => (
      <View>
        {headerContent}
        <Text style={styles.sectionTitle}>{t("recent_documents")}</Text>
      </View>
    ),
    [headerContent, t],
  );

  const listEmpty = React.useMemo(() => {
    if (loading) {
      return <LoadingSkeletons />;
    }

    if (emptyContent) {
      return <>{emptyContent}</>;
    }

    return (
      <View style={styles.emptyStateContainer}>
        <Feather name="file-text" size={moderateScale(48)} color="#E5E7EB" />
        <Text style={styles.emptyStateText}>{t("no_documents")}</Text>
        <Text style={styles.emptyStateSubtext}>{t("no_documents_subtext")}</Text>
      </View>
    );
  }, [emptyContent, loading, t]);

  return (
    <FlatList
      data={loading ? [] : displayDocs}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      removeClippedSubviews
      initialNumToRender={4}
      maxToRenderPerBatch={6}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(12),
    paddingBottom: verticalScale(100),
  },
  sectionTitle: {
    fontSize: moderateScale(13, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(8),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    borderRadius: scale(8),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(14),
    marginBottom: verticalScale(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(12),
  },
  titleBlock: {
    flex: 1,
    paddingRight: scale(10),
  },
  supplierName: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(4),
  },
  invoiceDetails: {
    fontSize: moderateScale(11, 0.3),
    color: "#6B7280",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: scale(9),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  statusSuccess: {
    backgroundColor: "#DCFCE7",
  },
  statusWarning: {
    backgroundColor: "#FFF4E5",
  },
  statusText: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: "700",
  },
  statusSuccessText: {
    color: "#16A34A",
  },
  statusWarningText: {
    color: "#D97706",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  amountText: {
    fontSize: moderateScale(17, 0.3),
    fontWeight: "900",
    color: "#111827",
  },
  metaBox: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginLeft: scale(10),
  },
  itemCountText: {
    fontSize: moderateScale(9, 0.3),
    fontWeight: "800",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  divider: {
    width: 1,
    height: verticalScale(10),
    backgroundColor: "#E5E7EB",
    marginHorizontal: scale(8),
  },
  tagText: {
    flexShrink: 1,
    fontSize: moderateScale(9, 0.3),
    fontWeight: "800",
    color: "#9CA3AF",
  },
  tagWarningText: {
    color: "#D97706",
  },
  actionRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingVertical: verticalScale(9),
    borderRadius: scale(8),
  },
  actionIcon: {
    marginRight: scale(6),
  },
  actionButtonText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: "700",
    color: "#4B5563",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(40),
    backgroundColor: "#FFFFFF",
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderStyle: "dashed",
  },
  emptyStateText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginTop: verticalScale(12),
  },
  emptyStateSubtext: {
    fontSize: moderateScale(13, 0.3),
    color: "#6B7280",
    marginTop: verticalScale(4),
  },
});
