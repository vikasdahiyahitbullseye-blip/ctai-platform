// Server-side learning records: mastery, XP, badges, streaks. Used by pages, actions and the seed script.
import type { PrismaClient } from "@prisma/client";
import { computeMastery, type Evidence, type MasteryLevel } from "./mastery";
import { BADGES, SKILL_BADGE, computeStreak, levelInfo } from "./gamification";
import { SKILLS, type SkillCode } from "./constants";
import { GAMES, levelFor } from "./games";
import { adventure } from "./adventure";

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

export async function award(db: PrismaClient, userId: string, badge: string, at?: Date): Promise<string | null> {
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

  const homework = await db.attempt.count({ where: { userId, submittedAt: { not: null }, assessment: { kind: "ASSIGNMENT" } } });
  if (homework >= 3) push(await award(db, userId, "HOMEWORK_HERO", at));

  if (homework >= 10) push(await award(db, userId, "HOMEWORK_CHAMPION", at));
  if (puzzles >= 20) push(await award(db, userId, "PUZZLE_MASTER", at));

  const events = await db.xpEvent.findMany({ where: { userId }, select: { createdAt: true } });
  const streak = computeStreak(events.map((e) => e.createdAt), at ?? new Date());
  if (streak >= 7) push(await award(db, userId, "STREAK_7", at));
  if (streak >= 30) push(await award(db, userId, "STREAK_30", at));

  // practice volume and accuracy
  const [correct, answered] = await Promise.all([
    db.response.count({ where: { correct: true, attempt: { userId } } }),
    db.response.count({ where: { correct: { not: null }, attempt: { userId } } }),
  ]);
  if (correct >= 100) push(await award(db, userId, "CENTURY", at));
  if (answered >= 500) push(await award(db, userId, "MARATHON", at));
  if (attemptId) {
    const a = await db.attempt.findUnique({ where: { id: attemptId }, include: { assessment: true, responses: { select: { correct: true } } } });
    if (a?.submittedAt && a.assessment.kind === "PRACTICE") {
      const marked = a.responses.filter((r) => r.correct !== null);
      if (marked.length >= 10 && marked.filter((r) => r.correct).length / marked.length >= 0.9) push(await award(db, userId, "SHARP_SHOOTER", at));
      const bp = JSON.parse(a.assessment.blueprint ?? "{}") as { source?: string };
      if (bp.source === "CBSE" && marked.length >= 5) push(await award(db, userId, "CBSE_SCHOLAR", at));
    }
  }

  // logic games
  const plays = await db.gamePlay.findMany({ where: { userId }, select: { game: true, level: true, tidy: true } });
  if (plays.length >= 1) push(await award(db, userId, "GAME_ON", at));
  if (plays.length >= 25) push(await award(db, userId, "GAME_MASTER", at));
  if (new Set(plays.map((g) => g.game)).size >= Object.keys(GAMES).length) push(await award(db, userId, "GAME_EXPLORER", at));
  if (plays.filter((g) => g.tidy).length >= 5) push(await award(db, userId, "TIDY_THINKER", at));

  // class, friends and the adventure map
  const enrol = await db.enrollment.findFirst({ where: { userId }, include: { section: true } });
  if (enrol) {
    if (plays.some((g) => g.level >= levelFor(enrol.section.classLevel, "challenge") && levelFor(enrol.section.classLevel, "challenge") > levelFor(enrol.section.classLevel, "normal"))) push(await award(db, userId, "CHALLENGER", at));
    const map = await adventure(db, userId, enrol.section.classLevel);
    if (map.islands.filter((i) => i.stars === 3).length >= 5) push(await award(db, userId, "STAR_COLLECTOR", at));
    if (enrol.section.leaderboard) {
      const members = await db.enrollment.findMany({ where: { sectionId: enrol.sectionId }, select: { userId: true } });
      if (members.length >= 4) {
        const since = new Date((at ?? new Date()).getTime() - 7 * 86400000);
        const sums = await db.xpEvent.groupBy({ by: ["userId"], where: { userId: { in: members.map((x) => x.userId) }, createdAt: { gte: since } }, _sum: { amount: true } });
        const mine = sums.find((x) => x.userId === userId)?._sum.amount ?? 0;
        const above = sums.filter((x) => (x._sum.amount ?? 0) > mine).length;
        if (mine >= 150 && above === 0) push(await award(db, userId, "PODIUM", at)); // top of the section, with a real effort week
      }
    }
  }
  if (await db.studentGroupMember.count({ where: { userId } })) push(await award(db, userId, "SQUAD_UP", at));

  return earned;
}

export function skillName(code: string): string {
  return SKILLS[code as SkillCode] ?? code;
}
