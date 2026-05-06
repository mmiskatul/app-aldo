import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import { showErrorMessage, showInfoMessage, showSuccessMessage } from './feedback';

export interface ExportDataProps {
  metrics?: {
    label: string;
    value: number;
    currency: string;
  }[];
  cashData?: {
    label: string;
    amount: number;
  }[];
  period: string;
}

export interface AnalyticsExportDataProps {
  analyticsData: any;
  period: string;
}

const BRAND_PRIMARY = '#FA8C4C';
const BRAND_SOFT = '#FFF4EC';
const TEXT_PRIMARY = '#172033';
const TEXT_MUTED = '#667085';
const BORDER_SOFT = '#E4E7EC';
const SURFACE = '#FFFFFF';
const SURFACE_ALT = '#F8FAFC';
const POSITIVE = '#0F9D76';
const NEGATIVE = '#D64545';
const WARNING = '#C88913';

const getExportDirectory = () => FileSystem.documentDirectory || FileSystem.cacheDirectory || null;

const buildTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

const buildExportUri = (fileName: string) => {
  const directory = getExportDirectory();
  if (!directory) {
    throw new Error('No writable directory is available for exports.');
  }
  return `${directory}${fileName}`;
};

const persistTempFile = async (tempUri: string, fileName: string) => {
  const targetUri = buildExportUri(fileName);
  await FileSystem.deleteAsync(targetUri, { idempotent: true });
  await FileSystem.copyAsync({ from: tempUri, to: targetUri });
  return targetUri;
};

const shareOrNotify = async ({
  uri,
  fileName,
  mimeType,
  dialogTitle,
  uti,
  successMessage,
}: {
  uri: string;
  fileName: string;
  mimeType: string;
  dialogTitle: string;
  uti?: string;
  successMessage: string;
}) => {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType,
      dialogTitle,
      UTI: uti,
    });
    showSuccessMessage(successMessage);
    return;
  }

  showInfoMessage(`${fileName} was saved to app storage. Sharing is not available on this device.`, 'Export Ready');
};

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toTitleCase = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const formatPeriodLabel = (period: string) => `${toTitleCase(period)} Report`;

const formatGeneratedAt = () =>
  new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

const getCurrencySymbol = (currency?: string) => {
  switch ((currency || 'EUR').toUpperCase()) {
    case 'GBP':
      return 'GBP ';
    case 'EUR':
    default:
      return '€';
  }
};

const formatNumber = (value: unknown, fractionDigits = 2) => {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
  if (!Number.isFinite(numericValue)) {
    return '0.00';
  }
  return numericValue.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
};

const formatMoney = (value: unknown, currency?: string, fractionDigits = 2) =>
  `${getCurrencySymbol(currency)}${formatNumber(value, fractionDigits)}`;

const formatPercent = (value: unknown, fractionDigits = 1) => {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
  if (!Number.isFinite(numericValue)) {
    return '0.0%';
  }
  return `${numericValue.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`;
};

const formatCellValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }
  if (typeof value === 'number') {
    return formatNumber(value, 2);
  }
  return String(value);
};

const formatAnalyticsMetricValue = (label: string, value: unknown) => {
  if (typeof value !== 'number') {
    return formatCellValue(value);
  }

  const normalizedLabel = label.trim().toLowerCase();
  if (normalizedLabel.includes('cover') || normalizedLabel.includes('coperti')) {
    return value.toLocaleString();
  }

  return formatMoney(value, 'EUR');
};

const metricToneClass = (label: string) => {
  const normalized = label.toLowerCase();
  if (normalized.includes('expense')) {
    return 'tone-negative';
  }
  if (normalized.includes('profit')) {
    return 'tone-positive';
  }
  if (normalized.includes('cost')) {
    return 'tone-warning';
  }
  return 'tone-primary';
};

const pdfStyles = `
  :root {
    --brand: ${BRAND_PRIMARY};
    --brand-soft: ${BRAND_SOFT};
    --text: ${TEXT_PRIMARY};
    --muted: ${TEXT_MUTED};
    --border: ${BORDER_SOFT};
    --surface: ${SURFACE};
    --surface-alt: ${SURFACE_ALT};
    --positive: ${POSITIVE};
    --negative: ${NEGATIVE};
    --warning: ${WARNING};
  }
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 28px;
    color: var(--text);
    background: #f4f7fb;
    font-family: 'Segoe UI', Arial, sans-serif;
  }
  .report-shell {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    overflow: hidden;
  }
  .hero {
    padding: 28px 32px 24px;
    background:
      linear-gradient(135deg, rgba(250, 140, 76, 0.18), rgba(250, 140, 76, 0.02)),
      linear-gradient(180deg, #ffffff, #fff8f3);
    border-bottom: 1px solid var(--border);
  }
  .eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--brand);
    margin-bottom: 10px;
  }
  h1 {
    margin: 0;
    font-size: 30px;
    line-height: 1.2;
  }
  .hero-grid {
    display: table;
    width: 100%;
    margin-top: 18px;
  }
  .hero-main,
  .hero-meta {
    display: table-cell;
    vertical-align: top;
  }
  .hero-meta {
    width: 220px;
    text-align: right;
  }
  .hero-subtitle {
    margin-top: 8px;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.6;
  }
  .meta-chip {
    display: inline-block;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(250, 140, 76, 0.24);
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    color: var(--text);
    margin-left: 8px;
    margin-bottom: 8px;
  }
  .content {
    padding: 28px 32px 32px;
  }
  .section + .section {
    margin-top: 24px;
  }
  .section-title {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 700;
  }
  .section-copy {
    margin: 0 0 16px;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.6;
  }
  .summary-grid {
    width: 100%;
    border-collapse: separate;
    border-spacing: 12px;
    margin: 0 -12px;
  }
  .summary-grid td {
    width: 50%;
    vertical-align: top;
    padding: 0;
  }
  .metric-card {
    border: 1px solid var(--border);
    background: var(--surface-alt);
    border-radius: 16px;
    padding: 18px;
    min-height: 112px;
  }
  .metric-label {
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .metric-value {
    margin-top: 12px;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }
  .metric-note {
    margin-top: 10px;
    font-size: 12px;
    color: var(--muted);
  }
  .tone-primary .metric-value {
    color: var(--brand);
  }
  .tone-positive .metric-value {
    color: var(--positive);
  }
  .tone-negative .metric-value {
    color: var(--negative);
  }
  .tone-warning .metric-value {
    color: var(--warning);
  }
  .highlight {
    border: 1px solid rgba(250, 140, 76, 0.24);
    border-radius: 16px;
    padding: 18px 20px;
    background: var(--brand-soft);
  }
  .highlight-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--brand);
    margin-bottom: 8px;
  }
  .highlight-copy {
    margin: 0;
    color: var(--text);
    font-size: 14px;
    line-height: 1.7;
  }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
  }
  .data-table thead th {
    background: #f8fafc;
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    text-align: left;
  }
  .data-table tbody td {
    padding: 13px 14px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
    color: var(--text);
  }
  .data-table tbody tr:nth-child(even) td {
    background: #fcfdff;
  }
  .data-table tbody tr:last-child td {
    border-bottom: none;
  }
  .align-right {
    text-align: right;
  }
  .muted {
    color: var(--muted);
  }
  @page {
    size: A4;
    margin: 10mm;
  }
  .home-report {
    page-break-inside: avoid;
  }
  .home-report .hero {
    padding: 16px 20px 14px;
  }
  .home-report .eyebrow {
    margin-bottom: 6px;
  }
  .home-report h1 {
    font-size: 24px;
  }
  .home-report .hero-grid {
    margin-top: 10px;
  }
  .home-report .content {
    padding: 14px 20px 16px;
  }
  .home-report .section + .section {
    margin-top: 12px;
  }
  .home-report .section-title {
    margin-bottom: 4px;
    font-size: 15px;
  }
  .home-report .section-copy {
    margin-bottom: 8px;
    font-size: 10px;
    line-height: 1.35;
  }
  .home-report .summary-grid {
    border-spacing: 8px;
    margin: 0 -8px;
  }
  .home-report .metric-card {
    min-height: 78px;
    padding: 10px 12px;
    border-radius: 10px;
  }
  .home-report .metric-label {
    font-size: 9px;
  }
  .home-report .metric-value {
    margin-top: 6px;
    font-size: 20px;
  }
  .home-report .metric-note {
    display: none;
  }
  .home-report table.data-table {
    border-radius: 10px;
  }
  .home-report .data-table thead th {
    padding: 7px 9px;
    font-size: 9px;
  }
  .home-report .data-table tbody td {
    padding: 7px 9px;
    font-size: 10px;
  }
  .app-promo {
    margin-top: 12px;
    border: 1px solid rgba(250, 140, 76, 0.28);
    border-radius: 12px;
    background: #fff8f3;
    padding: 10px 12px;
    display: table;
    width: 100%;
  }
  .app-promo-copy,
  .store-badges {
    display: table-cell;
    vertical-align: middle;
  }
  .app-promo-copy {
    width: 52%;
  }
  .app-name {
    font-size: 16px;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 2px;
  }
  .app-promo-text {
    font-size: 10px;
    line-height: 1.35;
    color: var(--muted);
  }
  .store-badges {
    text-align: right;
  }
  .store-badge {
    display: inline-block;
    min-width: 118px;
    background: #111827;
    color: #ffffff;
    border-radius: 8px;
    padding: 6px 9px;
    margin-left: 6px;
    text-align: left;
  }
  .store-icon,
  .store-copy {
    display: inline-block;
    vertical-align: middle;
  }
  .store-icon {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: transparent;
    margin-right: 7px;
  }
  .store-icon svg {
    width: 22px;
    height: 22px;
    display: block;
  }
  .store-label {
    display: block;
    font-size: 7px;
    line-height: 1.1;
    color: #d1d5db;
  }
  .store-name {
    display: block;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.15;
    color: #ffffff;
  }
`;

const renderMetricCards = (
  metrics: { label: string; value: string; note: string; toneClass: string }[],
) => {
  const rows: string[] = [];
  for (let index = 0; index < metrics.length; index += 2) {
    const pair = metrics.slice(index, index + 2);
    const cells = pair
      .map(
        (metric) => `
          <td>
            <div class="metric-card ${metric.toneClass}">
              <div class="metric-label">${escapeHtml(metric.label)}</div>
              <div class="metric-value">${escapeHtml(metric.value)}</div>
              <div class="metric-note">${escapeHtml(metric.note)}</div>
            </div>
          </td>
        `,
      )
      .join('');

    const filler = pair.length === 1 ? '<td></td>' : '';
    rows.push(`<tr>${cells}${filler}</tr>`);
  }

  return `<table class="summary-grid"><tbody>${rows.join('')}</tbody></table>`;
};

const renderTable = ({
  headers,
  rows,
  emptyMessage,
}: {
  headers: { label: string; align?: 'left' | 'right' }[];
  rows: string[][];
  emptyMessage: string;
}) => {
  const headerHtml = headers
    .map(
      (header) =>
        `<th class="${header.align === 'right' ? 'align-right' : ''}">${escapeHtml(header.label)}</th>`,
    )
    .join('');

  const bodyHtml =
    rows.length > 0
      ? rows
          .map(
            (row) => `
              <tr>
                ${row
                  .map((cell, index) => {
                    const alignRight = headers[index]?.align === 'right';
                    return `<td class="${alignRight ? 'align-right' : ''}">${escapeHtml(cell)}</td>`;
                  })
                  .join('')}
              </tr>
            `,
          )
          .join('')
      : `<tr><td colspan="${headers.length}" class="muted">${escapeHtml(emptyMessage)}</td></tr>`;

  return `
    <table class="data-table">
      <thead>
        <tr>${headerHtml}</tr>
      </thead>
      <tbody>${bodyHtml}</tbody>
    </table>
  `;
};

const renderAppPromotion = () => `
  <div class="app-promo">
    <div class="app-promo-copy">
      <div class="app-name">RistoAI</div>
      <div class="app-promo-text">Track restaurant performance, cash, VAT, inventory, and AI insights from one mobile workspace.</div>
    </div>
    <div class="store-badges">
      <div class="store-badge">
        <span class="store-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#ffffff" d="M16.8 12.8c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.8-.4 7 1.1 9.2.8 1.1 1.7 2.3 2.9 2.3 1.1 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.2-2.6 0 0-2.6-1-2.7-3.8z"/>
            <path fill="#ffffff" d="M14.6 6.3c.6-.8 1.1-1.8 1-2.9-1 .1-2 .6-2.7 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.2z"/>
          </svg>
        </span>
        <span class="store-copy">
          <span class="store-label">Download on the</span>
          <span class="store-name">App Store</span>
        </span>
      </div>
      <div class="store-badge">
        <span class="store-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#34A853" d="M4.5 3.4c-.3.2-.5.6-.5 1.1v15c0 .5.2.9.5 1.1L13 12 4.5 3.4z"/>
            <path fill="#FBBC04" d="M15.8 9.2 13 12l2.8 2.8 3.4-1.9c1.1-.6 1.1-1.2 0-1.8l-3.4-1.9z"/>
            <path fill="#4285F4" d="M4.5 3.4 13 12l2.8-2.8L6.9 4.1c-.8-.5-1.7-.8-2.4-.7z"/>
            <path fill="#EA4335" d="M4.5 20.6c.7.1 1.6-.2 2.4-.7l8.9-5.1L13 12l-8.5 8.6z"/>
          </svg>
        </span>
        <span class="store-copy">
          <span class="store-label">Get it on</span>
          <span class="store-name">Google Play</span>
        </span>
      </div>
    </div>
  </div>
`;

const createWorksheet = (rows: (string | number)[][]) => XLSX.utils.aoa_to_sheet(rows);

const appendTable = (
  sheet: XLSX.WorkSheet,
  headers: string[],
  rows: (string | number)[][],
  originRow: number,
) => {
  XLSX.utils.sheet_add_aoa(sheet, [headers], { origin: { r: originRow, c: 0 } });
  if (rows.length > 0) {
    XLSX.utils.sheet_add_aoa(sheet, rows, { origin: { r: originRow + 1, c: 0 } });
  }

  const endColumn = Math.max(headers.length - 1, 0);
  const endRow = originRow + Math.max(rows.length, 1);
  sheet['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: originRow, c: 0 }, e: { r: endRow, c: endColumn } }) };
};

const setSheetColumns = (sheet: XLSX.WorkSheet, widths: number[]) => {
  sheet['!cols'] = widths.map((width) => ({ wch: width }));
};

const setWorkbookProps = (workbook: XLSX.WorkBook, title: string, subject: string) => {
  workbook.Props = {
    Title: title,
    Subject: subject,
    Author: 'Aldo',
    Company: 'Aldo',
    CreatedDate: new Date(),
  };
};

export const generatePdfExport = async (data: ExportDataProps) => {
  const getMetric = (name: string) => data.metrics?.find((metric) => metric.label.toLowerCase() === name.toLowerCase());

  const revenue = getMetric('revenue');
  const expenses = getMetric('expenses');
  const foodCost = getMetric('food cost');
  const profit = getMetric('profit');
  const primaryCurrency = revenue?.currency || expenses?.currency || foodCost?.currency || profit?.currency || 'EUR';

  const summaryCards = [
    {
      label: 'Revenue',
      value: formatMoney(revenue?.value ?? 0, revenue?.currency || primaryCurrency),
      note: 'Top-line income recorded for the selected period.',
      toneClass: metricToneClass('revenue'),
    },
    {
      label: 'Expenses',
      value: formatMoney(expenses?.value ?? 0, expenses?.currency || primaryCurrency),
      note: 'Operating spend and tracked outflows for the period.',
      toneClass: metricToneClass('expenses'),
    },
    {
      label: 'Food Cost',
      value: formatMoney(foodCost?.value ?? 0, foodCost?.currency || primaryCurrency),
      note: 'Ingredient and supply cost captured in reporting.',
      toneClass: metricToneClass('food cost'),
    },
    {
      label: 'Profit',
      value: formatMoney(profit?.value ?? 0, profit?.currency || primaryCurrency),
      note: 'Net contribution after expenses and cost of goods.',
      toneClass: metricToneClass('profit'),
    },
  ];

  const cashRows =
    data.cashData?.map((item) => [item.label, formatMoney(item.amount, primaryCurrency)]) || [];

  const metricsRows =
    data.metrics?.map((metric) => [
      metric.label,
      formatMoney(metric.value, metric.currency || primaryCurrency),
      metric.currency || primaryCurrency,
    ]) || [];

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>${pdfStyles}</style>
      </head>
      <body>
        <div class="report-shell home-report">
          <div class="hero">
            <div class="eyebrow">Aldo Reporting</div>
            <div class="hero-grid">
              <div class="hero-main">
                <h1>Financial Performance Report</h1>
              </div>
              <div class="hero-meta">
                <div class="meta-chip">${escapeHtml(formatPeriodLabel(data.period))}</div>
                <div class="meta-chip">Generated ${escapeHtml(formatGeneratedAt())}</div>
              </div>
            </div>
          </div>
          <div class="content">
            <div class="section">
              <div class="section-title">Executive Summary</div>
              <div class="section-copy">A quick view of the most important values for the selected reporting window.</div>
              ${renderMetricCards(summaryCards)}
            </div>

            <div class="section">
              <div class="section-title">Detailed Metrics</div>
              <div class="section-copy">Structured metric output for reconciliation and internal performance review.</div>
              ${renderTable({
                headers: [
                  { label: 'Metric' },
                  { label: 'Value', align: 'right' },
                  { label: 'Currency' },
                ],
                rows: metricsRows,
                emptyMessage: 'No financial metrics are available for this period.',
              })}
            </div>

            <div class="section">
              <div class="section-title">Cash Management</div>
              <div class="section-copy">Cash position categories prepared in a shareable format.</div>
              ${renderTable({
                headers: [
                  { label: 'Category' },
                  { label: 'Amount', align: 'right' },
                ],
                rows: cashRows,
                emptyMessage: 'No cash management data is available for this period.',
              })}
            </div>

            ${renderAppPromotion()}
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const fileName = `Financial_Report_${data.period}_${buildTimestamp()}.pdf`;
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    const savedUri = await persistTempFile(uri, fileName);
    await shareOrNotify({
      uri: savedUri,
      fileName,
      mimeType: 'application/pdf',
      dialogTitle: 'Share Financial Report',
      uti: '.pdf',
      successMessage: 'Financial report ready to share.',
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    showErrorMessage('Failed to export the financial report PDF.');
  }
};

export const generateExcelExport = async (data: ExportDataProps) => {
  try {
    const workbook = XLSX.utils.book_new();
    setWorkbookProps(workbook, 'Financial Performance Report', 'Aldo financial export');

    const generatedAt = formatGeneratedAt();
    const overviewRows: (string | number)[][] = [
      ['Aldo Financial Performance Report'],
      [],
      ['Report Period', formatPeriodLabel(data.period)],
      ['Generated At', generatedAt],
      ['Metrics Count', data.metrics?.length || 0],
      ['Cash Categories', data.cashData?.length || 0],
    ];

    const overviewSheet = createWorksheet(overviewRows);
    setSheetColumns(overviewSheet, [20, 42]);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

    const primaryCurrency = data.metrics?.[0]?.currency || 'EUR';
    const metricsSheet = createWorksheet([
      ['Financial Metrics'],
      [],
      ['Metric', 'Amount', 'Currency', 'Formatted Value'],
    ]);

    const metricsRows =
      data.metrics?.map((metric) => [
        metric.label,
        Number.isFinite(metric.value) ? metric.value : 0,
        metric.currency || primaryCurrency,
        formatMoney(metric.value, metric.currency || primaryCurrency),
      ]) || [];
    appendTable(metricsSheet, ['Metric', 'Amount', 'Currency', 'Formatted Value'], metricsRows, 2);
    setSheetColumns(metricsSheet, [24, 16, 14, 20]);
    XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Metrics');

    const cashSheet = createWorksheet([
      ['Cash Management'],
      [],
      ['Category', 'Amount', 'Formatted Amount'],
    ]);
    const cashRows =
      data.cashData?.map((item) => [
        item.label,
        Number.isFinite(item.amount) ? item.amount : 0,
        formatMoney(item.amount, primaryCurrency),
      ]) || [];
    appendTable(cashSheet, ['Category', 'Amount', 'Formatted Amount'], cashRows, 2);
    setSheetColumns(cashSheet, [28, 16, 20]);
    XLSX.utils.book_append_sheet(workbook, cashSheet, 'Cash Management');

    const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    const fileName = `Financial_Report_${data.period}_${buildTimestamp()}.xlsx`;
    const uri = buildExportUri(fileName);

    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await shareOrNotify({
      uri,
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Share Excel Report',
      successMessage: 'Financial report ready to share.',
    });
  } catch (error) {
    console.error('Error exporting Excel:', error);
    showErrorMessage('Failed to export the financial report spreadsheet.');
  }
};

export const generateAnalyticsPdfExport = async (data: AnalyticsExportDataProps) => {
  const { analyticsData, period } = data;

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: formatMoney(analyticsData.revenue_total ?? 0, 'EUR'),
      note: `Period change: ${formatPercent(analyticsData.revenue_change_percent ?? 0)}`,
      toneClass: metricToneClass('revenue'),
    },
    ...((analyticsData.metric_tiles || []) as any[]).map((item) => ({
      label: item.label || 'Metric',
      value: formatAnalyticsMetricValue(item.label || 'Metric', item.value),
      note:
        item.change_percent !== undefined
          ? `Variance: ${item.change_percent >= 0 ? '+' : ''}${formatPercent(item.change_percent)}`
          : 'Tracked in current analytics view.',
      toneClass:
        item.change_percent === undefined
          ? metricToneClass(item.label || '')
          : item.change_percent >= 0
            ? 'tone-positive'
            : 'tone-negative',
    })),
  ];

  const summaryRows =
    (analyticsData.summary_stats || []).map((item: any) => [item.label || 'Metric', formatCellValue(item.value)]) || [];

  const activityRows = [
    ...((analyticsData.covers_activity || []).map((item: any) => [
      'Covers Activity',
      item.label || 'Item',
      formatCellValue(item.value),
    ]) as string[][]),
    ...((analyticsData.cost_breakdown || []).map((item: any) => [
      'Cost Breakdown',
      item.label || 'Item',
      formatPercent(item.value),
    ]) as string[][]),
  ];

  const revenueTrendRows =
    (analyticsData.weekly_revenue || []).map((item: any) => [
      item.week_label || item.label || item.period || 'Period',
      typeof item.amount === 'number'
        ? formatMoney(item.amount, 'EUR')
        : formatCellValue(item.amount ?? item.value),
    ]) || [];

  const insightTitle = analyticsData.insight_banner?.title || 'Business Insight';
  const insightSubtitle =
    analyticsData.insight_banner?.subtitle ||
    'This report compiles the analytics snapshot currently available in the application.';

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>${pdfStyles}</style>
      </head>
      <body>
        <div class="report-shell">
          <div class="hero">
            <div class="eyebrow">Aldo Analytics</div>
            <div class="hero-grid">
              <div class="hero-main">
                <h1>Analytics Overview Report</h1>
                <div class="hero-subtitle">A professional summary of revenue movement, activity signals, and operational indicators for the selected reporting period.</div>
              </div>
              <div class="hero-meta">
                <div class="meta-chip">${escapeHtml(formatPeriodLabel(period))}</div>
                <div class="meta-chip">Generated ${escapeHtml(formatGeneratedAt())}</div>
              </div>
            </div>
          </div>
          <div class="content">
            <div class="section">
              <div class="highlight">
                <div class="highlight-title">${escapeHtml(insightTitle)}</div>
                <p class="highlight-copy">${escapeHtml(insightSubtitle)}</p>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Headline Metrics</div>
              <div class="section-copy">A top-level view of the most important indicators in the analytics dashboard.</div>
              ${renderMetricCards(summaryCards)}
            </div>

            <div class="section">
              <div class="section-title">Statistics Summary</div>
              <div class="section-copy">Reference metrics prepared for management review and comparison.</div>
              ${renderTable({
                headers: [
                  { label: 'Metric' },
                  { label: 'Value', align: 'right' },
                ],
                rows: summaryRows,
                emptyMessage: 'No summary statistics are available for this period.',
              })}
            </div>

            <div class="section">
              <div class="section-title">Revenue Trend</div>
              <div class="section-copy">Period-based revenue entries exported from the analytics view.</div>
              ${renderTable({
                headers: [
                  { label: 'Period' },
                  { label: 'Revenue', align: 'right' },
                ],
                rows: revenueTrendRows,
                emptyMessage: 'No revenue trend data is available for this period.',
              })}
            </div>

            <div class="section">
              <div class="section-title">Activity And Cost Signals</div>
              <div class="section-copy">Operational activity and cost indicators aligned into a single report table.</div>
              ${renderTable({
                headers: [
                  { label: 'Section' },
                  { label: 'Indicator' },
                  { label: 'Value', align: 'right' },
                ],
                rows: activityRows,
                emptyMessage: 'No activity or cost breakdown data is available for this period.',
              })}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const fileName = `Analytics_Report_${period}_${buildTimestamp()}.pdf`;
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    const savedUri = await persistTempFile(uri, fileName);
    await shareOrNotify({
      uri: savedUri,
      fileName,
      mimeType: 'application/pdf',
      dialogTitle: 'Share Analytics Report',
      uti: '.pdf',
      successMessage: 'Analytics report ready to share.',
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    showErrorMessage('Failed to export the analytics PDF.');
  }
};

export const generateAnalyticsExcelExport = async (data: AnalyticsExportDataProps) => {
  try {
    const { analyticsData, period } = data;
    const workbook = XLSX.utils.book_new();
    setWorkbookProps(workbook, 'Analytics Overview Report', 'Aldo analytics export');

    const overviewSheet = createWorksheet([
      ['Aldo Analytics Overview Report'],
      [],
      ['Report Period', formatPeriodLabel(period)],
      ['Generated At', formatGeneratedAt()],
      ['Metric Tiles', (analyticsData.metric_tiles || []).length],
      ['Summary Stats', (analyticsData.summary_stats || []).length],
      ['Revenue Points', (analyticsData.weekly_revenue || []).length],
      ['Supplier Alerts', (analyticsData.supplier_price_alerts || []).length],
    ]);
    setSheetColumns(overviewSheet, [22, 42]);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

    const summarySheet = createWorksheet([
      ['Analytics Summary'],
      [],
      ['Section', 'Label', 'Value', 'Formatted'],
    ]);
    const summaryRows = [
      ['Overview', 'Total Revenue', analyticsData.revenue_total ?? 0, formatMoney(analyticsData.revenue_total ?? 0, 'EUR')],
      [
        'Overview',
        'Revenue Change %',
        analyticsData.revenue_change_percent ?? 0,
        formatPercent(analyticsData.revenue_change_percent ?? 0),
      ],
      ...((analyticsData.metric_tiles || []).map((item: any) => [
        'Metric Tile',
        item.label || 'Metric',
        typeof item.value === 'number' ? item.value : formatCellValue(item.value),
        formatAnalyticsMetricValue(item.label || 'Metric', item.value),
      ]) as (string | number)[][]),
      ...((analyticsData.summary_stats || []).map((item: any) => [
        'Summary Stat',
        item.label || 'Metric',
        typeof item.value === 'number' ? item.value : formatCellValue(item.value),
        formatCellValue(item.value),
      ]) as (string | number)[][]),
    ];
    appendTable(summarySheet, ['Section', 'Label', 'Value', 'Formatted'], summaryRows, 2);
    setSheetColumns(summarySheet, [18, 28, 18, 20]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    const revenueSheet = createWorksheet([
      ['Revenue Trend'],
      [],
      ['Period', 'Amount', 'Formatted Revenue'],
    ]);
    const revenueRows =
      (analyticsData.weekly_revenue || []).map((item: any) => {
        const amountValue = typeof item.amount === 'number' ? item.amount : Number(item.amount ?? item.value ?? 0);
        return [
          item.week_label || item.label || item.period || 'Period',
          Number.isFinite(amountValue) ? amountValue : 0,
          formatMoney(Number.isFinite(amountValue) ? amountValue : 0, 'EUR'),
        ];
      }) || [];
    appendTable(revenueSheet, ['Period', 'Amount', 'Formatted Revenue'], revenueRows, 2);
    setSheetColumns(revenueSheet, [22, 16, 20]);
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue Trend');

    const activitySheet = createWorksheet([
      ['Activity And Cost Signals'],
      [],
      ['Section', 'Label', 'Value', 'Formatted'],
    ]);
    const activityRows = [
      ...((analyticsData.covers_activity || []).map((item: any) => [
        'Covers Activity',
        item.label || 'Indicator',
        item.value ?? '',
        formatCellValue(item.value),
      ]) as (string | number)[][]),
      ...((analyticsData.cost_breakdown || []).map((item: any) => [
        'Cost Breakdown',
        item.label || 'Indicator',
        item.value ?? 0,
        formatPercent(item.value),
      ]) as (string | number)[][]),
    ];
    appendTable(activitySheet, ['Section', 'Label', 'Value', 'Formatted'], activityRows, 2);
    setSheetColumns(activitySheet, [20, 28, 16, 18]);
    XLSX.utils.book_append_sheet(workbook, activitySheet, 'Activity & Cost');

    const alertsSheet = createWorksheet([
      ['Supplier Price Alerts'],
      [],
      ['Supplier', 'Item', 'Message'],
    ]);
    const alertRows =
      (analyticsData.supplier_price_alerts || []).map((item: any) => [
        item.title || 'Price Alert',
        item.impact || 'N/A',
        item.subtitle || item.description || 'Alert available in analytics view.',
      ]) || [];
    appendTable(alertsSheet, ['Alert', 'Impact', 'Details'], alertRows, 2);
    setSheetColumns(alertsSheet, [28, 18, 48]);
    XLSX.utils.book_append_sheet(workbook, alertsSheet, 'Supplier Alerts');

    const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    const fileName = `Analytics_Report_${period}_${buildTimestamp()}.xlsx`;
    const uri = buildExportUri(fileName);

    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await shareOrNotify({
      uri,
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Share Excel Analytics Report',
      successMessage: 'Analytics spreadsheet ready to share.',
    });
  } catch (error) {
    console.error('Error exporting Excel analytics:', error);
    showErrorMessage('Failed to export the analytics spreadsheet.');
  }
};
