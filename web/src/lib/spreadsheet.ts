// Reading and writing simple tables as Excel (.xlsx) or CSV, for bulk import and bulk edit.
import "server-only";
import ExcelJS from "exceljs";
import { parseCsvObjects } from "./csv";

/** Header text → key: lower case, letters and digits only ("Roll no." → "rollno"). */
export const headerKey = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, "");

const cellText = (v: ExcelJS.CellValue): string => {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) {
    // Excel stores dates without a time zone; read the calendar date as written
    return `${v.getUTCFullYear()}-${String(v.getUTCMonth() + 1).padStart(2, "0")}-${String(v.getUTCDate()).padStart(2, "0")}`;
  }
  if (typeof v === "object") {
    if ("richText" in v) return v.richText.map((r) => r.text).join("");
    if ("text" in v) return String(v.text);           // hyperlink
    if ("result" in v) return cellText(v.result as ExcelJS.CellValue); // formula
    return "";
  }
  return String(v);
};

/**
 * Reads the first sheet of an .xlsx file, or a .csv file, into rows keyed by `headerKey` of row 1.
 * Each row also carries `__line` (its row number in the file) for messages.
 */
export async function readTable(file: File): Promise<Record<string, string>[]> {
  const nameLower = file.name.toLowerCase();
  if (nameLower.endsWith(".xlsx")) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const ws = wb.worksheets[0];
    if (!ws) return [];
    const head: string[] = [];
    ws.getRow(1).eachCell({ includeEmpty: true }, (c, i) => (head[i] = headerKey(cellText(c.value))));
    const out: Record<string, string>[] = [];
    ws.eachRow((row, n) => {
      if (n === 1) return;
      const r: Record<string, string> = { __line: String(n) };
      head.forEach((k, i) => { if (k) r[k] = cellText(row.getCell(i).value).trim(); });
      if (Object.entries(r).some(([k, v]) => k !== "__line" && v)) out.push(r);
    });
    return out;
  }
  if (nameLower.endsWith(".xls")) throw new Error("Old .xls files are not supported. In Excel, use File → Save As → Excel Workbook (.xlsx).");
  const rows = parseCsvObjects(await file.text());
  return rows.map((r, i) => ({ __line: String(i + 2), ...Object.fromEntries(Object.entries(r).map(([k, v]) => [headerKey(k), v])) }));
}

/** Writes one sheet: bold frozen header, text-formatted columns (so phone numbers keep their + and leading zeros). */
export async function writeXlsx(sheet: string, columns: { header: string; width?: number; note?: string; locked?: boolean }[], rows: (string | null)[][]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheet, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = columns.map((c) => ({ header: c.header, width: c.width ?? 18, style: { numFmt: "@" } }));
  const head = ws.getRow(1);
  head.font = { bold: true };
  columns.forEach((c, i) => {
    const cell = head.getCell(i + 1);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: c.locked ? "FFE5E7EB" : "FFDBEAFE" } };
    if (c.note) cell.note = c.note;
  });
  for (const r of rows) ws.addRow(r.map((v) => v ?? ""));
  columns.forEach((c, i) => {
    if (c.locked) ws.getColumn(i + 1).eachCell((cell, n) => { if (n > 1) cell.font = { color: { argb: "FF6B7280" } }; });
  });
  return Buffer.from(await wb.xlsx.writeBuffer());
}
