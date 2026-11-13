"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSchoolAdmin, audit } from "@/lib/auth";
import { tempPassword, hashPassword, studentUsername, staffUsername } from "@/lib/accounts";
import { parseCsvObjects } from "@/lib/csv";

type Result = { ok?: boolean; error?: string; credentials?: { name: string; username: string; password: string; className?: string }[] };

async function admin() {
  return requireSchoolAdmin();
}

async function ownSection(schoolId: string, sectionId: string) {
  const s = await prisma.classSection.findFirst({ where: { id: sectionId, schoolId } });
  if (!s) throw new Error("Section not found");
  return s;
}
async function ownUser(schoolId: string, userId: string) {
  const u = await prisma.user.findFirst({ where: { id: userId, schoolId } });
  if (!u) throw new Error("User not found");
  return u;
}

// ---------- Classes ----------
export async function addSection(_: unknown, form: FormData): Promise<Result> {
  const user = await admin();
  const p = z.object({ classLevel: z.coerce.number().int().min(3).max(8), section: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{1,3}$/, "Section must be 1–3 letters/numbers") }).safeParse({ classLevel: form.get("classLevel"), section: form.get("section") });
  if (!p.success) return { error: p.error.issues[0].message };
  const exists = await prisma.classSection.findFirst({ where: { schoolId: user.schoolId, ...p.data } });
  if (exists) return { error: `Class ${p.data.classLevel}-${p.data.section} already exists.` };
  await prisma.classSection.create({ data: { schoolId: user.schoolId, ...p.data, leaderboard: true } });
  await audit(user, "SECTION_CREATED", `${p.data.classLevel}-${p.data.section}`);
  revalidatePath("/admin/classes");
  return { ok: true };
}

export async function deleteSection(sectionId: string) {
  const user = await admin();
  const s = await ownSection(user.schoolId, sectionId);
  const n = await prisma.enrollment.count({ where: { sectionId } });
  if (n) throw new Error("Move or remove the students first.");
  await prisma.teacherAssignment.deleteMany({ where: { sectionId } });
  await prisma.classSection.delete({ where: { id: sectionId } });
  await audit(user, "SECTION_DELETED", `${s.classLevel}-${s.section}`);
  revalidatePath("/admin/classes");
}

export async function assignTeacher(sectionId: string, form: FormData) {
  const user = await admin();
  await ownSection(user.schoolId, sectionId);
  const teacher = await ownUser(user.schoolId, String(form.get("teacherId")));
  const subject = form.get("subject") === "AI" ? "AI" : form.get("subject") === "PROJECT" ? "PROJECT" : "CT";
  await prisma.teacherAssignment.upsert({ where: { userId_sectionId_subject: { userId: teacher.id, sectionId, subject } }, create: { userId: teacher.id, sectionId, subject }, update: {} });
  await audit(user, "TEACHER_ASSIGNED", `${teacher.name} → ${subject}`);
  revalidatePath("/admin/classes");
}

export async function unassignTeacher(assignmentId: string) {
  const user = await admin();
  const a = await prisma.teacherAssignment.findFirst({ where: { id: assignmentId, section: { schoolId: user.schoolId } }, include: { user: true } });
  if (!a) return;
  await prisma.teacherAssignment.delete({ where: { id: assignmentId } });
  await audit(user, "TEACHER_UNASSIGNED", a.user.name);
  revalidatePath("/admin/classes");
}

// ---------- Teachers ----------
export async function addTeacher(_: unknown, form: FormData): Promise<Result> {
  const user = await admin();
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 3) return { error: "Please enter the teacher's full name." };
  const role = form.get("role") === "ADMIN" ? "ADMIN" : "TEACHER";
  const username = await staffUsername(name);
  const password = tempPassword();
  await prisma.user.create({ data: { schoolId: user.schoolId, role, name, username, passwordHash: await hashPassword(password), mustChangePassword: true } });
  await audit(user, "STAFF_CREATED", `${name} (${role})`);
  revalidatePath("/admin/teachers");
  return { ok: true, credentials: [{ name, username, password }] };
}

// ---------- Students ----------
export async function addStudent(_: unknown, form: FormData): Promise<Result> {
  const user = await admin();
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Please enter the student's name." };
  const section = await ownSection(user.schoolId, String(form.get("sectionId")));
  const rollNo = String(form.get("rollNo") ?? "").trim() || null;
  const username = await studentUsername(name, section.classLevel, section.section, rollNo);
  const password = tempPassword();
  const s = await prisma.user.create({ data: { schoolId: user.schoolId, role: "STUDENT", name, username, rollNo, passwordHash: await hashPassword(password) } });
  await prisma.enrollment.create({ data: { userId: s.id, sectionId: section.id } });
  await audit(user, "STUDENT_CREATED", `${name} → ${section.classLevel}-${section.section}`);
  revalidatePath("/admin/students");
  return { ok: true, credentials: [{ name, username, password, className: `${section.classLevel}-${section.section}` }] };
}

export async function updateStudent(studentId: string, form: FormData) {
  const user = await admin();
  const s = await ownUser(user.schoolId, studentId);
  const sectionId = String(form.get("sectionId") ?? "");
  const name = String(form.get("name") ?? s.name).trim() || s.name;
  const rollNo = String(form.get("rollNo") ?? "").trim() || null;
  await prisma.user.update({ where: { id: s.id }, data: { name, rollNo } });
  if (sectionId) {
    await ownSection(user.schoolId, sectionId);
    await prisma.enrollment.deleteMany({ where: { userId: s.id } });
    await prisma.enrollment.create({ data: { userId: s.id, sectionId } });
  }
  await audit(user, "STUDENT_UPDATED", name);
  revalidatePath("/admin/students");
}

export async function setActive(userId: string, active: boolean) {
  const user = await admin();
  const u = await ownUser(user.schoolId, userId);
  if (u.id === user.id) throw new Error("You can't deactivate yourself.");
  await prisma.user.update({ where: { id: u.id }, data: { active } });
  await audit(user, active ? "USER_REACTIVATED" : "USER_DEACTIVATED", u.name);
  revalidatePath("/admin/students");
  revalidatePath("/admin/teachers");
}

export async function resetPassword(userId: string): Promise<Result> {
  const user = await admin();
  const u = await ownUser(user.schoolId, userId);
  const password = tempPassword();
  await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await hashPassword(password), mustChangePassword: u.role !== "STUDENT" } });
  await audit(user, "PASSWORD_RESET", u.name);
  return { ok: true, credentials: [{ name: u.name, username: u.username, password }] };
}

// ---------- Bulk import ----------
export type ImportRow = { line: number; name: string; className: string; rollNo: string; errors: string[] };

/** Validates a students CSV (columns: name, class, section, roll; other columns are ignored). Returns a preview; nothing is saved. */
export async function previewImport(_: unknown, form: FormData): Promise<{ rows?: ImportRow[]; error?: string; csv?: string }> {
  const user = await admin();
  let csv = String(form.get("csv") ?? "");
  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > 1_000_000) return { error: "File is larger than 1 MB." };
    csv = await file.text();
  }
  const rows = parseCsvObjects(csv);
  if (!rows.length) return { error: "No rows found. The first row must be the header: name,class,section,roll" };
  if (rows.length > 1000) return { error: "Please import at most 1,000 students at a time." };
  const sections = await prisma.classSection.findMany({ where: { schoolId: user.schoolId } });
  const seen = new Set<string>();
  const out: ImportRow[] = rows.map((r, i) => {
    const errors: string[] = [];
    const name = r.name ?? "";
    const cls = Number(r.class);
    const sec = (r.section ?? "").toUpperCase();
    if (name.length < 2) errors.push("Name missing");
    if (!sections.some((s) => s.classLevel === cls && s.section === sec)) errors.push(`Class ${r.class || "?"}-${sec || "?"} does not exist — create it first`);
    const key = `${name.toLowerCase()}|${cls}|${sec}|${r.roll}`;
    if (seen.has(key)) errors.push("Duplicate row");
    seen.add(key);
    return { line: i + 2, name, className: `${cls}-${sec}`, rollNo: r.roll ?? "", errors };
  });
  return { rows: out, csv };
}

export async function commitImport(csv: string): Promise<Result> {
  const user = await admin();
  const fd = new FormData();
  fd.set("csv", csv);
  const p = await previewImport(undefined, fd);
  if (!p.rows || p.rows.some((r) => r.errors.length)) return { error: "Fix the errors in the file before importing." };
  const sections = await prisma.classSection.findMany({ where: { schoolId: user.schoolId } });
  const credentials: NonNullable<Result["credentials"]> = [];
  for (const r of p.rows) {
    const [cls, sec] = r.className.split("-");
    const section = sections.find((s) => s.classLevel === Number(cls) && s.section === sec)!;
    const username = await studentUsername(r.name, section.classLevel, section.section, r.rollNo || null);
    const password = tempPassword();
    const s = await prisma.user.create({ data: { schoolId: user.schoolId, role: "STUDENT", name: r.name, username, rollNo: r.rollNo || null, passwordHash: await hashPassword(password) } });
    await prisma.enrollment.create({ data: { userId: s.id, sectionId: section.id } });
    credentials.push({ name: r.name, username, password, className: r.className });
  }
  await audit(user, "STUDENTS_IMPORTED", `${credentials.length} students`);
  revalidatePath("/admin/students");
  return { ok: true, credentials };
}
