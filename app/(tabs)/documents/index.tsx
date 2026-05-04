import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import apiClient from "../../../api/apiClient";
import AIExtractionBanner from "../../../components/documents/AIExtractionBanner";
import DocumentsHeader from "../../../components/documents/DocumentsHeader";
import RecentDocumentsList from "../../../components/documents/RecentDocumentsList";
import Header from "../../../components/ui/Header";
import { useAppStore } from "../../../store/useAppStore";
import { getApiDisplayMessage, logApiError } from "../../../utils/apiErrors";
import { useTranslation } from "../../../utils/i18n";

export default function DocumentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const documentsScreenCache = useAppStore((state) => state.documentsScreenCache);
  const setDocumentsScreenCache = useAppStore((state) => state.setDocumentsScreenCache);

  const hasFetchedDocuments = documentsScreenCache.fetchedAt !== null;
  const [loading, setLoading] = useState(!hasFetchedDocuments);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");
  const [supplierFilterIndex, setSupplierFilterIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "processed" | "pending">("all");

  const fetchDocuments = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (!silent) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await apiClient.get("/api/v1/restaurant/documents", {
        params: {
          page: 1,
          page_size: 50,
        },
      });

      setDocumentsScreenCache({
        documents: response.data.items || [],
        bannerData: {
          title: response.data.ai_banner_title,
          subtitle: response.data.ai_banner_subtitle,
        },
        fetchedAt: Date.now(),
      });
    } catch (nextError) {
      logApiError("documents.fetch", nextError);
      setError(getApiDisplayMessage(nextError, "Unable to load documents."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setDocumentsScreenCache]);

  useEffect(() => {
    if (hasFetchedDocuments) {
      setLoading(false);
      return;
    }

    void fetchDocuments();
  }, [fetchDocuments, hasFetchedDocuments]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchDocuments({ silent: true });
  }, [fetchDocuments]);

  const openUploadInvoice = useCallback(() => {
    router.push("/(tabs)/documents/upload-invoice");
  }, [router]);

  const supplierOptions = useMemo(() => {
    const names = documentsScreenCache.documents
      .map((item) => item.counterparty_name || item.supplier_name)
      .filter((name): name is string => typeof name === "string" && name.trim().length > 0);

    return ["Supplier", ...Array.from(new Set(names.map((name) => name.trim())))];
  }, [documentsScreenCache.documents]);

  const supplierLabel = supplierOptions[supplierFilterIndex] || "Supplier";
  const statusLabel =
    statusFilter === "processed" ? "Processed" : statusFilter === "pending" ? "Pending" : "Status";
  const dateLabel = dateSort === "newest" ? "Date" : "Oldest";

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const selectedSupplier = supplierLabel === "Supplier" ? null : supplierLabel.toLowerCase();

    const getSearchText = (item: any) =>
      [
        item.counterparty_name,
        item.supplier_name,
        item.document_number,
        item.invoice_number,
        item.document_date,
        item.invoice_date,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    const getSortDate = (item: any) => {
      const rawDate = item.document_date || item.invoice_date || item.upload_date || item.created_at;
      const parsed = rawDate ? Date.parse(String(rawDate)) : 0;
      return Number.isFinite(parsed) ? parsed : 0;
    };

    return [...documentsScreenCache.documents]
      .filter((item) => {
        if (query && !getSearchText(item).includes(query)) {
          return false;
        }

        if (selectedSupplier) {
          const itemSupplier = String(item.counterparty_name || item.supplier_name || "").toLowerCase();
          if (itemSupplier !== selectedSupplier) {
            return false;
          }
        }

        if (statusFilter === "processed" && item.status !== "processed") {
          return false;
        }

        if (statusFilter === "pending" && item.status === "processed") {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const direction = dateSort === "newest" ? -1 : 1;
        return (getSortDate(a) - getSortDate(b)) * direction;
      });
  }, [dateSort, documentsScreenCache.documents, searchQuery, statusFilter, supplierLabel]);

  const handleSupplierPress = useCallback(() => {
    setSupplierFilterIndex((current) => (current + 1) % Math.max(supplierOptions.length, 1));
  }, [supplierOptions.length]);

  const handleStatusPress = useCallback(() => {
    setStatusFilter((current) => {
      if (current === "all") {
        return "processed";
      }
      if (current === "processed") {
        return "pending";
      }
      return "all";
    });
  }, []);

  const headerContent = useMemo(
    () => (
      <>
        <DocumentsHeader
          searchQuery={searchQuery}
          dateLabel={dateLabel}
          supplierLabel={supplierLabel}
          statusLabel={statusLabel}
          onSearchChange={setSearchQuery}
          onDatePress={() => setDateSort((current) => (current === "newest" ? "oldest" : "newest"))}
          onSupplierPress={handleSupplierPress}
          onStatusPress={handleStatusPress}
          onUploadPress={openUploadInvoice}
        />

        <AIExtractionBanner
          title={documentsScreenCache.bannerData.title || "AI Data Extraction Active"}
          subtitle={
            documentsScreenCache.bannerData.subtitle ||
            "Risto AI automatically extracts supplier, date, line items, quantities, and unit prices from your uploads."
          }
        />
      </>
    ),
    [
      documentsScreenCache.bannerData.subtitle,
      documentsScreenCache.bannerData.title,
      dateLabel,
      handleStatusPress,
      handleSupplierPress,
      openUploadInvoice,
      searchQuery,
      statusLabel,
      supplierLabel,
    ],
  );

  const emptyContent = useMemo(() => {
    if (!error) {
      return null;
    }

    return (
      <View style={styles.errorCard}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => void fetchDocuments()}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }, [error, fetchDocuments]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        colors={["#FA8C4C"]}
      />
    ),
    [handleRefresh, refreshing],
  );

  return (
    <View style={styles.container}>
      <Header title={t("documents_title")} showBell={true} />
      <RecentDocumentsList
        documents={filteredDocuments}
        loading={loading}
        headerContent={headerContent}
        emptyContent={emptyContent}
        refreshControl={refreshControl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  errorCard: {
    marginHorizontal: scale(20),
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: "#FEE2E2",
    backgroundColor: "#FFF7F7",
    padding: scale(18),
    alignItems: "center",
  },
  errorTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#991B1B",
  },
  errorSubtitle: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(13, 0.3),
    color: "#7F1D1D",
    textAlign: "center",
  },
  retryButton: {
    marginTop: verticalScale(16),
    backgroundColor: "#FA8C4C",
    borderRadius: scale(12),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: moderateScale(13, 0.3),
    fontWeight: "700",
  },
});
