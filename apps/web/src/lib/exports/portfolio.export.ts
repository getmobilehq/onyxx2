import {
  formatCurrency,
  formatNumber,
  formatPercent,
  todayStr,
  downloadBlob,
  pdfHeader,
  pdfSummaryRow,
} from '../export-utils';
import type { PortfolioReport } from '../../types';

export async function exportPortfolioPDF(data: PortfolioReport): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();
  let y = pdfHeader(doc, 'Building Portfolio Report');

  // Summary row
  y = pdfSummaryRow(doc, y, [
    { label: 'Total Buildings', value: formatNumber(data.summary.totalBuildings) },
    { label: 'Total CRV', value: formatCurrency(data.summary.totalReplacementValue) },
    { label: 'Deferred Maintenance', value: formatCurrency(data.summary.totalDeferredMaintenance) },
    { label: 'Portfolio FCI', value: formatPercent(data.summary.portfolioFCI) },
  ]);

  // Buildings table
  autoTable(doc, {
    startY: y,
    head: [['Building', 'Branch', 'Sq Ft', 'CRV', 'Deferred Maint.', 'FCI', 'Assessments']],
    body: data.buildings.map((b) => [
      b.name,
      b.branch?.name || '—',
      b.grossSquareFeet ? formatNumber(b.grossSquareFeet) : '—',
      formatCurrency(b.currentReplacementValue),
      formatCurrency(b.totalDeferredMaintenance),
      b.currentFci != null ? formatPercent(b.currentFci) : 'N/A',
      String(b._count?.assessments ?? 0),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 51, 51] },
  });

  doc.save(`portfolio-report-${todayStr()}.pdf`);
}

export async function exportPortfolioExcel(data: PortfolioReport): Promise<void> {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Buildings', data.summary.totalBuildings],
    ['Total Replacement Value', data.summary.totalReplacementValue],
    ['Total Deferred Maintenance', data.summary.totalDeferredMaintenance],
    ['Total Square Feet', data.summary.totalSquareFeet],
    ['Portfolio FCI', data.summary.portfolioFCI != null ? Number((data.summary.portfolioFCI * 100).toFixed(1)) : 'N/A'],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Buildings sheet
  const buildingsData = [
    ['Building', 'Branch', 'Square Feet', 'CRV', 'Deferred Maintenance', 'FCI (%)', 'Assessments'],
    ...data.buildings.map((b) => [
      b.name,
      b.branch?.name || '',
      b.grossSquareFeet || '',
      b.currentReplacementValue || '',
      b.totalDeferredMaintenance || '',
      b.currentFci != null ? Number((Number(b.currentFci) * 100).toFixed(1)) : '',
      b._count?.assessments ?? 0,
    ]),
  ];
  const buildingsSheet = XLSX.utils.aoa_to_sheet(buildingsData);
  XLSX.utils.book_append_sheet(wb, buildingsSheet, 'Buildings');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `portfolio-report-${todayStr()}.xlsx`);
}
