"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, homeFor } from "@/lib/auth";

export async function login(_: unknown, form: FormData) {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return { error: "Wrong username or password." };
  if (!user.active) return { error: "This account has been deactivated. Please contact your school." };
  await createSession(user.id, user.role);
  redirect(user.mustChangePassword ? "/account?first=1" : homeFor(user.role));
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function changePassword(_: unknown, form: FormData) {
  const { getSessionUser } = await import("@/lib/auth");
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (!(await bcrypt.compare(current, user.passwordHash))) return { error: "Your current password is not correct." };
  if (next.length < 6) return { error: "The new password must have at least 6 characters." };
  if (next !== String(form.get("confirm") ?? "")) return { error: "The two new passwords don't match." };
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 10), mustChangePassword: false } });
  return { ok: true, home: homeFor(user.role) };
}
