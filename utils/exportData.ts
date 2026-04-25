import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';

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

export const generatePdfExport = async (data: ExportDataProps) => {
  const getMetric = (name: string) => {
    return data.metrics?.find((m) => m.label.toLowerCase() === name.toLowerCase());
  };

  const revenue = getMetric('revenue');
  const expenses = getMetric('expenses');
  const foodCost = getMetric('food cost');
  const profit = getMetric('profit');

  const parseCurrency = (c: string) => (c === "USD" ? "$" : (c === "EUR" ? "€" : ""));

  const cashHtml = data.cashData && data.cashData.length > 0 
    ? data.cashData.map((item) => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #ddd;">${item.label}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">
          €${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    `).join('') 
    : '<tr><td colspan="2" style="padding: 12px 8px; text-align: center; color: #6b7280;">No cash data available</td></tr>';

  const formatMetric = (metric?: { value: number; currency: string }) => {
    if (!metric) return '$0.00';
    return `${parseCurrency(metric.currency)}${metric.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
  };

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            padding: 30px; 
            color: #111827; 
            background: #ffffff;
          }
          .header {
            border-bottom: 2px solid #FA8C4C;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          h1 { 
            color: #111827; 
            margin: 0;
            font-size: 28px;
          }
          .period {
            color: #6B7280;
            font-size: 16px;
            margin-top: 5px;
            text-transform: capitalize;
          }
          h3 { 
            color: #374151; 
            margin-top: 30px; 
            font-size: 20px;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 8px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
          }
          th { 
            text-align: left; 
            padding: 12px 8px; 
            border-bottom: 2px solid #E5E7EB; 
            color: #6B7280; 
            font-weight: 600; 
            background-color: #F9FAFB;
          }
          .metrics-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 15px;
          }
          .metric-card {
            flex: 1;
            min-width: 45%;
            background: #F9FAFB;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #E5E7EB;
          }
          .metric-label {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 8px;
            font-weight: 500;
          }
          .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #111827;
          }
          .revenue { color: #FA8C4C; }
          .expenses { color: #EF4444; }
          .profit { color: #10B981; }
          .food-cost { color: #D97706; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Financial Report</h1>
          <div class="period">${data.period} Period</div>
        </div>
        
        <h3>Key Metrics</h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Revenue</div>
            <div class="metric-value revenue">${formatMetric(revenue)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Expenses</div>
            <div class="metric-value expenses">${formatMetric(expenses)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Food Cost</div>
            <div class="metric-value food-cost">${formatMetric(foodCost)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Profit</div>
            <div class="metric-value profit">${formatMetric(profit)}</div>
          </div>
        </div>

        <h3>Cash Management</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th style="text-align: right;">Amount (€)</th>
            </tr>
          </thead>
          <tbody>
            ${cashHtml}
          </tbody>
        </table>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
  }
};

export const generateExcelExport = async (data: ExportDataProps) => {
  try {
    const metricsData = data.metrics?.map(m => ({
      Category: 'Metrics',
      Label: m.label,
      Value: m.value,
      Currency: m.currency
    })) || [];

    const cashData = data.cashData?.map(c => ({
      Category: 'Cash Management',
      Label: c.label,
      Value: c.amount,
      Currency: 'EUR'
    })) || [];

    const wb = XLSX.utils.book_new();

    const metricsSheet = XLSX.utils.json_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(wb, metricsSheet, 'Metrics');

    const cashSheet = XLSX.utils.json_to_sheet(cashData);
    XLSX.utils.book_append_sheet(wb, cashSheet, 'Cash Management');

    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const fileName = `Financial_Report_${data.period}.xlsx`;
    const uri = (FileSystem.cacheDirectory || '') + fileName;

    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Share Excel Report'
      });
    }
  } catch (error) {
    console.error('Error exporting Excel:', error);
  }
};

export const generateAnalyticsPdfExport = async (data: AnalyticsExportDataProps) => {
  const { analyticsData, period } = data;
  
  const metricTilesHtml = analyticsData.metric_tiles?.map((item: any) => `
    <div class="metric-card">
      <div class="metric-label">${item.label}</div>
      <div class="metric-value">${typeof item.value === 'number' ? `$${item.value.toLocaleString()}` : item.value}</div>
      ${item.change_percent !== undefined ? `<div class="trend ${item.change_percent >= 0 ? 'profit' : 'expenses'}">${item.change_percent >= 0 ? '+' : ''}${item.change_percent}%</div>` : ''}
    </div>
  `).join('') || '';

  const summaryStatsHtml = analyticsData.summary_stats?.map((item: any) => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #ddd;">${item.label}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">
        ${typeof item.value === 'number' ? `$${item.value.toLocaleString()}` : item.value}
      </td>
    </tr>
  `).join('') || '';

  const coversActivityHtml = analyticsData.covers_activity?.map((item: any) => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #ddd;">${item.label}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">${item.value}</td>
    </tr>
  `).join('') || '';

  const costBreakdownHtml = analyticsData.cost_breakdown?.map((item: any) => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #ddd;">${item.label}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">${item.value}%</td>
    </tr>
  `).join('') || '';

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            padding: 30px; 
            color: #111827; 
            background: #ffffff;
          }
          .header {
            border-bottom: 2px solid #FA8C4C;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          h1 { 
            color: #111827; 
            margin: 0;
            font-size: 28px;
          }
          .period {
            color: #6B7280;
            font-size: 16px;
            margin-top: 5px;
            text-transform: capitalize;
          }
          h3 { 
            color: #374151; 
            margin-top: 30px; 
            font-size: 20px;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 8px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
          }
          th { 
            text-align: left; 
            padding: 12px 8px; 
            border-bottom: 2px solid #E5E7EB; 
            color: #6B7280; 
            font-weight: 600; 
            background-color: #F9FAFB;
          }
          .metrics-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 15px;
          }
          .metric-card {
            flex: 1;
            min-width: 45%;
            background: #F9FAFB;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #E5E7EB;
          }
          .metric-label {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 8px;
            font-weight: 500;
          }
          .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #111827;
          }
          .trend { font-size: 14px; font-weight: bold; margin-top: 5px; }
          .profit { color: #10B981; }
          .expenses { color: #EF4444; }
          .insight { 
            background: #FCE7D6; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            border-left: 4px solid #FA8C4C;
          }
          .insight-title { font-weight: bold; color: #FA8C4C; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Analytics Overview</h1>
          <div class="period">${period} Period</div>
        </div>

        <div class="insight">
          <div class="insight-title">${analyticsData.insight_banner?.title}</div>
          <div>${analyticsData.insight_banner?.subtitle}</div>
        </div>
        
        <h3>Key Metrics</h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Total Revenue</div>
            <div class="metric-value">$${analyticsData.revenue_total?.toLocaleString()}</div>
            <div class="trend ${analyticsData.revenue_change_percent >= 0 ? 'profit' : 'expenses'}">
              ${analyticsData.revenue_change_percent >= 0 ? '+' : ''}${analyticsData.revenue_change_percent}%
            </div>
          </div>
          ${metricTilesHtml}
        </div>

        <h3>Statistics Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th style="text-align: right;">Value</th>
            </tr>
          </thead>
          <tbody>
            ${summaryStatsHtml}
          </tbody>
        </table>

        <h3>Activity & Costs</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th style="text-align: right;">Activity / Cost (%)</th>
            </tr>
          </thead>
          <tbody>
            ${coversActivityHtml}
            ${costBreakdownHtml}
          </tbody>
        </table>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
  }
};

export const generateAnalyticsExcelExport = async (data: AnalyticsExportDataProps) => {
  try {
    const { analyticsData, period } = data;
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      { Category: 'Overview', Label: 'Total Revenue', Value: analyticsData.revenue_total },
      { Category: 'Overview', Label: 'Revenue Change %', Value: analyticsData.revenue_change_percent },
      ...(analyticsData.metric_tiles || []).map((m: any) => ({
        Category: 'Key Metrics',
        Label: m.label,
        Value: m.value
      })),
      ...(analyticsData.summary_stats || []).map((s: any) => ({
        Category: 'Stats',
        Label: s.label,
        Value: s.value
      }))
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // Revenue Breakdown Sheet
    const weeklyRevenueSheet = XLSX.utils.json_to_sheet(analyticsData.weekly_revenue || []);
    XLSX.utils.book_append_sheet(wb, weeklyRevenueSheet, 'Weekly Revenue');

    // Activity & Cost Sheet
    const activityData = [
      ...(analyticsData.covers_activity || []).map((c: any) => ({ Type: 'Covers Activity', Label: c.label, Value: c.value })),
      ...(analyticsData.cost_breakdown || []).map((ct: any) => ({ Type: 'Cost %', Label: ct.label, Value: ct.value + '%' }))
    ];
    const activitySheet = XLSX.utils.json_to_sheet(activityData);
    XLSX.utils.book_append_sheet(wb, activitySheet, 'Activity & Cost');

    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const fileName = `Analytics_Report_${period}.xlsx`;
    const uri = (FileSystem.cacheDirectory || '') + fileName;

    await FileSystem.writeAsStringAsync(uri, base64, {
      encoding: FileSystem.EncodingType.Base64
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Share Excel Analytics Report'
      });
    }
  } catch (error) {
    console.error('Error exporting Excel analytics:', error);
  }
};
