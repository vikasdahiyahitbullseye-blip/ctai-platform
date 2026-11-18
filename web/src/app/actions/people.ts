"use server";
// Editing people and schools: school admins edit their students and staff, HQ edits schools and its staff logins,
// and staff edit their own contact details. Every change is written to the activity log.
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireSchoolAdmin, requireUser, audit } from "@/lib/auth";

export type EditResult = { ok?: boolean; error?: string; message?: string } | undefined;

const opt = (max: number) => z.string().trim().max(max).transform((v) => v || null);
const phone = z.string().trim().refine((v) => !v || /^[+0-9][0-9 ()\-]{5,19}$/.test(v), "Phone: digits, spaces, + or - only (6–20 characters)").transform((v) => v || null);
const email = z.string().trim().refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Please enter a valid email address").transform((v) => v || null);
const username = z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{3,40}$/, "Username: 3–40 lowercase letters, numbers, dots, dashes or underscores");
const name = z.string().trim().min(2, "Name is required").max(80);
const dob = z.string().trim().refine((v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)) && new Date(v) < new Date() && v > "1900-01-01"), "Please enter a valid date of birth").transform((v) => v || null);

async function usernameFree(u: string, exceptId: string) {
  const other = await prisma.user.findUnique({ where: { username: u } });
  return !other || other.id === exceptId;
}

/** Fields that changed, for the activity log (values are not logged). */
function changed(before: Record<string, unknown>, after: Record<string, unknown>) {
  return Object.keys(after).filter((k) => (before[k] ?? null) !== (after[k] ?? null));
}

// ---------- School admin: students and staff ----------
export async function updatePerson(userId: string, _: EditResult, form: FormData): Promise<EditResult> {
  const admin = await requireSchoolAdmin();
  const u = await prisma.user.findFirst({ where: { id: userId, schoolId: admin.schoolId }, include: { enrollments: true } });
  if (!u || !["STUDENT", "TEACHER", "ADMIN"].includes(u.role)) return { error: "Person not found in this school." };
  const f = Object.fromEntries(form);
  const base = z.object({ name, username, email, phone }).safeParse(f);
  if (!base.success) return { error: base.error.issues[0].message };
  if (!(await usernameFree(base.data.username, u.id))) return { error: `The username "${base.data.username}" is already taken.` };

  if (u.role === "STUDENT") {
    const p = z.object({ rollNo: opt(10), admissionNo: opt(30), dateOfBirth: dob, guardianName: opt(80), guardianPhone: phone, sectionId: z.string().min(1, "Choose a class") }).safeParse(f);
    if (!p.success) return { error: p.error.issues[0].message };
    const { sectionId, ...rest } = p.data;
    const section = await prisma.classSection.findFirst({ where: { id: sectionId, schoolId: admin.schoolId } });
    if (!section) return { error: "Choose a class in this school." };
    const data = { ...base.data, ...rest };
    const fields = changed(u, data);
    await prisma.user.update({ where: { id: u.id }, data });
    if (u.enrollments[0]?.sectionId !== section.id) {
      await prisma.enrollment.deleteMany({ where: { userId: u.id } });
      await prisma.enrollment.create({ data: { userId: u.id, sectionId: section.id } });
      fields.push("class");
    }
    if (fields.length) await audit(admin, "STUDENT_UPDATED", `${data.name}: ${fields.join(", ")}`);
  } else {
    const p = z.object({ designation: opt(60), role: z.enum(["TEACHER", "ADMIN"]) }).safeParse(f);
    if (!p.success) return { error: p.error.issues[0].message };
    if (u.id === admin.id && p.data.role !== u.role) return { error: "You can't change your own role." };
    if (u.role === "ADMIN" && p.data.role === "TEACHER") {
      const admins = await prisma.user.count({ where: { schoolId: admin.schoolId, role: "ADMIN", active: true } });
      if (admins <= 1) return { error: "This is the school's only admin. Make someone else an admin first." };
    }
    const data = { ...base.data, ...p.data };
    const fields = changed(u, data);
    await prisma.user.update({ where: { id: u.id }, data });
    if (fields.length) await audit(admin, "STAFF_UPDATED", `${data.name}: ${fields.join(", ")}`);
  }
  revalidatePath("/admin/students");
  revalidatePath("/admin/teachers");
  revalidatePath(`/admin/people/${u.id}`);
  return { ok: true, message: "Saved." };
}

// ---------- HQ: schools and HQ staff ----------
export async function updateSchool(schoolId: string, _: EditResult, form: FormData): Promise<EditResult> {
  const hq = await requireUser("SUPERADMIN");
  const s = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!s || s.isHq) return { error: "School not found." };
  const p = z.object({
    name: z.string().trim().min(3, "School name is required").max(120),
    city: z.string().trim().min(2, "City is required").max(60),
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,20}$/, "Code: 3–20 letters, numbers or dashes"),
    session: z.string().trim().regex(/^\d{4}-\d{2}$/, "Session like 2026-27"),
  }).safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0].message };
  const clash = await prisma.school.findUnique({ where: { code: p.data.code } });
  if (clash && clash.id !== s.id) return { error: "That school code is already used." };
  const fields = changed(s, p.data);
  await prisma.school.update({ where: { id: s.id }, data: p.data });
  if (fields.length) await audit(hq, "SCHOOL_UPDATED", `${p.data.name}: ${fields.join(", ")}`);
  revalidatePath("/hq");
  return { ok: true, message: "Saved." };
}

export async function updateHqStaff(userId: string, _: EditResult, form: FormData): Promise<EditResult> {
  const hq = await requireUser("SUPERADMIN");
  const u = await prisma.user.findFirst({ where: { id: userId, schoolId: hq.schoolId } });
  if (!u) return { error: "Staff login not found." };
  const f = Object.fromEntries(form);
  const p = z.object({ name, username, email, phone }).safeParse(f);
  if (!p.success) return { error: p.error.issues[0].message };
  if (!(await usernameFree(p.data.username, u.id))) return { error: `The username "${p.data.username}" is already taken.` };
  const data: Record<string, unknown> = { ...p.data };
  if (u.role === "REVIEWER" || u.role === "CONTENT") {
    const r = z.enum(["REVIEWER", "CONTENT"]).safeParse(f.role);
    if (r.success) data.role = r.data;
  }
  if (u.role === "GROUPADMIN" && f.schoolGroupId) {
    const g = await prisma.schoolGroup.findUnique({ where: { id: String(f.schoolGroupId) } });
    if (!g) return { error: "Choose a group." };
    data.schoolGroupId = g.id;
  }
  const fields = changed(u, data);
  await prisma.user.update({ where: { id: u.id }, data });
  if (fields.length) await audit(hq, "STAFF_UPDATED", `${p.data.name}: ${fields.join(", ")}`);
  revalidatePath("/hq/staff");
  revalidatePath("/hq");
  return { ok: true, message: "Saved." };
}

export async function renameSchoolGroup(groupId: string, _: EditResult, form: FormData): Promise<EditResult> {
  const hq = await requireUser("SUPERADMIN");
  const p = z.string().trim().min(3, "Group name is required").max(100).safeParse(form.get("name"));
  if (!p.success) return { error: p.error.issues[0].message };
  const g = await prisma.schoolGroup.findUnique({ where: { id: groupId } });
  if (!g) return { error: "Group not found." };
  await prisma.schoolGroup.update({ where: { id: g.id }, data: { name: p.data } });
  if (g.name !== p.data) await audit(hq, "SCHOOL_GROUP_RENAMED", `${g.name} → ${p.data}`);
  revalidatePath("/hq");
  return { ok: true, message: "Saved." };
}

// ---------- Anyone except students: own contact details ----------
export async function updateMyContact(_: EditResult, form: FormData): Promise<EditResult> {
  const me = await requireUser();
  if (me.role === "STUDENT") return { error: "Please ask your teacher or school office to change your details." };
  const p = z.object({ email, phone }).safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0].message };
  await prisma.user.update({ where: { id: me.id }, data: p.data });
  revalidatePath("/account");
  return { ok: true, message: "Saved." };
}
