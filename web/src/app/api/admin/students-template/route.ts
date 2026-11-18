import { NextResponse } from "next/server";
import { toCsv } from "@/lib/csv";
import { writeXlsx } from "@/lib/spreadsheet";

const ROWS = [["Aarav Gupta", "3", "A", "15"], ["Isha Rao", "6", "A", "17"]];

export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get("format") === "xlsx") {
    const buf = await writeXlsx("Students", [{ header: "name", width: 26 }, { header: "class", width: 8 }, { header: "section", width: 9 }, { header: "roll", width: 8 }], ROWS);
    return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": 'attachment; filename="students_template.xlsx"' } });
  }
  const csv = toCsv([["name", "class", "section", "roll"], ...ROWS]);
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="students_template.csv"' } });
}
