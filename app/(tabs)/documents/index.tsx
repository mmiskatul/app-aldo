import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Header from "../../../components/ui/Header";
import AIExtractionBanner from "../../../components/documents/AIExtractionBanner";
import RecentDocumentsList from "../../../components/documents/RecentDocumentsList";
import { useCachedFocusRefresh } from "../../../hooks/useCachedFocusRefresh";
import apiClient from "../../../api/apiClient";
import { useAppStore } from "../../../store/useAppStore";
import { getApiDisplayMessage, logApiError } from "../../../utils/apiErrors";
import { useTranslation } from "../../../utils/i18n";
 
const DOCUMENTS_CACHE_TTL_MS = 60 * 1000;

export default function DocumentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const documentsScreenCache = useAppStore((state) => state.documentsScreenCache);
  const setDocumentsScreenCache = useAppStore((state) => state.setDocumentsScreenCache);
  const hasCachedContent =
    documentsScreenCache.documents.length > 0 ||
    Boolean(documentsScreenCache.bannerData.title || documentsScreenCache.bannerData.subtitle);
  const [loading, setLoading] = useState(!hasCachedContent);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
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
    } catch (error) {
      logApiError("documents.fetch", error);
      if (!silent || !hasCachedContent) {
        setError(getApiDisplayMessage(error, "Unable to load documents."));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [hasCachedContent, setDocumentsScreenCache]);

  useCachedFocusRefresh({
    hasCache: hasCachedContent,
    fetchedAt: documentsScreenCache.fetchedAt,
    ttlMs: DOCUMENTS_CACHE_TTL_MS,
    loadOnEmpty: () => {
      void fetchDocuments(false);
    },
    refreshStale: () => {
      void fetchDocuments(true);
    },
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchDocuments(false);
  }, [fetchDocuments]);

  return (
    <View style={styles.container}>
      <Header title={t('documents_title')} showBell={true} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FA8C4C"]}
          />
        }
      >
        <View style={styles.actionRowContainer}>
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => router.push("/(tabs)/documents/upload-invoice")}
          >
            <Feather
              name="file-plus"
              size={moderateScale(14)}
              color="#FFFFFF"
              style={{ marginRight: scale(6) }}
            />
            <Text style={styles.uploadBtnText}>{t('upload_invoice')}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <RecentDocumentsList documents={[]} loading={true} />
        ) : error && !hasCachedContent ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void fetchDocuments(false)}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <AIExtractionBanner
              title={documentsScreenCache.bannerData.title}
              subtitle={documentsScreenCache.bannerData.subtitle}
            />
            <RecentDocumentsList documents={documentsScreenCache.documents} loading={false} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
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
