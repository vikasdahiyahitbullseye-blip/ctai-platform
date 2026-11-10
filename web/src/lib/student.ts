import { prisma } from "./db";

export async function studentSection(userId: string) {
  const e = await prisma.enrollment.findFirst({ where: { userId }, include: { section: true } });
  return e?.section ?? null;
}

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

/** Same puzzle for every student of a class level on a given day. */
export async function puzzleOfTheDay(classLevel: number, d = new Date()) {
  const puzzles = await prisma.question.findMany({ where: { classLevel, isPuzzle: true }, orderBy: { code: "asc" } });
  if (!puzzles.length) return null;
  const dayNo = Math.floor(d.getTime() / 86400000);
  const question = puzzles[dayNo % puzzles.length];
  const title = `Puzzle of the Day ${todayKey(d)}`;
  let assessment = await prisma.assessment.findFirst({ where: { kind: "PUZZLE", classLevel, title } });
  if (!assessment)
    assessment = await prisma.assessment.create({ data: { kind: "PUZZLE", title, classLevel, items: { create: { questionId: question.id, position: 1, marks: question.marks } } } });
  return { assessment, question };
}

export async function assignedWork(userId: string, sectionId: string) {
  const assignments = await prisma.assessmentAssignment.findMany({
    where: { sectionId },
    include: { assessment: { include: { items: true, attempts: { where: { userId } } } } },
    orderBy: { createdAt: "desc" },
  });
  return assignments.map((a) => {
    const attempt = a.assessment.attempts.sort((x, y) => (y.startedAt.getTime() - x.startedAt.getTime()))[0];
    const status = attempt?.submittedAt ? "SUBMITTED" : attempt ? "IN_PROGRESS" : a.dueAt && a.dueAt < new Date() ? "MISSED" : "DUE";
    return {
      id: a.assessment.id,
      title: a.assessment.title,
      kind: a.assessment.kind,
      dueAt: a.dueAt,
      questions: a.assessment.items.length,
      marks: a.assessment.items.reduce((s, i) => s + i.marks, 0),
      durationMin: a.assessment.durationMin,
      status,
      attemptId: attempt?.id,
      score: attempt?.score,
      maxScore: attempt?.maxScore,
    };
  });
}

export async function leaderboard(sectionId: string, since: Date) {
  const members = await prisma.enrollment.findMany({ where: { sectionId }, include: { user: true } });
  const sums = await prisma.xpEvent.groupBy({ by: ["userId"], where: { userId: { in: members.map((m) => m.userId) }, createdAt: { gte: since } }, _sum: { amount: true } });
  const xp = new Map(sums.map((s) => [s.userId, s._sum.amount ?? 0]));
  return members
    .map((m) => ({ userId: m.userId, name: m.user.name, xp: xp.get(m.userId) ?? 0 }))
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name))
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
