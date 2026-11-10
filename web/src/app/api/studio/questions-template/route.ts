import { NextResponse } from "next/server";
import { toCsv } from "@/lib/csv";

export function GET() {
  const csv = toCsv([
    ["class", "part", "chapter", "type", "difficulty", "skills", "question", "options", "answer", "solution", "hint"],
    [4, "CT", 3, "MCQ", 1, "PATTERN", "What comes next?\\n\\n2, 4, 6, 8, ___", "9|10|12|16", "b", "The numbers go up by 2. 8 + 2 = 10.", "How much is added each time?"],
    [4, "CT", 3, "ORDER", 2, "ALGORITHMIC", "Put these numbers from smallest to largest.", "120|210|1,002|2,100", "", "Compare digits from the left: 120 < 210 < 1,002 < 2,100.", ""],
    [4, "EVS", 6, "TRUE_FALSE", 1, "EVALUATION", "True or false: plastic bottles can be recycled.", "", "true", "Most plastic bottles can be collected and recycled into new things.", ""],
  ]);
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="questions_template.csv"' } });
}
