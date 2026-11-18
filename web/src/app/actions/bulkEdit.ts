"use server";
import { revalidatePath } from "next/cache";
import { requireSchoolAdmin, audit } from "@/lib/auth";
import { readTable } from "@/lib/spreadsheet";
import { checkBulkEdit, applyBulkEdit, type BulkPreview } from "@/lib/bulkEdit";

export type BulkState = { error?: string; preview?: BulkPreview; table?: string; done?: number } | undefined;

/** Reads the uploaded file and shows what would change. Nothing is saved. */
export async function previewBulkEdit(_: BulkState, form: FormData): Promise<BulkState> {
  const admin = await requireSchoolAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Choose the Excel (.xlsx) or CSV file to upload." };
  if (file.size > 2_000_000) return { error: "File is larger than 2 MB." };
  let table: Record<string, string>[];
  try { table = await readTable(file); } catch (e) { return { error: e instanceof Error ? e.message : "Could not read the file." }; }
  if (!table.length) return { error: "No rows found. Row 1 must be the column headings, as in the downloaded list." };
  if (table.length > 2000) return { error: "Please upload at most 2,000 students at a time." };
  if (!("studentid" in table[0] || "id" in table[0] || "username" in table[0])) return { error: "The file needs a Student ID column (or Username). Start from the downloaded list." };
  const { preview } = await checkBulkEdit(admin.schoolId, table);
  return { preview, table: JSON.stringify(table) };
}

/** Checks the same rows again and saves them. All or nothing: any error stops the whole update. */
export async function applyBulk(table: string): Promise<BulkState> {
  const admin = await requireSchoolAdmin();
  let rows: Record<string, string>[];
  try { rows = JSON.parse(table); } catch { return { error: "Please upload the file again." }; }
  const { preview, updates } = await checkBulkEdit(admin.schoolId, rows);
  if (preview.withErrors) return { error: "Some rows have errors. Fix them in the file and upload it again.", preview, table };
  await applyBulkEdit(updates);
  if (updates.length) await audit(admin, "STUDENTS_BULK_UPDATED", `${updates.length} students: ${[...new Set(preview.rows.flatMap((r) => r.changes.map((c) => c.label)))].join(", ")}`);
  revalidatePath("/admin/students");
  return { done: updates.length };
}
