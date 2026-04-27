import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import apiClient from "../../../api/apiClient";
import { useAppStore } from "../../../store/useAppStore";
import { useTranslation } from "../../../utils/i18n";

const DOCUMENTS_CACHE_TTL_MS = 60 * 1000;

const isDocumentsCacheFresh = (fetchedAt: number | null) =>
  typeof fetchedAt === "number" && Date.now() - fetchedAt < DOCUMENTS_CACHE_TTL_MS;

export default function DocumentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const documentsScreenCache = useAppStore((state) => state.documentsScreenCache);
  const setDocumentsScreenCache = useAppStore((state) => state.setDocumentsScreenCache);
  const [documents, setDocuments] = useState<any[]>(documentsScreenCache.documents);
  const [bannerData, setBannerData] = useState(documentsScreenCache.bannerData);
  const [loading, setLoading] = useState(documentsScreenCache.documents.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocuments = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const response = await apiClient.get("/api/v1/restaurant/documents", {
        params: {
          page: 1,
          page_size: 12,
        },
      });
      const nextDocuments = response.data.items || [];
      const nextBanner = {
        title: response.data.ai_banner_title,
        subtitle: response.data.ai_banner_subtitle,
      };
      const fetchedAt = Date.now();
      setDocuments(nextDocuments);
      setBannerData(nextBanner);
      setDocumentsScreenCache({
        documents: nextDocuments,
        bannerData: nextBanner,
        fetchedAt,
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (documentsScreenCache.documents.length === 0) {
        void fetchDocuments(false);
        return;
      }

      if (!isDocumentsCacheFresh(documentsScreenCache.fetchedAt)) {
        void fetchDocuments(true);
      }
    }, [documentsScreenCache.documents.length, documentsScreenCache.fetchedAt])
  );

  const onRefresh = () => {
    setRefreshing(true);
    void fetchDocuments(true);
  };

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

        <AIExtractionBanner
          title={bannerData.title}
          subtitle={bannerData.subtitle}
        />
        <RecentDocumentsList documents={documents} loading={loading} />
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
});
