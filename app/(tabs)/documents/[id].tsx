import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import apiClient from "../../../api/apiClient";
import Header from "../../../components/ui/Header";
import { useAppStore } from "../../../store/useAppStore";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import DetailsActions from "../../../components/documents/document-details/DetailsActions";
import DocumentInformation from "../../../components/documents/document-details/DocumentInformation";
import DocumentPreview from "../../../components/documents/document-details/DocumentPreview";
import ExtractedData from "../../../components/documents/document-details/ExtractedData";
import { DetailRouteSkeleton } from "../../../components/ui/RouteSkeletons";
import { getApiBaseUrl } from "../../../utils/api";
import { getApiDisplayMessage, logApiError, showApiError } from "../../../utils/apiErrors";
import { useTranslation } from "../../../utils/i18n";
import { showDialog, showErrorMessage, showInfoMessage, showSuccessMessage } from "../../../utils/feedback";
const { StorageAccessFramework } = FileSystem;

export default function DocumentDetailsScreen() {
  const { t } = useTranslation();
  const { id, edit } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const tokens = useAppStore((state) => state.tokens);

  const [data, setData] = useState<any>(null);
  const [editableData, setEditableData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiUrl = getApiBaseUrl();

  const fetchDetails = async () => {
    try {
      setErrorMessage(null);
      const response = await apiClient.get(
        `/api/v1/restaurant/documents/${id}`,
      );
      setData(response.data);
    } catch (error) {
      logApiError("documents.detail", error);
      setErrorMessage(getApiDisplayMessage(error, t('unable_to_load_item')));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!data) {
      return;
    }

    const subtotal = (data.line_items || []).reduce(
      (sum: number, item: any) => sum + (item.total_price || 0),
      0,
    );
    const vatAmount =
      data.vat_amount !== undefined ? data.vat_amount : subtotal * 0.1;
    const totalAmount =
      data.total_amount !== undefined
        ? data.total_amount
        : subtotal + vatAmount;

    setEditableData({
      ...data,
      supplier_name: data.counterparty_name || data.supplier_name || "",
      invoice_number: data.document_number || data.invoice_number || "",
      invoice_date: data.document_date || data.invoice_date || "",
      vat_amount: vatAmount,
      total_amount: totalAmount,
    });
    setIsEditing(true);
  };

  useEffect(() => {
    if (edit === "1" && data && !isEditing) {
      handleEdit();
    }
  }, [data, edit, isEditing]);

  const handleCancel = () => {
    setIsEditing(false);
    setEditableData(null);
  };

  const handleInfoChange = (key: string, value: string) => {
    setEditableData((prev: any) => {
      const newData = {
        ...prev,
        [key]:
          key === "total_amount" || key === "vat_amount"
            ? parseFloat(value) || 0
            : value,
      };

      // If user manually updates total, we'll let them, but usually it's driven by items
      // If we must 'calculate and add' from a base:
      if (key === "total_amount") {
        const baseAmount = parseFloat(value) || 0;
        newData.vat_amount = baseAmount * 0.1;
        newData.total_amount = baseAmount + newData.vat_amount;
      }

      return newData;
    });
  };

  const handleItemChange = (index: number, key: string, value: string) => {
    setEditableData((prev: any) => {
      const newItems = [...prev.line_items];
      newItems[index] = {
        ...newItems[index],
        [key]:
          key === "quantity" || key === "unit_price"
            ? parseFloat(value) || 0
            : value,
      };

      // Re-calculate total price for the item if quantity or unit_price changed
      if (key === "quantity" || key === "unit_price") {
        newItems[index].total_price =
          newItems[index].quantity * newItems[index].unit_price;
      }

      // Re-calculate overall amounts
      const subtotal = newItems.reduce(
        (sum, item) => sum + (item.total_price || 0),
        0,
      );
      const newVatAmount = subtotal * 0.1;
      const newTotalAmount = subtotal + newVatAmount;

      return {
        ...prev,
        line_items: newItems,
        total_amount: newTotalAmount,
        vat_amount: newVatAmount,
      };
    });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const response = await apiClient.patch(
        `/api/v1/restaurant/documents/${id}`,
        {
          supplier_name: editableData.supplier_name,
          invoice_number: editableData.invoice_number,
          invoice_date: editableData.invoice_date,
          total_amount: editableData.total_amount,
          line_items: editableData.line_items.map((item: any) => ({
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
          })),
        },
      );

      setData(response.data);
      setIsEditing(false);
      showSuccessMessage(t('document_updated'), t('success'));
    } catch (error) {
      showApiError("documents.update", error, t('document_update_failed'), t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showDialog(
      t('delete_document_title'),
      t('delete_document_msg'),
      [
        { text: t('cancel'), style: "cancel" },
        {
          text: t('delete'),
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              showInfoMessage('Deleting document...');
              await apiClient.delete(`/api/v1/restaurant/documents/${id}`);
              showSuccessMessage('Document deleted.');
              router.back();
            } catch (error) {
              showApiError("documents.delete", error, t('document_delete_failed'), t('error'));
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleDownload = async () => {
    if (!id || !tokens?.access_token) return;

    try {
      setDownloading(true);
      const downloadUrl = `${apiUrl}/api/v1/restaurant/documents/${id}/download?t=${Date.now()}`;
      const fileName = `invoice_${id}.pdf`;

      if (Platform.OS === "android") {
        const permissions =
          await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const fileUri = await StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            "application/pdf",
          );

          // Use a custom fetch/blob download since downloadAsync doesn't directly write to SAF URIs easily
          const response = await fetch(downloadUrl, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });
          const blob = await response.blob();

          // Need to convert blob to base64 to write to SAF
            const reader = new FileReader();
            reader.onload = async () => {
              const base64 = (reader.result as string).split(",")[1];
              await FileSystem.writeAsStringAsync(fileUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
              });
              showSuccessMessage(t('download_success'));
            };
            reader.readAsDataURL(blob);
          }
      } else {
        // iOS/Web fallback - on iOS users expect the Share Sheet to "Save to Files"
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri, {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        await Sharing.shareAsync(uri, {
          UTI: "com.adobe.pdf",
          mimeType: "application/pdf",
        });
      }
    } catch (error) {
      showApiError("documents.download", error, t('download_failed'));
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

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

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <Header title={t('document_details_title')} showBack={true} />
        <DetailRouteSkeleton />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.safeArea}>
        <Header title={t('document_details_title')} showBack={true} />
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle}>{errorMessage || t('unable_to_load_item')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void fetchDetails()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <Header title={t('document_details_title')} showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <DocumentPreview
          status={data.status === "processed" ? "Processed" : "Pending Review"}
          supplierName={data.counterparty_name || data.supplier_name}
          invoiceNumber={
            data.document_number ||
            data.invoice_number_display ||
            data.invoice_number
          }
          invoiceDate={data.document_date || data.invoice_date_formatted || data.invoice_date}
          totalAmount={data.total_amount}
          vatAmount={
            data.vat_amount !== undefined
              ? data.vat_amount
              : (data.line_items || []).reduce((sum: number, item: any) => sum + (item.total_price || 0), 0) * 0.1
          }
          lineItems={data.line_items || []}
        />

        <DocumentInformation
          supplierName={
            isEditing 
                ? editableData.supplier_name 
                : (data.counterparty_name || data.supplier_name)
          }
          invoiceNumber={
            isEditing
              ? editableData.invoice_number
              : (
                  data.document_number ||
                  data.invoice_number_display ||
                  data.invoice_number ||
                  "N/A"
                ).replace(/^Inv\s+/i, "")
          }
          totalAmount={
            isEditing
              ? String(editableData.total_amount)
              : `€${(data.total_amount !== undefined ? data.total_amount : (data.line_items || []).reduce((sum: number, item: any) => sum + (item.total_price || 0), 0) * 1.1).toFixed(2)}`
          }
          invoiceDate={
            isEditing
              ? editableData.invoice_date
              : (data.document_date || data.invoice_date_formatted || data.invoice_date || "N/A")
          }
          uploadDate={
            (data.upload_date_formatted || data.upload_date || "N/A").split(
              "T",
            )[0]
          }
          vatAmount={
            isEditing
              ? String(editableData.vat_amount?.toFixed(2))
              : `€${(data.vat_amount !== undefined ? data.vat_amount : (data.line_items || []).reduce((sum: number, item: any) => sum + (item.total_price || 0), 0) * 0.1).toFixed(2)}`
          }
          isEditing={isEditing}
          onChange={handleInfoChange}
        />

        <ExtractedData
          items={(isEditing
            ? editableData.line_items
            : data.line_items || []
          ).map((item: any, idx: number) => ({
            id: String(idx),
            name: item.product_name,
            qty: item.quantity,
            unitPrice: isEditing
              ? String(item.unit_price)
              : `€${item.unit_price.toFixed(2)}`,
            totalPrice: `€${item.total_price.toFixed(2)}`,
          }))}
          isEditing={isEditing}
          onItemChange={handleItemChange}
        />

        <DetailsActions
          onDownload={handleDownload}
          onDelete={handleDelete}
          isEditing={isEditing}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onUpdate={handleUpdate}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(16),
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(40),
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: scale(24),
  },
  errorTitle: {
    fontSize: moderateScale(18, 0.3),
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
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(13, 0.3),
    fontWeight: "700",
  },
});
