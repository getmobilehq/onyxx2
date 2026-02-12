import {
  formatCurrency,
  todayStr,
  downloadBlob,
  pdfHeader,
  pdfSummaryRow,
} from '../export-utils';
import type { CapitalForecastReport } from '../../types';

const PRIORITY_LABELS: Record<string, string> = {
  immediate: 'Immediate',
  short_term: 'Short Term',
  medium_term: 'Medium Term',
  long_term: 'Long Term',
};

export async function exportForecastPDF(data: CapitalForecastReport): Promise<void> {
  if (!data.forecast || data.forecast.length === 0) {
    throw new Error('No forecast data available to export');
  }
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();
  let y = pdfHeader(doc, '10-Year Capital Forecast');

  // Summary
  y = pdfSummaryRow(doc, y, [
    { label: 'Total 10-Year Cost', value: formatCurrency(data.totalCost) },
    { label: 'Years Covered', value: String(data.forecast.length) },
  ]);

  // Year summary table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Year Summary', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Year', 'Items', 'Total Cost']],
    body: data.forecast.map((fy) => [
      String(fy.year),
      String(fy.count),
      formatCurrency(fy.totalCost),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 51, 51] },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Detailed items table
  const allItems = data.forecast.flatMap((fy) =>
    fy.items.map((item) => [
      String(fy.year),
      item.title,
      item.building,
      PRIORITY_LABELS[item.priority] || item.priority,
      formatCurrency(item.cost),
    ]),
  );

  if (allItems.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Items', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Year', 'Title', 'Building', 'Priority', 'Cost']],
      body: allItems,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [51, 51, 51] },
    });
  }

  doc.save(`capital-forecast-${todayStr()}.pdf`);
}

export async function exportForecastExcel(data: CapitalForecastReport): Promise<void> {
  if (!data.forecast || data.forecast.length === 0) {
    throw new Error('No forecast data available to export');
  }
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // Year Summary sheet
  const yearData = [
    ['Year', 'Item Count', 'Total Cost'],
    ...data.forecast.map((fy) => [
      fy.year,
      fy.count,
      fy.totalCost,
    ]),
    ['', '', ''],
    ['Total', '', data.totalCost],
  ];
  const yearSheet = XLSX.utils.aoa_to_sheet(yearData);
  XLSX.utils.book_append_sheet(wb, yearSheet, 'Year Summary');

  // All Items sheet
  const itemRows: (string | number)[][] = [
    ['Year', 'Title', 'Building', 'Priority', 'Cost'],
  ];
  data.forecast.forEach((fy) => {
    fy.items.forEach((item) => {
      itemRows.push([
        fy.year,
        item.title,
        item.building,
        PRIORITY_LABELS[item.priority] || item.priority,
        item.cost,
      ]);
    });
  });
  const itemSheet = XLSX.utils.aoa_to_sheet(itemRows);
  XLSX.utils.book_append_sheet(wb, itemSheet, 'All Items');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `capital-forecast-${todayStr()}.xlsx`);
}
