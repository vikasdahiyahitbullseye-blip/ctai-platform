"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser, audit } from "@/lib/auth";
import { tempPassword, hashPassword, staffUsername } from "@/lib/accounts";
import { DEFAULT_HOUSES } from "@/lib/constants";

export async function createSchool(_: unknown, form: FormData) {
  const user = await requireUser("SUPERADMIN");
  const p = z.object({
    name: z.string().trim().min(3, "School name is required"),
    city: z.string().trim().min(2, "City is required"),
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,20}$/, "Code: 3–20 letters, numbers or dashes"),
    adminName: z.string().trim().min(3, "Admin name is required"),
  }).safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0].message };
  if (await prisma.school.findUnique({ where: { code: p.data.code } })) return { error: "That school code is already used." };
  const school = await prisma.school.create({ data: { name: p.data.name, city: p.data.city, code: p.data.code, houses: { create: DEFAULT_HOUSES } } });
  const username = await staffUsername(p.data.adminName);
  const password = tempPassword();
  await prisma.user.create({ data: { schoolId: school.id, role: "ADMIN", name: p.data.adminName, username, passwordHash: await hashPassword(password), mustChangePassword: true } });
  await audit(user, "SCHOOL_CREATED", `${p.data.name} (${p.data.code})`);
  revalidatePath("/hq");
  return { ok: true, credentials: [{ name: p.data.adminName, username, password, className: p.data.name }] };
}

export async function toggleSchool(schoolId: string) {
  const user = await requireUser("SUPERADMIN");
  const s = await prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
  if (s.isHq) return;
  await prisma.school.update({ where: { id: schoolId }, data: { active: !s.active } });
  await audit(user, s.active ? "SCHOOL_SUSPENDED" : "SCHOOL_REACTIVATED", s.name);
  revalidatePath("/hq");
}
