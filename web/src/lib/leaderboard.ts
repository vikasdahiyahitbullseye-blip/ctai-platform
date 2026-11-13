// XP leaderboards for students: their section, their class (all sections), the whole school, the same class across
// a group of schools, and friend groups that students create themselves.
import "server-only";
import { prisma } from "./db";

export type Period = "week" | "all";
export type Scope = "section" | "class" | "school" | "chain" | `group:${string}`;
export type BoardRow = { userId: string; name: string; xp: number; rank: number; where?: string };

export const PERIODS: Record<Period, string> = { week: "This week", all: "All time" };

/** Ranks the given students by XP earned in the period (ties share a rank). */
export async function rankByXp(users: { id: string; name: string; where?: string }[], period: Period): Promise<BoardRow[]> {
  if (!users.length) return [];
  const since = period === "week" ? new Date(Date.now() - 7 * 86400000) : undefined;
  const sums = await prisma.xpEvent.groupBy({ by: ["userId"], where: { userId: { in: users.map((u) => u.id) }, ...(since ? { createdAt: { gte: since } } : {}) }, _sum: { amount: true } });
  const xp = new Map(sums.map((s) => [s.userId, s._sum.amount ?? 0]));
  const rows = users.map((u) => ({ userId: u.id, name: u.name, where: u.where, xp: xp.get(u.id) ?? 0 })).sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));
  let rank = 0;
  return rows.map((r, i) => {
    if (i === 0 || r.xp !== rows[i - 1].xp) rank = i + 1;
    return { ...r, rank };
  });
}

type Section = { id: string; schoolId: string; classLevel: number; section: string; leaderboard: boolean };

/** Students on a public board. Sections whose teacher turned the leaderboard off are left out. */
async function students(where: { sectionId?: string; schoolId?: string; schoolIds?: string[]; classLevel?: number }, withSection: boolean, withSchool = false) {
  const enrolments = await prisma.enrollment.findMany({
    where: {
      user: { active: true, role: "STUDENT" },
      section: {
        leaderboard: true,
        ...(where.sectionId ? { id: where.sectionId } : {}),
        ...(where.schoolId ? { schoolId: where.schoolId } : {}),
        ...(where.schoolIds ? { schoolId: { in: where.schoolIds } } : {}),
        ...(where.classLevel ? { classLevel: where.classLevel } : {}),
      },
    },
    include: { user: { select: { id: true, name: true } }, section: { include: { school: { select: { name: true } } } } },
  });
  const seen = new Set<string>();
  return enrolments
    .filter((e) => !seen.has(e.userId) && seen.add(e.userId))
    .map((e) => ({ id: e.user.id, name: e.user.name, where: withSchool ? `${e.section.school.name} · ${e.section.classLevel}-${e.section.section}` : withSection ? `${e.section.classLevel}-${e.section.section}` : undefined }));
}

/** The boards a student can open, with their titles. */
export async function boardsFor(userId: string, section: Section) {
  const school = await prisma.school.findUnique({ where: { id: section.schoolId }, include: { group: { include: { _count: { select: { schools: true } } } } } });
  const groups = await prisma.studentGroup.findMany({ where: { members: { some: { userId } } }, orderBy: { createdAt: "asc" } });
  const list: { scope: Scope; title: string; short: string }[] = [];
  if (section.leaderboard) {
    list.push({ scope: "section", title: `Class ${section.classLevel}-${section.section}`, short: "My section" });
    list.push({ scope: "class", title: `Class ${section.classLevel} (all sections)`, short: `Class ${section.classLevel}` });
    list.push({ scope: "school", title: school?.name ?? "My school", short: "Whole school" });
    if (school?.group && school.group._count.schools > 1) list.push({ scope: "chain", title: `Class ${section.classLevel} · all ${school.group.name} schools`, short: "All our schools" });
  }
  for (const g of groups) list.push({ scope: `group:${g.id}`, title: `${g.emoji} ${g.name}`, short: `${g.emoji} ${g.name}` });
  return { list, publicOn: section.leaderboard };
}

/** Builds one board. Returns null when the student may not see it. */
export async function board(userId: string, section: Section, scope: Scope, period: Period) {
  if (scope.startsWith("group:")) {
    const g = await prisma.studentGroup.findUnique({ where: { id: scope.slice(6) }, include: { members: { include: { user: { select: { id: true, name: true, active: true } } } } } });
    if (!g || !g.members.some((m) => m.userId === userId)) return null;
    return rankByXp(g.members.filter((m) => m.user.active).map((m) => ({ id: m.user.id, name: m.user.name })), period);
  }
  if (!section.leaderboard) return null;
  if (scope === "section") return rankByXp(await students({ sectionId: section.id }, false), period);
  if (scope === "class") return rankByXp(await students({ schoolId: section.schoolId, classLevel: section.classLevel }, true), period);
  if (scope === "school") return rankByXp(await students({ schoolId: section.schoolId }, true), period);
  if (scope === "chain") {
    const school = await prisma.school.findUnique({ where: { id: section.schoolId }, include: { group: { include: { schools: { where: { active: true }, select: { id: true } } } } } });
    if (!school?.group) return null;
    return rankByXp(await students({ schoolIds: school.group.schools.map((s) => s.id), classLevel: section.classLevel }, true, true), period);
  }
  return null;
}

export const parseScope = (v: string | undefined): Scope => (v === "class" || v === "school" || v === "chain" || v?.startsWith("group:") ? (v as Scope) : "section");
export const parsePeriod = (v: string | undefined): Period => (v === "all" ? "all" : "week");

// ---------- Friend groups ----------
export const GROUP_LIMITS = { maxMembers: 40, maxGroupsPerStudent: 6, nameMax: 30 };
export const GROUP_EMOJI = ["🚀", "🦁", "🐯", "🦊", "🐼", "🦄", "🐬", "⚡", "🌟", "🔥", "🧠", "🎯"];
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I

export function newGroupCode(rand = Math.random) {
  return Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(rand() * CODE_CHARS.length)]).join("");
}

/** Group names are shown to other children: keep them short, plain and friendly. */
export function cleanGroupName(raw: string): string | null {
  const name = raw.replace(/\s+/g, " ").replace(/[<>{}[\]\\]/g, "").trim().slice(0, GROUP_LIMITS.nameMax);
  if (name.length < 2) return null;
  if (/https?:|www\.|@|\d{6,}/i.test(name)) return null; // no links, handles or phone numbers
  if (BLOCKED.some((w) => new RegExp(`\\b${w}`, "i").test(name))) return null;
  return name;
}
const BLOCKED = ["stupid", "idiot", "dumb", "loser", "hate", "kill", "ugly", "fat", "shut ?up", "sex", "damn", "hell", "crap", "bitch", "fuck", "shit", "bastard", "pagal", "gadha", "kutta", "chutiya", "bewakoof"];
