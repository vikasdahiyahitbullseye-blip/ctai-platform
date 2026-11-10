// Server-side learning records: mastery, XP, badges, streaks. Used by pages, actions and the seed script.
import type { PrismaClient } from "@prisma/client";
import { computeMastery, type Evidence, type MasteryLevel } from "./mastery";
import { BADGES, SKILL_BADGE, computeStreak, levelInfo } from "./gamification";
import { SKILLS, type SkillCode } from "./constants";

export function parseSkills(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

/** Mastery per skill for many students at once (one query). */
export async function masteryFor(db: PrismaClient, userIds: string[], skills: string[]) {
  const rows = await db.response.findMany({
    where: { attempt: { userId: { in: userIds }, submittedAt: { not: null } }, correct: { not: null } },
    select: { correct: true, createdAt: true, attemptId: true, attempt: { select: { userId: true } }, question: { select: { skills: true, difficulty: true } } },
  });
  const ev = new Map<string, Evidence[]>();
  for (const r of rows) {
    for (const s of parseSkills(r.question.skills)) {
      const k = `${r.attempt.userId}|${s}`;
      if (!ev.has(k)) ev.set(k, []);
      ev.get(k)!.push({ correct: !!r.correct, difficulty: r.question.difficulty, at: r.createdAt, attemptId: r.attemptId });
    }
  }
  const out: Record<string, Record<string, { score: number | null; level: MasteryLevel; count: number }>> = {};
  for (const u of userIds) {
    out[u] = {};
    for (const s of skills) out[u][s] = computeMastery(ev.get(`${u}|${s}`) ?? []);
  }
  return out;
}

export async function totalXp(db: PrismaClient, userId: string) {
  const agg = await db.xpEvent.aggregate({ where: { userId }, _sum: { amount: true } });
  return agg._sum.amount ?? 0;
}

export async function studentSummary(db: PrismaClient, userId: string, now = new Date()) {
  const [xp, events, badges] = await Promise.all([
    totalXp(db, userId),
    db.xpEvent.findMany({ where: { userId }, select: { createdAt: true } }),
    db.userBadge.findMany({ where: { userId }, orderBy: { awardedAt: "desc" } }),
  ]);
  return {
    xp,
    ...levelInfo(xp),
    streak: computeStreak(events.map((e) => e.createdAt), now),
    badges: badges.map((b) => ({ code: b.badge, awardedAt: b.awardedAt, ...BADGES[b.badge] })),
  };
}

export async function addXp(db: PrismaClient, userId: string, amount: number, reason: string, at?: Date) {
  if (amount <= 0) return;
  await db.xpEvent.create({ data: { userId, amount, reason, ...(at ? { createdAt: at } : {}) } });
}

async function award(db: PrismaClient, userId: string, badge: string, at?: Date): Promise<string | null> {
  const exists = await db.userBadge.findUnique({ where: { userId_badge: { userId, badge } } });
  if (exists) return null;
  await db.userBadge.create({ data: { userId, badge, ...(at ? { awardedAt: at } : {}) } });
  return badge;
}

/** Re-evaluates rule-based badges after an attempt. Returns newly earned badge codes. */
export async function evaluateBadges(db: PrismaClient, userId: string, attemptId?: string, at?: Date): Promise<string[]> {
  const earned: string[] = [];
  const push = (b: string | null) => b && earned.push(b);

  const submitted = await db.attempt.count({ where: { userId, submittedAt: { not: null }, assessment: { kind: "PRACTICE" } } });
  if (submitted >= 1) push(await award(db, userId, "FIRST_STEPS", at));

  const patternCorrect = await db.response.count({ where: { correct: true, attempt: { userId }, question: { skills: { contains: "PATTERN" } } } });
  if (patternCorrect >= 10) push(await award(db, userId, "SHARP_EYE", at));

  const puzzles = await db.response.count({ where: { correct: true, attempt: { userId, assessment: { kind: "PUZZLE" } } } });
  if (puzzles >= 5) push(await award(db, userId, "PUZZLE_STREAK_5", at));

  if (attemptId) {
    const a = await db.attempt.findUnique({ where: { id: attemptId }, include: { assessment: true } });
    if (a?.submittedAt && a.maxScore && a.score === a.maxScore && a.maxScore >= 5) push(await award(db, userId, "PERFECT_SCORE", at));
    if (a?.submittedAt && a.maxScore) {
      const prev = await db.attempt.findFirst({
        where: { userId, assessmentId: a.assessmentId, id: { not: a.id }, submittedAt: { not: null } },
        orderBy: { submittedAt: "desc" },
      });
      if (prev?.maxScore && ((a.score ?? 0) / a.maxScore - (prev.score ?? 0) / prev.maxScore) * 100 >= 20)
        push(await award(db, userId, "COMEBACK", at));
    }
  }

  const m = await masteryFor(db, [userId], Object.keys(SKILL_BADGE));
  for (const [skill, badge] of Object.entries(SKILL_BADGE)) {
    const lvl = m[userId][skill].level;
    if (lvl === "PROFICIENT" || lvl === "ADVANCED") push(await award(db, userId, badge, at));
  }

  const events = await db.xpEvent.findMany({ where: { userId }, select: { createdAt: true } });
  if (computeStreak(events.map((e) => e.createdAt), at ?? new Date()) >= 7) push(await award(db, userId, "STREAK_7", at));

  return earned;
}

export function skillName(code: string): string {
  return SKILLS[code as SkillCode] ?? code;
}
