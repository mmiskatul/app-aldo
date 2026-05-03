import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import apiClient from "../../../api/apiClient";
import AIExtractionBanner from "../../../components/documents/AIExtractionBanner";
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

  const headerContent = useMemo(
    () => (
      <>
        <View style={styles.actionRowContainer}>
          <TouchableOpacity style={styles.uploadBtn} onPress={openUploadInvoice}>
            <Feather
              name="file-plus"
              size={moderateScale(14)}
              color="#FFFFFF"
              style={styles.uploadIcon}
            />
            <Text style={styles.uploadBtnText}>{t("upload_invoice")}</Text>
          </TouchableOpacity>
        </View>

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
      openUploadInvoice,
      t,
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
        documents={documentsScreenCache.documents}
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
  actionRowContainer: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(20),
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FA8C4C",
    paddingVertical: verticalScale(12),
    borderRadius: scale(12),
  },
  uploadIcon: {
    marginRight: scale(6),
  },
  uploadBtnText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: "700",
    color: "#FFFFFF",
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
