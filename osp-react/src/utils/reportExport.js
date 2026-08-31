import * as XLSX from 'xlsx';

/**
 * Export baris ke file .xlsx dari definisi kolom.
 * @param {Array<{label: string, render: (row) => any}>} columns
 * @param {Array<object>} rows
 * @param {{ fileName: string, sheetName: string }} opts
 */
export function exportColumnsToXlsx(columns, rows, { fileName, sheetName }) {
  const headers = columns.map((c) => c.label);
  const body = rows.map((r) => columns.map((c) => c.render(r) ?? '-'));

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...body]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}
