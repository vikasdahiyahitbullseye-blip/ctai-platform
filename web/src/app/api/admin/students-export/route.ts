import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { requireSchoolAdmin } from "@/lib/auth";
import { writeXlsx } from "@/lib/spreadsheet";
import { STUDENT_COLUMNS, exportRows } from "@/lib/bulkEdit";

/** The school's students (or one class) as an Excel file to edit and upload again. */
export async function GET(req: Request) {
  if (!(await getSessionUser())) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const admin = await requireSchoolAdmin();
  const sectionId = new URL(req.url).searchParams.get("section") || undefined;
  const section = sectionId ? await prisma.classSection.findFirst({ where: { id: sectionId, schoolId: admin.schoolId } }) : null;
  if (sectionId && !section) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  const rows = await exportRows(admin.schoolId, section?.id);
  const buf = await writeXlsx("Students", STUDENT_COLUMNS, rows);
  const name = `students-${section ? `class-${section.classLevel}${section.section}` : "all"}.xlsx`;
  return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${name}"` } });
}
