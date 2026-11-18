import { NextResponse } from "next/server";
import { getSessionUser, requireSchoolAdmin } from "@/lib/auth";
import { writeXlsx } from "@/lib/spreadsheet";
import { STAFF_COLUMNS, exportStaffRows } from "@/lib/bulkEdit";

/** The school's teachers and admins as an Excel file to edit and upload again. */
export async function GET() {
  if (!(await getSessionUser())) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const admin = await requireSchoolAdmin();
  const buf = await writeXlsx("Teachers and staff", STAFF_COLUMNS, await exportStaffRows(admin.schoolId));
  return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": 'attachment; filename="teachers-and-staff.xlsx"' } });
}
