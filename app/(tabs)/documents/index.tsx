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

export default function DocumentsScreen() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [bannerData, setBannerData] = useState({ title: "", subtitle: "" });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await apiClient.get("/api/v1/restaurant/documents");
      console.log("Documents Fetch Response [0]:", JSON.stringify(response.data.items?.[0], null, 2));
      setDocuments(response.data.items || []);
      setBannerData({
        title: response.data.ai_banner_title,
        subtitle: response.data.ai_banner_subtitle,
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
      fetchDocuments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
  };

  return (
    <View style={styles.container}>
      <Header title="Documents" showBell={true} />
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
            <Text style={styles.uploadBtnText}>Upload Invoice</Text>
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
