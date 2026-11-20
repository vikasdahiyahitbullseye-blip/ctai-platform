import { NextResponse } from "next/server";
import { requireSchoolAdmin } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { writeXlsx } from "@/lib/spreadsheet";
import { STAFF_IMPORT_COLUMNS } from "@/lib/staffImport";

const ROWS = [
  ["Anjali Mehra", "teacher", "TGT Computer Science", "anjali.mehra@example.com", "+91 98100 12345", "6-A CT; 6-A AI"],
  ["Rohit Sharma", "teacher", "PRT", "", "", "3-A CT"],
  ["Neha Kapoor", "admin", "Academic Coordinator", "", "", ""],
];

export async function GET(req: Request) {
  await requireSchoolAdmin();
  if (new URL(req.url).searchParams.get("format") === "xlsx") {
    const buf = await writeXlsx("Teachers", STAFF_IMPORT_COLUMNS, ROWS);
    return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": 'attachment; filename="teachers_template.xlsx"' } });
  }
  const csv = toCsv([STAFF_IMPORT_COLUMNS.map((c) => c.header), ...ROWS]);
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="teachers_template.csv"' } });
}
