// Bulk import of new teachers and school admins from a spreadsheet. Every row is checked first; accounts are
// created only when the whole file is clean, all in one go, each with a temporary password.
import "server-only";
import { prisma } from "./db";
import { parseTeaches } from "./bulkEdit";
import { staffUsername, tempPassword, hashPassword } from "./accounts";
import type { ZodType } from "zod";
import { email, phone, name as nameRule, opt } from "./personFields";

export const STAFF_IMPORT_COLUMNS = [
  { header: "Name", key: "name", width: 26, note: "Full name, e.g. Anjali Mehra. Required." },
  { header: "Role (teacher/admin)", key: "role", width: 12, note: "teacher or admin. Leave empty for teacher." },
  { header: "Designation", key: "designation", width: 22, note: "Optional, e.g. TGT Computer Science" },
  { header: "Email", key: "email", width: 26 },
  { header: "Phone", key: "phone", width: 18 },
  { header: "Teaches", key: "teaches", width: 28, note: "Optional. Class-section and subject, separated by ; e.g. 6-A CT; 7-A AI. AI is for Classes 6–8." },
];
const ALIASES: Record<string, string> = {
  roleteacheradmin: "role", teachername: "name", fullname: "name", staffname: "name", mobile: "phone", phonenumber: "phone",
  mobilenumber: "phone", emailid: "email", emailaddress: "email", classes: "teaches", teachesclasses: "teaches", classesandsubjects: "teaches",
  post: "designation",
};
export const MAX_STAFF_IMPORT = 300;
/** "Ms. Anjali  Mehra" and "anjali mehra" are the same person for duplicate checks. */
const nameKey = (n: string) => n.toLowerCase().replace(/^(mr|mrs|ms|miss|dr|prof)\.?\s+/, "").replace(/[^a-z0-9]+/g, " ").trim();

export type StaffImportRow = {
  line: number; name: string; role: "teacher" | "admin"; designation: string; email: string; phone: string; teaches: string;
  errors: string[]; warnings: string[];
};
type NewStaff = { name: string; role: "TEACHER" | "ADMIN"; designation: string | null; email: string | null; phone: string | null; teaches: { sectionId: string; subject: string }[] };

export function parseRole(v: string | undefined): "TEACHER" | "ADMIN" | null {
  const s = (v ?? "").trim().toLowerCase();
  if (!s || ["teacher", "t", "staff"].includes(s)) return "TEACHER";
  if (["admin", "a", "school admin", "schooladmin", "principal", "coordinator"].includes(s)) return "ADMIN";
  return null;
}

/** Checks the rows of an uploaded file. Nothing is saved. */
export async function checkStaffImport(schoolId: string, table: Record<string, string>[]) {
  const rows = table.map((r) => {
    const o: Record<string, string> = {};
    for (const [k, v] of Object.entries(r)) o[ALIASES[k] ?? k] = v;
    return o;
  });
  const known = new Set([...STAFF_IMPORT_COLUMNS.map((c) => c.key), "__line"]);
  const headers = new Set(rows.flatMap((r) => Object.keys(r)));
  const ignored = [...headers].filter((k) => !known.has(k));
  if (rows.length && !headers.has("name")) return { error: "The file needs a Name column in row 1. Download the template to see the headings." };

  const [sections, existing] = await Promise.all([
    prisma.classSection.findMany({ where: { schoolId } }),
    prisma.user.findMany({ where: { schoolId, role: { in: ["TEACHER", "ADMIN"] } }, select: { name: true, email: true, username: true } }),
  ]);
  const existingNames = new Map(existing.map((u) => [nameKey(u.name), u.username]));
  const existingEmails = new Map(existing.filter((u) => u.email).map((u) => [u.email!.toLowerCase(), u.username]));
  const seenName = new Map<string, number>(), seenEmail = new Map<string, number>();
  const out: StaffImportRow[] = [];
  const creates: NewStaff[] = [];

  for (const r of rows) {
    const line = Number(r.__line);
    const errors: string[] = [], warnings: string[] = [];
    const take = (rule: ZodType<string | null>, v: string | undefined, label: string) => {
      const p = rule.safeParse(v ?? "");
      if (p.success) return p.data;
      const msg = p.error.issues[0].message;
      errors.push(msg.startsWith(label) ? msg : `${label}: ${msg}`);
      return null;
    };
    const nm = take(nameRule, r.name, "Name");
    if (nm && /[<>]/.test(nm)) errors.push("Name: please remove < and >");
    const role = parseRole(r.role);
    if (!role) errors.push("Role: write teacher or admin (or leave it empty for teacher)");
    const designation = take(opt(60), r.designation, "Designation");
    const em = take(email, r.email, "Email");
    const ph = take(phone, r.phone, "Phone");
    const { parsed, errors: tErrors } = parseTeaches(r.teaches ?? "", sections);
    errors.push(...tErrors);

    if (nm) {
      const k = nameKey(nm);
      if (seenName.has(k)) errors.push(`${nm} is also on row ${seenName.get(k)} — remove the repeated row`);
      else seenName.set(k, line);
      if (existingNames.has(k)) warnings.push(`A teacher or admin called ${nm} already exists (username ${existingNames.get(k)}). A second account will be created — remove the row if this is the same person.`);
    }
    if (em) {
      const k = em.toLowerCase();
      if (seenEmail.has(k)) errors.push(`Email is also used on row ${seenEmail.get(k)}`);
      else seenEmail.set(k, line);
      if (existingEmails.has(k)) errors.push(`Email already belongs to ${existingEmails.get(k)} — use Bulk edit to change existing staff`);
    }
    out.push({
      line, name: nm ?? r.name ?? "", role: role === "ADMIN" ? "admin" : "teacher", designation: designation ?? "", email: em ?? r.email ?? "", phone: ph ?? r.phone ?? "",
      teaches: parsed.map((p) => p.label).join("; "), errors, warnings,
    });
    if (!errors.length) creates.push({ name: nm!, role: role!, designation, email: em, phone: ph, teaches: parsed.map(({ sectionId, subject }) => ({ sectionId, subject })) });
  }
  return { rows: out, creates, ignored };
}

/** Creates the accounts (all or nothing) and returns their one-time logins. */
export async function createStaff(schoolId: string, creates: NewStaff[]) {
  const taken = new Set<string>();
  const prepared = [];
  for (const c of creates) {
    const username = await staffUsername(c.name, taken);
    const password = tempPassword();
    prepared.push({ c, username, password, passwordHash: await hashPassword(password) });
  }
  await prisma.$transaction(prepared.map(({ c, username, passwordHash }) => prisma.user.create({
    data: {
      schoolId, role: c.role, name: c.name, username, passwordHash, mustChangePassword: true,
      designation: c.designation, email: c.email, phone: c.phone,
      teaching: { create: c.teaches },
    },
  })));
  const label = (c: NewStaff) => [c.role === "ADMIN" ? "School admin" : "Teacher", c.designation].filter(Boolean).join(" · ");
  return prepared.map(({ c, username, password }) => ({ name: c.name, username, password, className: label(c) }));
}
