import { NextResponse } from "next/server";
import { toCsv } from "@/lib/csv";

export function GET() {
  const csv = toCsv([["name", "class", "section", "roll"], ["Aarav Gupta", 3, "A", 15], ["Isha Rao", 6, "A", 17]]);
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="students_template.csv"' } });
}
