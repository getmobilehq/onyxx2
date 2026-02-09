import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  formatDate,
  todayStr,
  downloadBlob,
  pdfHeader,
  pdfSummaryRow,
} from '../export-utils';
import type { AssessmentSummaryReport } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function exportAssessmentsPDF(data: AssessmentSummaryReport): void {
  const doc = new jsPDF();
  let y = pdfHeader(doc, 'Assessment Summary Report');

  // Summary row from statusSummary
  const summaryItems = data.statusSummary.map((s) => ({
    label: STATUS_LABELS[s.status] || s.status,
    value: String(s.count),
  }));
  if (summaryItems.length > 0) {
    y = pdfSummaryRow(doc, y, summaryItems.slice(0, 6));
  }

  // Assessments table
  autoTable(doc, {
    startY: y,
    head: [['Name', 'Building', 'Branch', 'Status', 'Elements', 'Created']],
    body: data.assessments.map((a) => [
      a.name,
      a.building?.name || '—',
      a.branch?.name || '—',
      STATUS_LABELS[a.status] || a.status,
      String(a.totalElements || 0),
      formatDate(a.createdAt),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 51, 51] },
  });

  doc.save(`assessment-report-${todayStr()}.pdf`);
}

export function exportAssessmentsExcel(data: AssessmentSummaryReport): void {
  const wb = XLSX.utils.book_new();

  // Status Summary sheet
  const statusData = [
    ['Status', 'Count'],
    ...data.statusSummary.map((s) => [
      STATUS_LABELS[s.status] || s.status,
      s.count,
    ]),
  ];
  const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
  XLSX.utils.book_append_sheet(wb, statusSheet, 'Status Summary');

  // Assessments sheet
  const assessmentsData = [
    ['Name', 'Building', 'Branch', 'Status', 'Total Elements', 'Completed Elements', 'Deficiencies', 'Created'],
    ...data.assessments.map((a) => [
      a.name,
      a.building?.name || '',
      a.branch?.name || '',
      STATUS_LABELS[a.status] || a.status,
      a.totalElements || 0,
      a.completedElements || 0,
      a.totalDeficiencies || 0,
      formatDate(a.createdAt),
    ]),
  ];
  const assessmentsSheet = XLSX.utils.aoa_to_sheet(assessmentsData);
  XLSX.utils.book_append_sheet(wb, assessmentsSheet, 'Assessments');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `assessment-report-${todayStr()}.xlsx`);
}
