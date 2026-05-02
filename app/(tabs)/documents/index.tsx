import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, RefreshControl } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import Header from "../../../components/ui/Header";
import AIExtractionBanner from "../../../components/documents/AIExtractionBanner";
import RecentDocumentsList from "../../../components/documents/RecentDocumentsList";
import apiClient from "../../../api/apiClient";
import { useAppStore } from "../../../store/useAppStore";
import { getApiDisplayMessage, logApiError } from "../../../utils/apiErrors";
import { useTranslation } from "../../../utils/i18n";
 
const DOCUMENTS_CACHE_TTL_MS = 60 * 1000;
const DOCUMENTS_PERF_TAG = "[documents.perf]";

export default function DocumentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const documentsScreenCache = useAppStore((state) => state.documentsScreenCache);
  const setDocumentsScreenCache = useAppStore((state) => state.setDocumentsScreenCache);
  const hasFetchedDocuments = documentsScreenCache.fetchedAt !== null;
  const hasCachedContent = useMemo(
    () =>
      documentsScreenCache.documents.length > 0 ||
      Boolean(documentsScreenCache.bannerData.title || documentsScreenCache.bannerData.subtitle),
    [documentsScreenCache.bannerData.subtitle, documentsScreenCache.bannerData.title, documentsScreenCache.documents.length],
  );
  const [loading, setLoading] = useState(!hasFetchedDocuments);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestInFlightRef = useRef(false);
  const fetchStartedAtRef = useRef<number | null>(null);
  const contentPaintLoggedRef = useRef(false);

  const now = useCallback(() => Date.now(), []);

  const fetchDocuments = useCallback(async (silent = false) => {
    if (requestInFlightRef.current) {
      console.log(`${DOCUMENTS_PERF_TAG} fetch_skip`, {
        reason: "request_in_flight",
        silent,
      });
      return;
    }

    requestInFlightRef.current = true;
    const fetchStartedAt = now();
    fetchStartedAtRef.current = fetchStartedAt;

    if (!silent) {
      setLoading(true);
    }
    setError(null);
    console.log(`${DOCUMENTS_PERF_TAG} fetch_start`, {
      silent,
      hasCachedContent,
    });
    try {
      const response = await apiClient.get("/api/v1/restaurant/documents", {
        params: {
          page: 1,
          page_size: 8,
        },
      });
      const nextDocuments = response.data.items || [];
      const nextBanner = {
        title: response.data.ai_banner_title,
        subtitle: response.data.ai_banner_subtitle,
      };
      const fetchedAt = Date.now();
      setDocumentsScreenCache({
        documents: nextDocuments,
        bannerData: nextBanner,
        fetchedAt,
      });
      console.log(`${DOCUMENTS_PERF_TAG} fetch_success`, {
        silent,
        apiMs: now() - fetchStartedAt,
        itemCount: nextDocuments.length,
      });
    } catch (error) {
      logApiError("documents.fetch", error);
      if (!silent || !hasCachedContent) {
        setError(getApiDisplayMessage(error, "Unable to load documents."));
      }
      console.log(`${DOCUMENTS_PERF_TAG} fetch_error`, {
        silent,
        apiMs: now() - fetchStartedAt,
      });
    } finally {
      requestInFlightRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [hasCachedContent, now, setDocumentsScreenCache]);

  const onRefresh = useCallback(() => {
    fetchStartedAtRef.current = null;
    contentPaintLoggedRef.current = false;
    console.log(`${DOCUMENTS_PERF_TAG} cycle_start`, {
      reason: "pull_to_refresh",
      hasCachedContent,
      cachedDocuments: documentsScreenCache.documents.length,
    });
    setRefreshing(true);
    void fetchDocuments(false);
  }, [documentsScreenCache.documents.length, fetchDocuments, hasCachedContent]);

  const openUploadInvoice = useCallback(() => {
    router.push("/(tabs)/documents/upload-invoice");
  }, [router]);

  const headerContent = useMemo(
    () => (
      <>
        <View style={styles.actionRowContainer}>
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={openUploadInvoice}
          >
            <Feather
              name="file-plus"
              size={moderateScale(14)}
              color="#FFFFFF"
              style={{ marginRight: scale(6) }}
            />
            <Text style={styles.uploadBtnText}>{t("upload_invoice")}</Text>
          </TouchableOpacity>
        </View>

        {loading && !hasCachedContent ? null : error && !hasCachedContent ? null : (
          <AIExtractionBanner
            title={documentsScreenCache.bannerData.title}
            subtitle={documentsScreenCache.bannerData.subtitle}
          />
        )}
      </>
    ),
    [
      documentsScreenCache.bannerData.subtitle,
      documentsScreenCache.bannerData.title,
      error,
      hasCachedContent,
      loading,
      openUploadInvoice,
      t,
    ],
  );

  const emptyContent = useMemo(() => {
    if (!error || hasCachedContent) {
      return null;
    }

    return (
      <View style={styles.errorCard}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => void fetchDocuments(false)}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }, [error, fetchDocuments, hasCachedContent]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={["#FA8C4C"]}
      />
    ),
    [onRefresh, refreshing],
  );

  useEffect(() => {
    if (hasFetchedDocuments) {
      setLoading(false);
      return;
    }

    fetchStartedAtRef.current = null;
    contentPaintLoggedRef.current = false;
    console.log(`${DOCUMENTS_PERF_TAG} cycle_start`, {
      reason: "initial_load",
      hasCachedContent,
      cachedDocuments: documentsScreenCache.documents.length,
    });
    void fetchDocuments(false);
  }, [documentsScreenCache.documents.length, fetchDocuments, hasCachedContent, hasFetchedDocuments]);

  useEffect(() => {
    if (loading || contentPaintLoggedRef.current) {
      return;
    }

    const hasVisibleState = hasFetchedDocuments || documentsScreenCache.documents.length > 0 || Boolean(error);

    if (!hasVisibleState) {
      return;
    }

    contentPaintLoggedRef.current = true;
    console.log(`${DOCUMENTS_PERF_TAG} content_ready`, {
      fetchToContentMs:
        fetchStartedAtRef.current == null ? null : now() - fetchStartedAtRef.current,
      itemCount: documentsScreenCache.documents.length,
      usedCache: hasFetchedDocuments && fetchStartedAtRef.current == null,
      hasError: Boolean(error),
    });
  }, [
    documentsScreenCache.documents.length,
    error,
    hasFetchedDocuments,
    loading,
    now,
  ]);

  return (
    <View style={styles.container}>
      <Header title={t('documents_title')} showBell={true} />
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
