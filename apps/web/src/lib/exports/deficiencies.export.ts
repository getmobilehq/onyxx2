import {
  formatCurrency,
  todayStr,
  downloadBlob,
  pdfHeader,
  pdfSummaryRow,
} from '../export-utils';
import type { DeficiencySummaryReport } from '../../types';

const SEVERITY_LABELS: Record<string, string> = {
  minor: 'Minor',
  moderate: 'Moderate',
  major: 'Major',
  critical: 'Critical',
};

const PRIORITY_LABELS: Record<string, string> = {
  immediate: 'Immediate',
  short_term: 'Short Term',
  medium_term: 'Medium Term',
  long_term: 'Long Term',
};

export async function exportDeficienciesPDF(data: DeficiencySummaryReport): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();
  let y = pdfHeader(doc, 'Deficiency Summary Report');

  // Summary
  y = pdfSummaryRow(doc, y, [
    { label: 'Total Deficiencies', value: String(data.summary.totalDeficiencies) },
    { label: 'Total Cost', value: formatCurrency(data.summary.totalCost) },
  ]);

  // Severity breakdown table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('By Severity', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Severity', 'Count', 'Total Cost']],
    body: Object.entries(data.bySeverity).map(([severity, info]) => [
      SEVERITY_LABELS[severity] || severity,
      String(info.count),
      formatCurrency(info.totalCost),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 51, 51] },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // All deficiencies table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('All Deficiencies', 14, y);
  y += 4;

  const allDeficiencies = Object.entries(data.byPriority).flatMap(([priority, group]) =>
    group.deficiencies.map((d) => [
      d.title,
      SEVERITY_LABELS[d.severity] || d.severity,
      PRIORITY_LABELS[priority] || priority,
      formatCurrency(d.totalCost),
      d.targetYear ? String(d.targetYear) : '—',
    ]),
  );

  autoTable(doc, {
    startY: y,
    head: [['Title', 'Severity', 'Priority', 'Cost', 'Target Year']],
    body: allDeficiencies,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 51, 51] },
  });

  doc.save(`deficiency-report-${todayStr()}.pdf`);
}

export async function exportDeficienciesExcel(data: DeficiencySummaryReport): Promise<void> {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Deficiencies', data.summary.totalDeficiencies],
    ['Total Cost', data.summary.totalCost],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // By Severity sheet
  const severityData = [
    ['Severity', 'Count', 'Total Cost'],
    ...Object.entries(data.bySeverity).map(([severity, info]) => [
      SEVERITY_LABELS[severity] || severity,
      info.count,
      info.totalCost,
    ]),
  ];
  const severitySheet = XLSX.utils.aoa_to_sheet(severityData);
  XLSX.utils.book_append_sheet(wb, severitySheet, 'By Severity');

  // All Deficiencies sheet
  const defRows: (string | number)[][] = [
    ['Title', 'Severity', 'Priority', 'Cost', 'Target Year'],
  ];
  Object.entries(data.byPriority).forEach(([priority, group]) => {
    group.deficiencies.forEach((d) => {
      defRows.push([
        d.title,
        SEVERITY_LABELS[d.severity] || d.severity,
        PRIORITY_LABELS[priority] || priority,
        d.totalCost ?? 0,
        d.targetYear ?? '',
      ]);
    });
  });
  const defSheet = XLSX.utils.aoa_to_sheet(defRows);
  XLSX.utils.book_append_sheet(wb, defSheet, 'Deficiencies');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `deficiency-report-${todayStr()}.xlsx`);
}
