import type {
  AnalyticsData,
  AnalyticsScreenCache,
  CashOverviewData,
  DocumentListCacheItem,
  DocumentsBannerData,
  VatOverviewData,
} from "../store/useAppStore";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};

export const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : value == null ? fallback : String(value);

export const asNullableString = (value: unknown): string | null => {
  const normalized = asString(value).trim();
  return normalized ? normalized : null;
};

export const asNumber = (value: unknown, fallback = 0): number => {
  const normalized = typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
};

export const asBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

export const asArray = <T>(value: unknown, mapper: (entry: unknown, index: number) => T): T[] =>
  Array.isArray(value) ? value.map(mapper) : [];

export const normalizeDocumentItem = (value: unknown): DocumentListCacheItem => {
  const record = asRecord(value);

  return {
    id: asString(record.id, ""),
    document_type: asNullableString(record.document_type),
    document_label: asNullableString(record.document_label),
    counterparty_name: asNullableString(record.counterparty_name),
    supplier_name: asNullableString(record.supplier_name),
    document_number: asNullableString(record.document_number),
    invoice_number: asNullableString(record.invoice_number),
    document_date: asNullableString(record.document_date),
    invoice_date: asNullableString(record.invoice_date),
    invoice_date_formatted: asNullableString(record.invoice_date_formatted),
    upload_date: asNullableString(record.upload_date),
    created_at: asNullableString(record.created_at),
    total_amount: asNumber(record.total_amount, 0),
    line_item_count: asNumber(record.line_item_count, 0),
    status: asNullableString(record.status) ?? "pending",
  };
};

export const normalizeDocumentsBannerData = (value: unknown): DocumentsBannerData => {
  const record = asRecord(value);

  return {
    title: asString(record.title),
    subtitle: asString(record.subtitle),
  };
};

export const normalizeDocumentsResponse = (value: unknown) => {
  const record = asRecord(value);

  return {
    items: asArray(record.items, (item) => normalizeDocumentItem(item)).filter((item) => item.id),
    bannerData: {
      title: asString(record.ai_banner_title),
      subtitle: asString(record.ai_banner_subtitle),
    },
    total: asNumber(record.total, 0),
  };
};

export const normalizeVatOverviewData = (value: unknown): VatOverviewData => {
  const record = asRecord(value);

  return {
    estimated_vat_balance: asNumber(record.estimated_vat_balance, 0),
    vat_payable: asNumber(record.vat_payable, 0),
    vat_receivable: asNumber(record.vat_receivable, 0),
    filing_deadline: asNullableString(record.filing_deadline),
    report_ready: asBoolean(record.report_ready, false),
  };
};

type AnalyticsMetricValue = number | string;

const normalizeAnalyticsValue = (value: unknown): AnalyticsMetricValue => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value;
  }

  return asNumber(value, 0);
};

export const normalizeAnalyticsSummaryItems = (value: unknown): AnalyticsScreenCache["summaryStatsByPeriod"]["weekly"] =>
  asArray(value, (item) => {
    const record = asRecord(item);
    return {
      label: asString(record.label),
      value: normalizeAnalyticsValue(record.value),
    };
  });

export const normalizeAnalyticsComparisonItems = (value: unknown): AnalyticsScreenCache["revenueComparisonByPeriod"]["weekly"] =>
  asArray(value, (item) => {
    const record = asRecord(item);
    return {
      label: asString(record.label),
      value: asNumber(record.value, 0),
    };
  });

export const normalizeAnalyticsInsight = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = asRecord(value);
  return {
    title: asString(record.title),
    subtitle: asString(record.subtitle),
    ai_provider: asNullableString(record.ai_provider),
    title_translations: record.title_translations as { en?: string | null; it?: string | null } | null | undefined,
    subtitle_translations: record.subtitle_translations as { en?: string | null; it?: string | null } | null | undefined,
  };
};

export const normalizeAnalyticsOverview = (value: unknown): AnalyticsData => {
  const record = asRecord(value);
  return {
    insight_banner: normalizeAnalyticsInsight(record.insight_banner) ?? {
      title: "",
      subtitle: "",
    },
    revenue_total: asNumber(record.revenue_total, 0),
    revenue_change_percent: asNumber(record.revenue_change_percent, 0),
    weekly_revenue: asArray(record.weekly_revenue, (item) => {
      const next = asRecord(item);
      return {
        label: asString(next.label),
        value: asNumber(next.value, 0),
      };
    }),
    metric_tiles: asArray(record.metric_tiles, (item) => {
      const next = asRecord(item);
      return {
        label: asString(next.label),
        value: typeof next.value === "string" ? next.value : asNumber(next.value, 0),
        change_percent: asNumber(next.change_percent, 0),
        subtitle: asString(next.subtitle),
      };
    }),
    summary_stats: normalizeAnalyticsSummaryItems(record.summary_stats) ?? [],
    revenue_comparison: normalizeAnalyticsComparisonItems(record.revenue_comparison) ?? [],
    covers_total: asNumber(record.covers_total, 0),
    covers_activity: asArray(record.covers_activity, (item) => {
      const next = asRecord(item);
      return {
        label: asString(next.label),
        value: asNumber(next.value, 0),
      };
    }),
    avg_revenue_per_cover: asNumber(record.avg_revenue_per_cover, 0),
    cost_breakdown: asArray(record.cost_breakdown, (item) => {
      const next = asRecord(item);
      return {
        label: asString(next.label),
        value: asNumber(next.value, 0),
      };
    }),
    supplier_price_alerts: asArray(record.supplier_price_alerts, (item) => {
      const next = asRecord(item);
      return {
        title: asString(next.title),
        subtitle: asString(next.subtitle),
        impact: asString(next.impact),
        ai_provider: asNullableString(next.ai_provider),
        title_translations: next.title_translations,
        subtitle_translations: next.subtitle_translations,
      };
    }),
  };
};

export const normalizeCashOverviewData = (value: unknown): CashOverviewData => {
  const record = asRecord(value);
  const periodsRecord = asRecord(record.periods);
  const normalizedPeriods: CashOverviewData["periods"] = {};

  Object.entries(periodsRecord).forEach(([key, periodValue]) => {
    const periodRecord = asRecord(periodValue);
    const summaryRecord = asRecord(periodRecord.summary);
    const statusRecord = asRecord(periodRecord.status);
    normalizedPeriods[key] = {
      summary: {
        total_collected: asNumber(summaryRecord.total_collected, 0),
        cash_available: asNumber(summaryRecord.cash_available, 0),
        pos_payments: asNumber(summaryRecord.pos_payments, 0),
        withdrawals_total: asNumber(summaryRecord.withdrawals_total, 0),
        bank_deposits: asNumber(summaryRecord.bank_deposits, asNumber(summaryRecord.bank_deposits_total, 0)),
        bank_deposits_total: asNumber(summaryRecord.bank_deposits_total, 0),
      },
      status: {
        total_collected: asString(statusRecord.total_collected),
        cash_available: asString(statusRecord.cash_available),
        pos_payments: asString(statusRecord.pos_payments),
        withdrawals: asString(statusRecord.withdrawals),
        bank_deposits: asString(statusRecord.bank_deposits),
      },
      recent_deposits: Array.isArray(periodRecord.recent_deposits) ? periodRecord.recent_deposits : [],
    };
  });

  return {
    active_period: asString(record.active_period, "today"),
    periods: normalizedPeriods,
  };
};
