import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import apiClient from "../../../api/apiClient";
import NetProfitCard from "../../../components/home/data-management/daily-record-details/NetProfitCard";
import SectionDataCard, {
  SectionDataField,
} from "../../../components/home/data-management/daily-record-details/SectionDataCard";
import Header from "../../../components/ui/Header";
import { getLocale, useTranslation } from "../../../utils/i18n";
import { generateDailyDataExcelExport, generateDailyDataPdfExport } from "../../../utils/exportData";
import { showErrorMessage } from "../../../utils/feedback";

type DetailSegment = "date" | "week" | "month";

interface DailyDataSection {
  key: string;
  title: string;
  fields: SectionDataField[];
}

interface DailyRecordDetail {
  id?: string;
  business_date: string;
  method?: string;
  total_revenue: number;
  total_expenses: number;
  invoice_document_total: number;
  total_covers: number;
  avg_revenue_per_cover: number;
  method_sections: DailyDataSection[];
}

interface DailyDataListItem {
  id: string;
  record_id?: string | null;
  business_date: string;
}

interface DailyDataListResponse {
  items: DailyDataListItem[];
}

const formatCurrency = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const formatBusinessDate = (value: string, segment: DetailSegment, locale: string, weekOf: (date: string) => string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  if (segment === "month") {
    return parsed.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });
  }

  if (segment === "week") {
    return weekOf(parsed.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }));
  }

  return parsed.toLocaleDateString(locale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const segmentLabel = (segment: DetailSegment, t: ReturnType<typeof useTranslation>["t"]) => {
  if (segment === "week") {
    return t("week_collection");
  }
  if (segment === "month") {
    return t("month_collection");
  }
  return t("date_collection");
};

const endpointForSegment = (segment: DetailSegment, referenceDate: string) => {
  if (segment === "week") {
    return `/api/v1/restaurant/daily-data/by-week?reference_date=${encodeURIComponent(referenceDate)}`;
  }
  if (segment === "month") {
    return `/api/v1/restaurant/daily-data/by-month?reference_date=${encodeURIComponent(referenceDate)}`;
  }
  return `/api/v1/restaurant/daily-data/by-date?business_date=${encodeURIComponent(referenceDate)}`;
};

export default function DailyRecordDetailsScreen() {
  const { t } = useTranslation();
  const locale = getLocale();
  const { segment, referenceDate, recordId, dataId } = useLocalSearchParams<{
    segment?: DetailSegment;
    referenceDate?: string;
    recordId?: string;
    dataId?: string;
  }>();
  const fromDataId = typeof dataId === "string" && dataId.length > 0;
  const resolvedRoute = useMemo<{
    segment: DetailSegment;
    referenceDate?: string;
    recordId?: string;
  }>(() => {
    if (typeof dataId === "string" && dataId.length > 0) {
      if (dataId.startsWith("week:")) {
        return {
          segment: "week" as DetailSegment,
          referenceDate: dataId.slice("week:".length),
          recordId: undefined,
        };
      }
      if (dataId.startsWith("month:")) {
        return {
          segment: "month" as DetailSegment,
          referenceDate: dataId.slice("month:".length),
          recordId: undefined,
        };
      }
      if (dataId.startsWith("date:")) {
        return {
          segment: "date" as DetailSegment,
          referenceDate: dataId.slice("date:".length),
          recordId: undefined,
        };
      }
      return {
        segment: "date" as DetailSegment,
        referenceDate: undefined,
        recordId: dataId,
      };
    }

    return {
      segment: segment === "week" || segment === "month" ? segment : "date",
      referenceDate,
      recordId,
    };
  }, [dataId, recordId, referenceDate, segment]);
  const selectedSegment: DetailSegment = resolvedRoute.segment;
  const resolvedReferenceDate = resolvedRoute.referenceDate;
  const resolvedRecordId = resolvedRoute.recordId;
  const [record, setRecord] = useState<DailyRecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [showGroupedHeader, setShowGroupedHeader] = useState(
    typeof dataId === "string" && /^(date|week|month):/.test(dataId),
  );

  useEffect(() => {
    const fetchRecord = async () => {
      if (!resolvedReferenceDate && !resolvedRecordId) {
        setLoading(false);
        return;
      }

      try {
        let response;

        if (resolvedRecordId) {
          try {
            response = await apiClient.get<DailyRecordDetail>(
              `/api/v1/restaurant/daily-data/${encodeURIComponent(resolvedRecordId)}`,
            );
            setShowGroupedHeader(false);
          } catch (error: any) {
            const isNotFound =
              error?.response?.data?.error?.code === "not_found" ||
              error?.response?.status === 404;

            if (!isNotFound) {
              throw error;
            }

            const listResponse = await apiClient.get<DailyDataListResponse>(
              "/api/v1/restaurant/daily-data",
              {
                params: {
                  page: 1,
                  page_size: 100,
                  view: "date",
                },
              },
            );

            const matchedItem = (listResponse.data.items || []).find(
              (item) => item.record_id === resolvedRecordId || item.id === resolvedRecordId,
            );

            if (!matchedItem?.business_date) {
              throw error;
            }

            response = await apiClient.get<DailyRecordDetail>(
              endpointForSegment("date", matchedItem.business_date),
            );
            setShowGroupedHeader(true);
          }
        } else {
          response = await apiClient.get<DailyRecordDetail>(
            endpointForSegment(selectedSegment, resolvedReferenceDate as string),
          );
          setShowGroupedHeader(true);
        }

        setRecord(response.data);
      } catch (error: any) {
        console.error(
          "Error loading daily data collection detail:",
          error.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchRecord();
  }, [fromDataId, resolvedRecordId, resolvedReferenceDate, selectedSegment]);

  const summary = useMemo(() => {
    const expenses = (record?.total_expenses ?? 0) + (record?.invoice_document_total ?? 0);
    const revenue = record?.total_revenue ?? 0;
    return {
      profit: formatCurrency(revenue - expenses, locale),
      revenue: formatCurrency(revenue, locale),
      expenses: formatCurrency(expenses, locale),
    };
  }, [locale, record]);

  const handleExport = async (format: "pdf" | "excel") => {
    if (!record) {
      showErrorMessage("No daily data is available to export.");
      return;
    }

    const exportPayload = {
      reportTitle: t("daily_record_details"),
      reportSubtitle: showGroupedHeader
        ? "Grouped daily data collection export."
        : "Single daily record export.",
      periodLabel: formatBusinessDate(record.business_date, selectedSegment, locale, (date) => t("week_of", { date })),
      summary: {
        revenue: Number(record.total_revenue || 0),
        expenses: Number((record.total_expenses || 0) + (record.invoice_document_total || 0)),
        profit: Number(record.total_revenue || 0) - Number((record.total_expenses || 0) + (record.invoice_document_total || 0)),
        covers: Number(record.total_covers || 0),
        averagePerCover: Number(record.avg_revenue_per_cover || 0),
        currency: "EUR",
      },
      sectionRows: (record.method_sections || []).flatMap((section) =>
        (section.fields || []).map((field) => ({
          section: section.title,
          field: field.label,
          value:
            field.value == null
              ? "-"
              : field.value_type === "currency"
                ? formatCurrency(Number(field.value || 0), locale)
                : String(field.value),
        })),
      ),
    };

    if (format === "pdf") {
      await generateDailyDataPdfExport(exportPayload);
      return;
    }

    await generateDailyDataExcelExport(exportPayload);
  };

  return (
    <View style={styles.safeArea}>
      <Header title={t("daily_record_details")} showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="small" color="#FA8C4C" />
            <Text style={styles.stateText}>{t("loading_collection")}</Text>
          </View>
        ) : !record ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>{t("collection_not_found")}</Text>
            <Text style={styles.stateText}>
              {t("collection_not_found_subtitle")}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.reportHeaderRow}>
              <View>
                <Text style={styles.reportsForLabel}>
                  {showGroupedHeader ? segmentLabel(selectedSegment, t) : t("daily_record_label")}
                </Text>
                <Text style={styles.reportsForDate}>
                  {formatBusinessDate(record.business_date, selectedSegment, locale, (date) => t("week_of", { date }))}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Feather
                  name={showGroupedHeader ? "layers" : "file-text"}
                  size={moderateScale(12)}
                  color="#B45309"
                  style={styles.badgeIcon}
                />
                <Text style={styles.statusBadgeText}>
                  {showGroupedHeader ? t("collected") : String(record.method || t("record")).replace("_", " ").toUpperCase()}
                </Text>
              </View>
            </View>

            <NetProfitCard
              profit={summary.profit}
              revenue={summary.revenue}
              expenses={summary.expenses}
            />

            {(record.method_sections || []).map((section) => (
              <SectionDataCard
                key={section.key}
                title={section.title}
                fields={section.fields || []}
              />
            ))}

            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => setIsExportMenuOpen(true)}
            >
              <Feather
                name="download"
                size={moderateScale(16)}
                color="#111827"
                style={styles.exportIcon}
              />
              <Text style={styles.exportButtonText}>{t("export")}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal
        visible={isExportMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsExportMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsExportMenuOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.exportMenu}>
            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => {
                setIsExportMenuOpen(false);
                void handleExport("pdf");
              }}
            >
              <Text style={styles.exportOptionText}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => {
                setIsExportMenuOpen(false);
                void handleExport("excel");
              }}
            >
              <Text style={styles.exportOptionText}>Excel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(40),
  },
  reportHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(20),
  },
  reportsForLabel: {
    fontSize: moderateScale(10, 0.3),
    fontWeight: "800",
    color: "#6B7280",
    marginBottom: verticalScale(4),
  },
  reportsForDate: {
    fontSize: moderateScale(18, 0.3),
    fontWeight: "800",
    color: "#111827",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: scale(16),
  },
  badgeIcon: {
    marginRight: scale(4),
  },
  statusBadgeText: {
    color: "#B45309",
    fontSize: moderateScale(11, 0.3),
    fontWeight: "700",
  },
  stateCard: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: scale(16),
    paddingVertical: verticalScale(32),
    paddingHorizontal: scale(20),
  },
  stateTitle: {
    fontSize: moderateScale(16, 0.3),
    fontWeight: "700",
    color: "#111827",
    marginBottom: verticalScale(6),
  },
  stateText: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(13, 0.3),
    color: "#6B7280",
    textAlign: "center",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: scale(16),
    paddingVertical: verticalScale(14),
    marginTop: verticalScale(8),
  },
  exportIcon: {
    marginRight: scale(8),
  },
  exportButtonText: {
    fontSize: moderateScale(15, 0.3),
    fontWeight: "600",
    color: "#111827",
  },
  modalOverlay: {
    flex: 1,
  },
  exportMenu: {
    position: "absolute",
    right: scale(20),
    bottom: verticalScale(120),
    backgroundColor: "#E5E7EB",
    borderRadius: scale(10),
    padding: scale(6),
    width: scale(108),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  exportOption: {
    paddingVertical: verticalScale(8),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: scale(6),
    marginBottom: verticalScale(6),
    backgroundColor: "#FFFFFF",
  },
  exportOptionText: {
    fontSize: moderateScale(12, 0.3),
    fontWeight: "600",
    color: "#111827",
  },
});
