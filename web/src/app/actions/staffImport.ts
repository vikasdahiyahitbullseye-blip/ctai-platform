"use server";
import { revalidatePath } from "next/cache";
import { requireSchoolAdmin, audit } from "@/lib/auth";
import { readTable } from "@/lib/spreadsheet";
import { checkStaffImport, createStaff, MAX_STAFF_IMPORT, type StaffImportRow } from "@/lib/staffImport";

export type StaffImportState = {
  error?: string; rows?: StaffImportRow[]; ignored?: string[]; table?: string;
  credentials?: { name: string; username: string; password: string; className?: string }[];
} | undefined;

async function tableFrom(form: FormData): Promise<Record<string, string>[] | string> {
  const file = form.get("file");
  const pasted = String(form.get("csv") ?? "").trim();
  let f: File;
  if (file instanceof File && file.size) {
    if (file.size > 1_000_000) return "File is larger than 1 MB.";
    f = file;
  } else if (pasted) f = new File([pasted], "pasted.csv", { type: "text/csv" });
  else return "Choose the Excel (.xlsx) or CSV file to upload, or paste the rows.";
  try { return await readTable(f); } catch (e) { return e instanceof Error ? e.message : "Could not read the file."; }
}

/** Reads the uploaded file and checks every row. Nothing is saved. */
export async function previewStaffImport(_: StaffImportState, form: FormData): Promise<StaffImportState> {
  const admin = await requireSchoolAdmin();
  const table = await tableFrom(form);
  if (typeof table === "string") return { error: table };
  if (!table.length) return { error: "No rows found. Row 1 must be the column headings: Name, Role, Designation, Email, Phone, Teaches." };
  if (table.length > MAX_STAFF_IMPORT) return { error: `Please import at most ${MAX_STAFF_IMPORT} people at a time.` };
  const keys = new Set(table.flatMap((r) => Object.keys(r)));
  if (keys.has("staffid") || keys.has("teacherid")) return { error: "This file has a Staff ID column, so it is a list of existing staff. To change them, use Bulk edit → Teachers & staff." };
  if (keys.has("class") && keys.has("roll")) return { error: "This looks like a students file. Upload it on the Students tab." };
  const res = await checkStaffImport(admin.schoolId, table);
  if ("error" in res) return { error: res.error };
  return { rows: res.rows, ignored: res.ignored, table: JSON.stringify(table) };
}

/** Checks the same rows again and creates all the accounts. Any error stops the whole import. */
export async function commitStaffImport(table: string): Promise<StaffImportState> {
  const admin = await requireSchoolAdmin();
  let rows: Record<string, string>[];
  try { rows = JSON.parse(table); } catch { return { error: "Please upload the file again." }; }
  if (!Array.isArray(rows) || rows.length > MAX_STAFF_IMPORT) return { error: "Please upload the file again." };
  const res = await checkStaffImport(admin.schoolId, rows);
  if ("error" in res) return { error: res.error };
  if (res.rows.some((r) => r.errors.length)) return { error: "Some rows have errors. Fix them in the file and upload it again.", rows: res.rows, table };
  if (!res.creates.length) return { error: "There is nobody to import." };
  const credentials = await createStaff(admin.schoolId, res.creates);
  const admins = res.creates.filter((c) => c.role === "ADMIN").length;
  await audit(admin, "STAFF_IMPORTED", `${credentials.length} staff (${credentials.length - admins} teachers, ${admins} admins): ${credentials.map((c) => c.username).join(", ")}`.slice(0, 1000));
  revalidatePath("/admin/teachers");
  return { credentials };
}
