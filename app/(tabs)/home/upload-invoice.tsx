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
import apiClient from "../../../api/apiClient";
import BottomActions from "../../../components/home/upload-invoice/BottomActions";
import ExtractionStatus from "../../../components/home/upload-invoice/ExtractionStatus";
import LineItems from "../../../components/home/upload-invoice/LineItems";
import SupplierInfo from "../../../components/home/upload-invoice/SupplierInfo";
import UploadActions from "../../../components/home/upload-invoice/UploadActions";
import Header from "../../../components/ui/Header";
import { useAppStore } from "../../../store/useAppStore";

export default function UploadInvoiceScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const tokens = useAppStore((state) => state.tokens);

  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    type: "image" | "pdf";
    name: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractionData, setExtractionData] = useState<any>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileUpload = async (file: {
    uri: string;
    type: string;
    name: string;
  }) => {
    if (!tokens?.access_token) return;

    setIsExtracting(true);
    setUploadProgress(10); // Start progress indicating something is happening

    const formData = new FormData();
    // @ts-ignore - FormData expects an object with uri, type, name for React Native file uploads
    formData.append("file", {
      uri: file.uri,
      type: file.type === "pdf" ? "application/pdf" : "image/jpeg",
      name: file.name,
    });

    try {
      const response = await apiClient.post(
        "/api/v1/restaurant/documents/upload-extract",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 70) / progressEvent.total)
              : 30; // 70% for upload, 30% for AI processing
            setUploadProgress(10 + progress);
          },
        },
      );

      console.log("Uploaded Document Analysis Data:", JSON.stringify(response.data, null, 2));

      setExtractionData(response.data);
      if (response.data.line_items) {
        const mapped = response.data.line_items.map(
          (item: any, idx: number) => ({
            id: idx + 1,
            product: item.product_name || "",
            qty: String(item.quantity || ""),
            price: String(item.unit_price || ""),
            total: String(item.total_price || ""),
          }),
        );
        setLineItems(mapped);
      }
      setUploadProgress(100);
      setIsExtracting(false);
    } catch (error: any) {
      console.log("Upload Error:", error.response?.data || error.message);
      setIsExtracting(false);
      alert("Failed to extract data from invoice. Please try again.");
    }
  };

  const subtotal = lineItems.reduce(
    (acc, item) => acc + (parseFloat(item.total) || 0),
    0,
  );
  const vat = subtotal * 0.1;
  const totalAmount = subtotal + vat;

  const handleConfirmSave = async () => {
    if (!extractionData || !tokens?.access_token) return;

    setIsSaving(true);
    try {
      const payload = {
        supplier_name: extractionData.counterparty_name || "Unknown",
        invoice_number: extractionData.document_number || "Unknown",
        invoice_date:
          extractionData.document_date || new Date().toISOString().split("T")[0],
        total_amount: totalAmount,
        line_items: lineItems.map((item) => ({
          product_name: item.product,
          quantity: parseFloat(item.qty) || 0,
          unit_price: parseFloat(item.price) || 0,
          total_price: parseFloat(item.total) || 0,
        })),
        source_file_name: selectedFile?.name || "unnamed_file",
        ai_provider: extractionData.ai_provider || "openai",
        ai_summary: extractionData.ai_summary || "",
      };

      await apiClient.post(
        "/api/v1/restaurant/documents/confirm-save",
        payload,
      );

      alert("Invoice saved successfully!");
      if (router.canGoBack()) {
        router.dismissAll();
      }
      router.replace("/(tabs)/documents");
    } catch (error: any) {
      console.log("Save Error:", error.response?.data || error.message);
      alert("Failed to save invoice. Please check the data and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const onFileSelected = (
    file: { uri: string; type: "image" | "pdf"; name: string } | null,
  ) => {
    setSelectedFile(file);
    setExtractionData(null);
    if (file) {
      handleFileUpload(file);
    }
  };

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
      <Header title="Upload Invoice" showBack={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Upload supplier invoices and let AI extract important data
          automatically.
        </Text>

        {!selectedFile ? (
          <UploadActions onFileSelected={onFileSelected} />
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
              onPress={() => {
                setSelectedFile(null);
                setExtractionData(null);
                setIsExtracting(false);
              }}
            >
              <Feather name="x" size={moderateScale(16)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {(isExtracting || extractionData) && (
          <>
            {isExtracting && <ExtractionStatus progress={uploadProgress} />}

            {extractionData && (
              <>
                <Text style={styles.sectionTitle}>Supplier Information</Text>
                <SupplierInfo
                  name={extractionData.counterparty_name}
                  invoiceNumber={extractionData.document_number}
                  invoiceDate={extractionData.document_date}
                />

                <Text style={styles.sectionTitle}>Line Items</Text>
                <LineItems
                  isEditing={isEditing}
                  items={lineItems}
                  onItemsChange={setLineItems}
                  total={totalAmount}
                  subtotal={subtotal}
                  vat={vat}
                />

                <View style={styles.spacer} />

                <BottomActions
                  isEditing={isEditing}
                  isLoading={isSaving}
                  onEditPress={() => setIsEditing(!isEditing)}
                  onConfirmPress={handleConfirmSave}
                />
              </>
            )}
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
  content: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
  },
  description: {
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
