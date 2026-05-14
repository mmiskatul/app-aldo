import { useRouter } from "expo-router";
import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import apiClient from "../../../api/apiClient";
import AIExtractionBanner from "../../../components/documents/AIExtractionBanner";
import DocumentsHeader from "../../../components/documents/DocumentsHeader";
import RecentDocumentsList from "../../../components/documents/RecentDocumentsList";
import Header from "../../../components/ui/Header";
import StateCard from "../../../components/ui/StateCard";
import { useCachedFocusRefresh } from "../../../hooks/useCachedFocusRefresh";
import { useAppStore } from "../../../store/useAppStore";
import { getApiDisplayMessage, logApiError } from "../../../utils/apiErrors";
import { isNetworkLikeApiError } from "../../../utils/api";
import { useTranslation } from "../../../utils/i18n";
import { formatEuropeanDate } from "../../../utils/date";
import { normalizeDocumentsResponse } from "../../../utils/restaurantData";

const DOCUMENTS_CACHE_TTL_MS = 60 * 1000;

export default function DocumentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const documentsScreenCache = useAppStore((state) => state.documentsScreenCache);
  const setDocumentsScreenCache = useAppStore((state) => state.setDocumentsScreenCache);

  const hasFetchedDocuments = documentsScreenCache.fetchedAt !== null;
  const [loading, setLoading] = useState(!hasFetchedDocuments);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnectionError, setIsConnectionError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [supplierFilterIndex, setSupplierFilterIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "processed" | "pending">("all");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const fetchDocuments = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (!silent) {
      setLoading(true);
    }
    setError(null);
    setIsConnectionError(false);

    try {
      const response = await apiClient.get("/api/v1/restaurant/documents", {
        params: {
          page: 1,
          page_size: 50,
        },
      });
      const normalizedResponse = normalizeDocumentsResponse(response.data);

      setDocumentsScreenCache({
        documents: normalizedResponse.items,
        bannerData: normalizedResponse.bannerData,
        fetchedAt: Date.now(),
      });
    } catch (nextError) {
      logApiError("documents.fetch", nextError);
      setIsConnectionError(isNetworkLikeApiError(nextError));
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

  useCachedFocusRefresh({
    hasCache: hasFetchedDocuments,
    fetchedAt: documentsScreenCache.fetchedAt,
    ttlMs: DOCUMENTS_CACHE_TTL_MS,
    loadOnEmpty: () => {
      void fetchDocuments();
    },
    refreshStale: () => {
      void fetchDocuments({ silent: true });
    },
  });

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

    return [t("supplier"), ...Array.from(new Set(names.map((name) => name.trim())))];
  }, [documentsScreenCache.documents, t]);

  const supplierLabel = supplierOptions[supplierFilterIndex] || t("supplier");
  const statusDefaultLabel = t("status", { defaultValue: "Status" });
  const statusLabel =
    statusFilter === "processed" ? t("status_processed") : statusFilter === "pending" ? t("status_pending") : statusDefaultLabel;
  const dateLabel = selectedDate ? formatEuropeanDate(selectedDate) : t("date", { defaultValue: "Date" });

  const getDocumentDateKey = useCallback((value?: string | null) => {
    if (!value) {
      return "";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return String(value).slice(0, 10);
    }

    return parsed.toISOString().slice(0, 10);
  }, []);

  const filteredDocuments = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    const selectedSupplier = supplierFilterIndex === 0 ? null : supplierLabel.toLowerCase();
    const selectedDateKey = selectedDate ? selectedDate.toISOString().slice(0, 10) : null;

    const getSearchText = (item: typeof documentsScreenCache.documents[number]) =>
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

    const getSortDate = (item: typeof documentsScreenCache.documents[number]) => {
      const rawDate = item.document_date || item.invoice_date || item.upload_date || item.created_at;
      const parsed = rawDate ? Date.parse(String(rawDate)) : 0;
      return Number.isFinite(parsed) ? parsed : 0;
    };

    return [...documentsScreenCache.documents]
      .filter((item) => {
        if (query && !getSearchText(item).includes(query)) {
          return false;
        }

        if (selectedDateKey) {
          const itemDateKey = getDocumentDateKey(
            item.document_date || item.invoice_date || item.upload_date || item.created_at,
          );
          if (itemDateKey !== selectedDateKey) {
            return false;
          }
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
  }, [dateSort, deferredSearchQuery, documentsScreenCache.documents, getDocumentDateKey, selectedDate, statusFilter, supplierFilterIndex, supplierLabel]);

  const handleDateChange = useCallback((event: DateTimePickerEvent, nextDate?: Date) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    if (nextDate) {
      setSelectedDate(nextDate);
    }

    setShowDatePicker(false);
  }, []);

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
          statusDefaultLabel={statusDefaultLabel}
          onSearchChange={setSearchQuery}
          onDatePress={() => setShowDatePicker(true)}
          selectedDate={selectedDate || new Date()}
          showDatePicker={showDatePicker}
          onDateChange={handleDateChange}
          onDatePickerDone={() => setShowDatePicker(false)}
          onSupplierPress={handleSupplierPress}
          onStatusPress={handleStatusPress}
          onUploadPress={openUploadInvoice}
        />

        {!isConnectionError ? (
          <AIExtractionBanner
            title={documentsScreenCache.bannerData.title || t("ai_data_extraction_active", { defaultValue: "AI Data Extraction Active" })}
            subtitle={
              documentsScreenCache.bannerData.subtitle ||
              t("ai_data_extraction_subtitle", {
                defaultValue: "Risto AI automatically extracts supplier, date, line items, quantities, and unit prices from your uploads.",
              })
            }
          />
        ) : null}
      </>
    ),
    [
      documentsScreenCache.bannerData.subtitle,
      documentsScreenCache.bannerData.title,
      dateLabel,
      handleStatusPress,
      handleSupplierPress,
      handleDateChange,
      isConnectionError,
      openUploadInvoice,
      searchQuery,
      selectedDate,
      showDatePicker,
      statusLabel,
      statusDefaultLabel,
      supplierLabel,
      t,
    ],
  );

  const emptyContent = useMemo(() => {
    if (!error) {
      if (documentsScreenCache.documents.length === 0) {
        return null;
      }

      return (
        <StateCard
          title={t("no_documents")}
          description="No documents match the current filters. Try clearing search, supplier, or date filters."
        />
      );
    }

    return (
      <StateCard
        title={t("something_went_wrong")}
        description={error}
        tone="error"
        actionLabel={t("try_again")}
        actionLoading={loading}
        onAction={() => void fetchDocuments()}
      />
    );
  }, [documentsScreenCache.documents.length, error, fetchDocuments, loading, t]);

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
      <Header title={t("documents_title")} showBack={true} showBell={true} fallbackHref="/(tabs)/home" />
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
});
