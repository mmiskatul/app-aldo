import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Header from "../../../components/ui/Header";
import BottomActions from "../../../components/home/upload-invoice/BottomActions";
import ExtractionStatus from "../../../components/home/upload-invoice/ExtractionStatus";
import LineItems from "../../../components/home/upload-invoice/LineItems";
import SupplierInfo from "../../../components/home/upload-invoice/SupplierInfo";
import UploadActions from "../../../components/home/upload-invoice/UploadActions";

export default function UploadInvoiceScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    type: "image" | "pdf";
    name: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({
        tabBarStyle: { display: "none" },
      });
      return () => {
        parent?.setOptions({
          tabBarStyle: {
            display: "flex",
            position: "absolute",
            backgroundColor: "#FFF0E5",
            borderTopLeftRadius: scale(20),
            borderTopRightRadius: scale(20),
            height: verticalScale(60),
            paddingBottom: verticalScale(8),
            paddingTop: verticalScale(8),
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
        });
      };
    }, [navigation]),
  );

  return (
    <View style={styles.container}>
      <Header title="Upload Invoice" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerSubtitle}>
          Upload supplier invoices and let AI extract important data
          automatically.
        </Text>

      {!selectedFile ? (
        <UploadActions onFileSelected={setSelectedFile} />
      ) : (
        <View style={styles.previewContainer}>
          {selectedFile.type === "image" ? (
            <Image
              source={{ uri: selectedFile.uri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.pdfPreview}>
              <Feather
                name="file-text"
                size={moderateScale(32)}
                color="#111827"
              />
              <Text style={styles.pdfName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => setSelectedFile(null)}
          >
            <Feather name="x" size={moderateScale(16)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <ExtractionStatus />

      <Text style={styles.sectionTitle}>Supplier Information</Text>
      <SupplierInfo />

      <Text style={styles.sectionTitle}>Line Items</Text>
      <LineItems isEditing={isEditing} />

      <View style={styles.spacer} />

      <BottomActions
        isEditing={isEditing}
        onEditPress={() => setIsEditing(!isEditing)}
        onConfirmPress={() => {
          if (router.canGoBack()) {
            router.dismissAll();
          }
          router.replace("/(tabs)/documents");
        }}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
  },
  headerTitle: {
    fontSize: moderateScale(28, 0.3),
    fontWeight: "800",
    color: "#111827",
    marginBottom: verticalScale(8),
  },
  headerSubtitle: {
    fontSize: moderateScale(14, 0.3),
    color: "#6B7280",
    lineHeight: moderateScale(22, 0.3),
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginBottom: verticalScale(16),
  },
  previewContainer: {
    width: "100%",
    height: verticalScale(180),
    borderRadius: scale(16),
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    marginBottom: verticalScale(24),
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  pdfPreview: {
    alignItems: "center",
    padding: scale(20),
  },
  pdfName: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14, 0.3),
    fontWeight: "600",
    color: "#111827",
  },
  removeButton: {
    position: "absolute",
    top: scale(12),
    right: scale(12),
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  spacer: {
    flex: 1,
    minHeight: verticalScale(20),
  },
});
