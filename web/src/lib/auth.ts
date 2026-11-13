import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";
import type { Role } from "./constants";

const COOKIE = "ctai_session";
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? "dev-only-change-me-0123456789abcdef0123456789");

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ uid: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 12 * 3600 });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSessionUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const user = await prisma.user.findUnique({ where: { id: String(payload.uid) }, include: { school: true } });
    // Deactivated users and schools lose access immediately. (A group admin's access comes from the group, not one school.)
    if (!user || !user.active || (!user.school.active && user.role !== "GROUPADMIN")) return null;
    return user;
  } catch {
    return null;
  }
}

/** Use at the top of every page and server action. Redirects to /login when unauthorised. */
export async function requireUser(...roles: Role[]) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (roles.length && !roles.includes(user.role as Role)) redirect(homeFor(user.role));
  return user;
}

export function homeFor(role: string) {
  switch (role) {
    case "STUDENT": return "/student";
    case "TEACHER": return "/teacher";
    case "ADMIN": return "/admin";
    case "GROUPADMIN": return "/group";
    case "CONTENT": return "/studio";
    case "REVIEWER": return "/review";
    case "SUPERADMIN": return "/hq";
    default: return "/login";
  }
}

export async function audit(user: { id: string; schoolId: string }, action: string, detail?: string) {
  await prisma.auditLog.create({ data: { schoolId: user.schoolId, actorId: user.id, action, detail } });
}

/** Cookie holding the school a group admin is currently managing. */
export const ACTING_SCHOOL = "ctai_acting_school";

/**
 * For the school-admin area. A school ADMIN manages their own school. A GROUPADMIN manages the school they picked on
 * /group (any active school in their group): the returned user carries that school's id, so every
 * admin page and action is scoped to it.
 */
export async function requireSchoolAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") return user;
  if (user.role === "GROUPADMIN" && user.schoolGroupId) {
    const id = (await cookies()).get(ACTING_SCHOOL)?.value;
    const school = id ? await prisma.school.findFirst({ where: { id, groupId: user.schoolGroupId, isHq: false } }) : null;
    if (!school || !school.active) redirect("/group");
    return { ...user, schoolId: school.id, school };
  }
  redirect(homeFor(user.role));
}
