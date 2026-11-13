// Adventure map: every chapter is an island; stars show how well the student knows it.
import type { PrismaClient } from "@prisma/client";

export function starsFor(answered: number, correct: number) {
  const acc = answered ? correct / answered : 0;
  if (answered >= 8 && acc >= 0.85) return 3;
  if (answered >= 6 && acc >= 0.6) return 2;
  if (answered >= 3) return 1;
  return 0;
}

export async function adventure(db: PrismaClient, userId: string, classLevel: number) {
  const chapters = await db.chapter.findMany({
    where: { classLevel },
    include: { _count: { select: { questions: { where: { isPuzzle: false, status: "PUBLISHED", type: { not: "SHORT" } } } } } },
    orderBy: [{ part: "asc" }, { number: "asc" }],
  });
  const ordered = [...chapters].sort((a, b) => ["CT", "AI"].indexOf(a.part) - ["CT", "AI"].indexOf(b.part) || a.number - b.number);
  const rs = await db.response.findMany({ where: { attempt: { userId }, correct: { not: null } }, select: { correct: true, question: { select: { chapterId: true } } } });
  const stats = new Map<string, { n: number; c: number }>();
  for (const r of rs) {
    const s = stats.get(r.question.chapterId) ?? { n: 0, c: 0 };
    s.n++;
    if (r.correct) s.c++;
    stats.set(r.question.chapterId, s);
  }
  const islands = ordered.map((c) => {
    const s = stats.get(c.id) ?? { n: 0, c: 0 };
    return { id: c.id, part: c.part, number: c.number, title: c.title, questions: c._count.questions, answered: s.n, stars: starsFor(s.n, s.c) };
  });
  const next = islands.find((i) => i.questions > 0 && i.stars < 3) ?? null;
  const totalStars = islands.reduce((a, i) => a + i.stars, 0);
  return { islands, next, totalStars, maxStars: islands.filter((i) => i.questions > 0).length * 3 };
}
