import jsPDF from 'jspdf';

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return 'N/A';
  return `${(Number(value) * 100).toFixed(1)}%`;
}

export { formatDate } from './date-utils';

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function pdfHeader(doc: jsPDF, title: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 28);

  // Divider line
  doc.setDrawColor(200);
  doc.line(14, 32, pageWidth - 14, 32);

  doc.setTextColor(0);
  return 38; // return Y position after header
}

export function pdfSummaryRow(doc: jsPDF, y: number, items: { label: string; value: string }[]): number {
  doc.setFontSize(9);
  const colWidth = (doc.internal.pageSize.getWidth() - 28) / items.length;
  items.forEach((item, i) => {
    const x = 14 + i * colWidth;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(item.label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(item.value, x, y + 5);
  });
  return y + 14;
}
