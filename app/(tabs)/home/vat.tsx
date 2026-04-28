import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Cash01Icon, Invoice03Icon } from "@hugeicons/core-free-icons";
import * as HugeiconsModule from "@hugeicons/react-native";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Header from '../../../components/ui/Header';
import VatBalance from '../../../components/home/VatBalance'; 
import { ListRouteSkeleton } from '../../../components/ui/RouteSkeletons';
import apiClient from "../../../api/apiClient";
import { useAppStore } from "../../../store/useAppStore"; 
import { showErrorMessage } from "../../../utils/feedback";

// @ts-ignore
const HugeiconsIcon = HugeiconsModule.HugeiconsIcon || HugeiconsModule.default?.HugeiconsIcon || (HugeiconsModule as any);

export default function VatScreen() {
  const navigation = useNavigation();
  const vatOverviewData = useAppStore((state) => state.vatOverviewData);
  const setVatOverviewData = useAppStore((state) => state.setVatOverviewData);
  const [loading, setLoading] = useState(!vatOverviewData);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVatOverview = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/v1/restaurant/vat/overview");
      setVatOverviewData(res.data);
    } catch (error) {
      console.error("Error fetching VAT overview:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setVatOverviewData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVatOverview();
  }, [fetchVatOverview]);

  const generatePdf = async () => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #111827; }
              h1 { color: #FA8C4C; margin-bottom: 5px; }
              .header { border-bottom: 2px solid #F3F4F6; padding-bottom: 20px; margin-bottom: 30px; }
              .date { color: #6B7280; font-size: 14px; }
              .summary-box { background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
              h2 { font-size: 16px; color: #6B7280; margin-top: 0; text-transform: uppercase; letter-spacing: 1px; }
              .amount { font-size: 32px; font-weight: bold; margin: 10px 0 0 0; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th, td { text-align: left; padding: 15px; border-bottom: 1px solid #E5E7EB; }
              th { background-color: #F9FAFB; color: #6B7280; font-weight: 600; text-transform: uppercase; font-size: 12px; }
              .positive { color: #10B981; }
              .negative { color: #EF4444; }
              .footer { margin-top: 50px; text-align: center; color: #9CA3AF; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>VAT Report</h1>
              <p class="date">Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="summary-box">
              <h2>Estimated VAT Balance</h2>
              <p class="amount">€${vatOverviewData?.estimated_vat_balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>VAT Payable</td>
                  <td>€${vatOverviewData?.vat_payable?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}</td>
                </tr>
                <tr>
                  <td>VAT Recoverable</td>
                  <td class="positive">€${vatOverviewData?.vat_receivable?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}</td>
                </tr>
                <tr>
                  <td><strong>Net VAT</strong></td>
                  <td><strong>€${vatOverviewData?.estimated_vat_balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <p><strong>Filing Deadline:</strong> ${vatOverviewData?.filing_deadline ? new Date(vatOverviewData.filing_deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
            
            <div class="footer">
              <p>This report is generated automatically from your fetched invoices and receipts.</p>
            </div>
          </body>
        </html>
      `;
      
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        showErrorMessage("Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      showErrorMessage("Failed to generate VAT report PDF.");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchVatOverview();

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
    }, [navigation])
  );

  return (
    <View style={styles.container}>
      <Header title="VAT" showBack={true} />
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FA8C4C"]} />}
      >
      {loading && !vatOverviewData ? (
        <ListRouteSkeleton itemCount={3} />
      ) : (
        <>
          {/* VAT Card */}
          <VatBalance balance={vatOverviewData?.estimated_vat_balance ?? 0} />

      <Text style={styles.sectionTitle}>Monthly Breakdown</Text>

      {/* VAT Payable Card */}
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownHeader}>
          <View>
            <Text style={styles.breakdownLabel}>VAT PAYABLE</Text>
            <Text style={styles.breakdownAmount}>€{vatOverviewData?.vat_payable?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) ?? '0.00'}</Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: '#FFF0E5' }]}>
            <HugeiconsIcon icon={Cash01Icon} size={moderateScale(24)} color="#FA8C4C" />
          </View>
        </View>
        <View style={styles.breakdownFooter}>
          <Feather name="info" size={moderateScale(12)} color="#9CA3AF" />
          <Text style={styles.breakdownFooterText}>Calculated from all automatically fetched invoices</Text>
        </View>
      </View>

      {/* VAT Recoverable Card */}
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownHeader}>
          <View>
            <Text style={styles.breakdownLabel}>VAT RECOVERABLE</Text>
            <Text style={styles.breakdownAmount}>€{vatOverviewData?.vat_receivable?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) ?? '0.00'}</Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: '#E6F4EA' }]}>
            <HugeiconsIcon icon={Invoice03Icon} size={moderateScale(24)} color="#10B981" />
          </View>
        </View>
      </View>
      
      <View style={styles.spacer} />

      {/* Action Buttons */}
      <TouchableOpacity style={styles.fileReturnButton} activeOpacity={0.8}>
        <View>
          <Text style={styles.fileReturnTitle}>File VAT Return</Text>
          <Text style={styles.fileReturnSubtitle}>Deadline: {vatOverviewData?.filing_deadline ? new Date(vatOverviewData.filing_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</Text>
        </View>
        <View style={styles.reviewPill}>
          <Text style={styles.reviewPillText}>Review</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.downloadButton} activeOpacity={0.8} onPress={generatePdf}>
        <Feather name="download" size={moderateScale(18)} color="#FFFFFF" />
        <Text style={styles.downloadButtonText}>Download VAT Report</Text>
      </TouchableOpacity>
      </>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(40),
  },
  sectionTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#111827',
    marginBottom: verticalScale(16),
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: moderateScale(11, 0.3),
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: verticalScale(4),
  },
  breakdownAmount: {
    fontSize: moderateScale(28, 0.3),
    fontWeight: '800',
    color: '#111827',
  },
  iconBox: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(12),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  breakdownFooterText: {
    fontSize: moderateScale(11, 0.3),
    color: '#9CA3AF',
    marginLeft: scale(6),
  },
  spacer: {
    height: verticalScale(16),
  },
  fileReturnButton: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(16),
    padding: scale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  fileReturnTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: verticalScale(4),
  },
  fileReturnSubtitle: {
    fontSize: moderateScale(13, 0.3),
    color: 'rgba(255,255,255,0.8)',
  },
  reviewPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: scale(20),
  },
  reviewPillText: {
    fontSize: moderateScale(14, 0.3),
    fontWeight: '700',
    color: '#FA8C4C',
  },
  downloadButton: {
    backgroundColor: '#FA8C4C',
    borderRadius: scale(16),
    padding: scale(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: scale(8),
  },
});
