// Weekly missions (docs/SPEC.md §8). Progress is computed from activity; rewards are claimed once per week.
import type { PrismaClient } from "@prisma/client";
import { addXp } from "./progress";

export type MissionDef = { code: string; title: string; icon: string; target: number; xp: number };

export const MISSIONS: MissionDef[] = [
  { code: "PRACTICE_3", title: "Finish 3 practice sets", icon: "🎯", target: 3, xp: 50 },
  { code: "PUZZLE_3", title: "Solve 3 Puzzles of the Day", icon: "🧩", target: 3, xp: 40 },
  { code: "CORRECT_25", title: "Get 25 answers right", icon: "✅", target: 25, xp: 40 },
  { code: "ACTIVE_4", title: "Learn on 4 different days", icon: "📅", target: 4, xp: 40 },
];

/** Monday-based week key, e.g. "2026-11-09". */
export function weekStart(d = new Date()) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (x.getUTCDay() + 6) % 7;
  x.setUTCDate(x.getUTCDate() - dow);
  return x;
}

export async function missionProgress(db: PrismaClient, userId: string, now = new Date()) {
  const start = weekStart(now);
  const key = start.toISOString().slice(0, 10);
  const [practice, puzzles, correct, events, claims] = await Promise.all([
    db.attempt.count({ where: { userId, submittedAt: { gte: start }, assessment: { kind: "PRACTICE" } } }),
    db.response.count({ where: { correct: true, createdAt: { gte: start }, attempt: { userId, assessment: { kind: "PUZZLE" } } } }),
    db.response.count({ where: { correct: true, createdAt: { gte: start }, attempt: { userId } } }),
    db.xpEvent.findMany({ where: { userId, createdAt: { gte: start } }, select: { createdAt: true } }),
    db.missionClaim.findMany({ where: { userId, weekKey: key } }),
  ]);
  const days = new Set(events.map((e) => e.createdAt.toISOString().slice(0, 10))).size;
  const values: Record<string, number> = { PRACTICE_3: practice, PUZZLE_3: puzzles, CORRECT_25: correct, ACTIVE_4: days };
  const claimed = new Set(claims.map((c) => c.mission));
  return {
    weekKey: key,
    missions: MISSIONS.map((m) => ({ ...m, progress: Math.min(m.target, values[m.code]), done: values[m.code] >= m.target, claimed: claimed.has(m.code) })),
  };
}

export async function claimMission(db: PrismaClient, userId: string, code: string, now = new Date()) {
  const { weekKey, missions } = await missionProgress(db, userId, now);
  const m = missions.find((x) => x.code === code);
  if (!m || !m.done || m.claimed) return false;
  await db.missionClaim.create({ data: { userId, mission: code, weekKey } });
  await addXp(db, userId, m.xp, `Mission: ${m.title}`, now);
  return true;
}

/** Class challenge progress: shared goal across a section. */
export async function challengeProgress(db: PrismaClient, ch: { sectionId: string; metric: string; startsAt: Date; endsAt: Date }) {
  const members = (await db.enrollment.findMany({ where: { sectionId: ch.sectionId }, select: { userId: true } })).map((m) => m.userId);
  const range = { gte: ch.startsAt, lte: ch.endsAt };
  if (ch.metric === "PRACTICE_SETS") return db.attempt.count({ where: { userId: { in: members }, submittedAt: range, assessment: { kind: "PRACTICE" } } });
  if (ch.metric === "PUZZLES") return db.response.count({ where: { correct: true, createdAt: range, attempt: { userId: { in: members }, assessment: { kind: "PUZZLE" } } } });
  return db.response.count({ where: { correct: true, createdAt: range, attempt: { userId: { in: members } } } });
}

/** One student's own week: XP this week and last week, questions answered and how many were right. */
export async function myWeek(db: PrismaClient, userId: string) {
  const now = Date.now(), weekAgo = new Date(now - 7 * 86400000), twoWeeksAgo = new Date(now - 14 * 86400000);
  const [xp, xpLast, answered, correct] = await Promise.all([
    db.xpEvent.aggregate({ where: { userId, createdAt: { gte: weekAgo } }, _sum: { amount: true } }),
    db.xpEvent.aggregate({ where: { userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo } }, _sum: { amount: true } }),
    db.response.count({ where: { createdAt: { gte: weekAgo }, correct: { not: null }, attempt: { userId } } }),
    db.response.count({ where: { createdAt: { gte: weekAgo }, correct: true, attempt: { userId } } }),
  ]);
  return { xp: xp._sum.amount ?? 0, xpLast: xpLast._sum.amount ?? 0, answered, correct, accuracy: answered ? Math.round((correct / answered) * 100) : null };
}

/** The school's top students by XP this term (last 90 days). */
export async function topStudents(db: PrismaClient, schoolId: string, take = 10) {
  const since = new Date(Date.now() - 90 * 86400000);
  const sums = await db.xpEvent.groupBy({ by: ["userId"], where: { createdAt: { gte: since }, user: { schoolId, role: "STUDENT" } }, _sum: { amount: true }, orderBy: { _sum: { amount: "desc" } }, take });
  const users = await db.user.findMany({ where: { id: { in: sums.map((s) => s.userId) } }, include: { enrollments: { include: { section: true } } } });
  return sums.map((s) => {
    const u = users.find((x) => x.id === s.userId)!;
    const sec = u.enrollments[0]?.section;
    return { id: u.id, name: u.name, cls: sec ? `${sec.classLevel}-${sec.section}` : "", xp: s._sum.amount ?? 0 };
  });
}
