// Bulk edit of students from a spreadsheet: the school admin downloads the current list, edits it in Excel and
// uploads it. Rows are matched by Student ID (or by username if the ID is blank). A column that is left out of the
// file is not changed; a blank cell clears an optional detail. Nothing is saved until the preview is accepted.
import "server-only";
import { prisma } from "./db";
import { headerKey } from "./spreadsheet";
import { opt, phone, email, username as usernameRule, name as nameRule, dob } from "./personFields";
import type { ZodType } from "zod";
import type { Prisma } from "@prisma/client";

type Field = "username" | "name" | "rollNo" | "admissionNo" | "dateOfBirth" | "guardianName" | "guardianPhone" | "email" | "phone";
export const STUDENT_COLUMNS: { header: string; key: string; field?: Field; width: number; note?: string; locked?: boolean }[] = [
  { header: "Student ID", key: "id", width: 28, locked: true, note: "Do not change: this is how each row is matched to a student." },
  { header: "Username", key: "username", field: "username", width: 20, note: "Changing it changes how the student signs in. The password stays the same." },
  { header: "Name", key: "name", field: "name", width: 26 },
  { header: "Class", key: "class", width: 8, note: "3 to 8. The class and section must already exist (Classes page)." },
  { header: "Section", key: "section", width: 9 },
  { header: "Roll no", key: "rollno", field: "rollNo", width: 9 },
  { header: "Admission no", key: "admissionno", field: "admissionNo", width: 16 },
  { header: "Date of birth (YYYY-MM-DD)", key: "dateofbirth", field: "dateOfBirth", width: 18 },
  { header: "Parent/guardian name", key: "guardianname", field: "guardianName", width: 24 },
  { header: "Parent/guardian phone", key: "guardianphone", field: "guardianPhone", width: 20 },
  { header: "Email", key: "email", field: "email", width: 26 },
  { header: "Phone", key: "phone", field: "phone", width: 18 },
  { header: "Status (active/inactive)", key: "status", width: 14, note: "active or inactive. Inactive students cannot sign in." },
];
/** Other headings people use for the same columns. */
const ALIASES: Record<string, string> = {
  studentid: "id", id: "id", roll: "rollno", rollnumber: "rollno", admissionnumber: "admissionno", admno: "admissionno",
  dateofbirthyyyymmdd: "dateofbirth", dob: "dateofbirth", birthdate: "dateofbirth",
  parentguardianname: "guardianname", parentname: "guardianname", fathername: "guardianname", mothername: "guardianname",
  parentguardianphone: "guardianphone", parentphone: "guardianphone", guardianmobile: "guardianphone", parentmobile: "guardianphone",
  mobile: "phone", phonenumber: "phone", statusactiveinactive: "status", studentname: "name", fullname: "name",
};
const LABEL: Record<string, string> = Object.fromEntries(STUDENT_COLUMNS.map((c) => [c.key, c.header.replace(/ \(.*\)$/, "")]));
const RULES: Record<Field, ZodType<string | null>> = {
  username: usernameRule, name: nameRule, rollNo: opt(10), admissionNo: opt(30), dateOfBirth: dob,
  guardianName: opt(80), guardianPhone: phone, email, phone,
};

/**
 * Dates as people type them in Excel: 2015-08-14, 14/08/2015 or 14-08-2015 (day first, as in India), 14.08.2015,
 * or an Excel date serial number (days since 1899-12-30). Anything else is passed on and reported.
 */
export function normalDate(v: string) {
  const t = v.trim();
  let m = t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = t.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  if (/^\d{4,5}(\.\d+)?$/.test(t)) {
    const d = new Date(Math.round((Number(t) - 25569) * 86400000));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }
  return t;
}

export async function exportRows(schoolId: string, sectionId?: string) {
  const students = await prisma.user.findMany({
    where: { schoolId, role: "STUDENT", ...(sectionId ? { enrollments: { some: { sectionId } } } : {}) },
    include: { enrollments: { include: { section: true } } },
    orderBy: [{ name: "asc" }],
  });
  const sec = (s: (typeof students)[number]) => s.enrollments[0]?.section;
  students.sort((a, b) => (sec(a)?.classLevel ?? 0) - (sec(b)?.classLevel ?? 0) || (sec(a)?.section ?? "").localeCompare(sec(b)?.section ?? "") || (Number(a.rollNo) || 999) - (Number(b.rollNo) || 999) || a.name.localeCompare(b.name));
  return students.map((s) => [s.id, s.username, s.name, sec(s) ? String(sec(s)!.classLevel) : "", sec(s)?.section ?? "", s.rollNo, s.admissionNo, s.dateOfBirth, s.guardianName, s.guardianPhone, s.email, s.phone, s.active ? "active" : "inactive"]);
}

export type Change = { label: string; from: string; to: string };
export type BulkRow = { line: number; name: string; username: string; changes: Change[]; errors: string[] };
export type BulkPreview = { rows: BulkRow[]; changed: number; unchanged: number; withErrors: number; columns: string[]; ignored: string[] };
type Update = { id: string; data: Partial<Record<Field, string | null>>; sectionId?: string; active?: boolean };

/** Checks every row against the school's students. Returns the preview and, when there are no errors, the updates. */
export async function checkBulkEdit(schoolId: string, table: Record<string, string>[]): Promise<{ preview: BulkPreview; updates: Update[] }> {
  const rows = table.map((r) => {
    const o: Record<string, string> = { __line: r.__line };
    for (const [k, v] of Object.entries(r)) if (k !== "__line") o[ALIASES[k] ?? k] = v;
    return o;
  });
  const known = new Set(STUDENT_COLUMNS.map((c) => c.key));
  const present = new Set(Object.keys(rows[0] ?? {}).filter((k) => k !== "__line"));
  const columns = STUDENT_COLUMNS.filter((c) => present.has(c.key)).map((c) => c.header);
  const ignored = [...present].filter((k) => !known.has(k));

  const students = await prisma.user.findMany({ where: { schoolId, role: "STUDENT" }, include: { enrollments: true } });
  const byId = new Map(students.map((s) => [s.id, s]));
  const byUsername = new Map(students.map((s) => [s.username, s]));
  const sections = await prisma.classSection.findMany({ where: { schoolId } });
  const out: BulkRow[] = [];
  const updates: Update[] = [];
  const seenStudents = new Set<string>();
  const newUsernames = new Map<string, number>();

  for (const r of rows) {
    const line = Number(r.__line);
    const errors: string[] = [];
    const s = r.id ? byId.get(r.id) : r.username ? byUsername.get(r.username.toLowerCase()) : undefined;
    if (!s) {
      out.push({ line, name: r.name ?? "", username: r.username ?? "", changes: [], errors: [r.id ? "Unknown Student ID — download a fresh list and do not change this column" : "No Student ID, and no student with this username"] });
      continue;
    }
    if (seenStudents.has(s.id)) errors.push("This student appears more than once in the file");
    seenStudents.add(s.id);
    const changes: Change[] = [];
    const data: Update["data"] = {};
    for (const c of STUDENT_COLUMNS) {
      if (!c.field || !present.has(c.key)) continue;
      if (c.field === "username" && !r.id) continue; // the username was used to find the student
      const raw = c.field === "dateOfBirth" ? normalDate(r[c.key] ?? "") : (r[c.key] ?? "");
      const parsed = RULES[c.field].safeParse(raw);
      if (!parsed.success) {
        const m = parsed.error.issues[0].message;
        errors.push(m.toLowerCase().startsWith(LABEL[c.key].toLowerCase()) ? m : `${LABEL[c.key]}: ${m}`);
        continue;
      }
      const now = (s[c.field] as string | null) ?? null;
      if (parsed.data !== now) { data[c.field] = parsed.data; changes.push({ label: LABEL[c.key], from: now ?? "", to: parsed.data ?? "" }); }
    }
    if (data.username) {
      const other = await prisma.user.findUnique({ where: { username: data.username } });
      if (other && other.id !== s.id) errors.push(`Username "${data.username}" is already taken`);
      const dup = newUsernames.get(data.username);
      if (dup) errors.push(`Username "${data.username}" is also used on row ${dup}`);
      newUsernames.set(data.username, line);
    }
    let sectionId: string | undefined;
    if (present.has("class") || present.has("section")) {
      const cls = Number(r.class), sec = (r.section ?? "").trim().toUpperCase();
      const target = sections.find((x) => x.classLevel === cls && x.section === sec);
      if (!target) errors.push(`Class ${r.class || "?"}-${sec || "?"} does not exist — create it first on the Classes page`);
      else if (s.enrollments[0]?.sectionId !== target.id) {
        sectionId = target.id;
        const old = sections.find((x) => x.id === s.enrollments[0]?.sectionId);
        changes.push({ label: "Class", from: old ? `${old.classLevel}-${old.section}` : "", to: `${target.classLevel}-${target.section}` });
      }
    }
    let active: boolean | undefined;
    if (present.has("status") && r.status) {
      const v = r.status.trim().toLowerCase();
      if (["active", "yes", "y"].includes(v)) active = true;
      else if (["inactive", "deactivated", "no", "n", "left"].includes(v)) active = false;
      else errors.push("Status: write active or inactive");
      if (active !== undefined && active !== s.active) changes.push({ label: "Status", from: s.active ? "active" : "inactive", to: active ? "active" : "inactive" });
      else active = undefined;
    }
    out.push({ line, name: data.name ?? s.name, username: s.username, changes, errors });
    if (!errors.length && changes.length) updates.push({ id: s.id, data, sectionId, active });
  }
  const withErrors = out.filter((r) => r.errors.length).length;
  return {
    preview: { rows: out, changed: out.filter((r) => !r.errors.length && r.changes.length).length, unchanged: out.filter((r) => !r.errors.length && !r.changes.length).length, withErrors, columns, ignored },
    updates: withErrors ? [] : updates,
  };
}

export async function applyBulkEdit(updates: Update[]) {
  for (const u of updates) {
    // name and username are required by their rules, so they are never null here
    await prisma.user.update({ where: { id: u.id }, data: { ...u.data, ...(u.active !== undefined ? { active: u.active } : {}) } as Prisma.UserUpdateInput });
    if (u.sectionId) {
      await prisma.enrollment.deleteMany({ where: { userId: u.id } });
      await prisma.enrollment.create({ data: { userId: u.id, sectionId: u.sectionId } });
    }
  }
}

export { headerKey };
