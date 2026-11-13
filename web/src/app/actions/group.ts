"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ACTING_SCHOOL, requireUser } from "@/lib/auth";
import { tempPassword, hashPassword, staffUsername } from "@/lib/accounts";

/** A group admin opens one of their schools: the school-admin pages then work on that school. */
export async function openSchool(schoolId: string) {
  const user = await requireUser("GROUPADMIN");
  const school = await prisma.school.findFirst({ where: { id: schoolId, groupId: user.schoolGroupId ?? "-", isHq: false, active: true } });
  if (!school) redirect("/group");
  (await cookies()).set(ACTING_SCHOOL, school.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 12 * 3600 });
  await prisma.auditLog.create({ data: { schoolId: school.id, actorId: user.id, action: "GROUP_ADMIN_OPENED_SCHOOL", detail: user.name } });
  redirect("/admin");
}

export async function backToGroup() {
  await requireUser("GROUPADMIN");
  (await cookies()).delete(ACTING_SCHOOL);
  redirect("/group");
}

/** A group admin adds a school-admin (principal) login for one of the group's schools. */
export async function createSchoolAdmin(_: unknown, form: FormData) {
  const user = await requireUser("GROUPADMIN");
  const schoolId = String(form.get("schoolId") ?? "");
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 3) return { error: "Name is required." };
  const school = await prisma.school.findFirst({ where: { id: schoolId, groupId: user.schoolGroupId ?? "-", isHq: false } });
  if (!school) return { error: "Choose one of your schools." };
  const username = await staffUsername(name);
  const password = tempPassword();
  await prisma.user.create({ data: { schoolId: school.id, role: "ADMIN", name, username, passwordHash: await hashPassword(password), mustChangePassword: true } });
  await prisma.auditLog.create({ data: { schoolId: school.id, actorId: user.id, action: "STAFF_CREATED", detail: `${name} (ADMIN, by group admin)` } });
  revalidatePath("/group");
  return { ok: true, credentials: [{ name, username, password, className: school.name }] };
}
