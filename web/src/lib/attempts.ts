// Attempt lifecycle: answering, grading, submitting, adaptive practice selection.
import type { PrismaClient } from "@prisma/client";
import { isCorrect, type AnswerValue } from "./scoring";
import { XP } from "./gamification";
import { addXp, evaluateBadges } from "./progress";

export const PRACTICE_LENGTH = 8;

export type PracticeBlueprint = { chapterIds: string[]; skill?: string };

/** Records (or replaces) an answer. Practice and puzzle answers are graded immediately; tests at submit. */
export async function saveAnswer(
  db: PrismaClient,
  attemptId: string,
  questionId: string,
  answer: AnswerValue,
  opts: { usedHint?: boolean; timeSec?: number; at?: Date } = {},
) {
  const attempt = await db.attempt.findUniqueOrThrow({ where: { id: attemptId }, include: { assessment: true } });
  if (attempt.submittedAt) throw new Error("Attempt already submitted");
  const q = await db.question.findUniqueOrThrow({ where: { id: questionId } });
  const item = await db.assessmentItem.findFirst({ where: { assessmentId: attempt.assessmentId, questionId } });
  const instant = attempt.assessment.kind === "PRACTICE" || attempt.assessment.kind === "PUZZLE";
  const correct = isCorrect(q.type, JSON.parse(q.answer), answer);
  const marks = correct ? item?.marks ?? q.marks : 0;
  const at = opts.at ?? new Date();

  const existing = await db.response.findUnique({ where: { attemptId_questionId: { attemptId, questionId } } });
  if (existing && instant) return { correct: existing.correct, solution: q.solution, answer: JSON.parse(q.answer) };

  const data = {
    answer: JSON.stringify(answer),
    correct: instant ? correct : null,
    marks: instant ? marks : 0,
    usedHint: !!opts.usedHint,
    timeSec: opts.timeSec,
    createdAt: at,
  };
  await db.response.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    create: { attemptId, questionId, ...data },
    update: data,
  });

  if (attempt.assessment.kind === "PRACTICE") {
    await addXp(db, attempt.userId, XP.PRACTICE_ATTEMPT + (correct ? (opts.usedHint ? XP.PRACTICE_CORRECT_WITH_HINT : XP.PRACTICE_CORRECT) : 0), "Practice answer", at);
  }
  if (attempt.assessment.kind === "PUZZLE" && correct) await addXp(db, attempt.userId, XP.PUZZLE_SOLVED, "Puzzle of the Day", at);
  if (attempt.assessment.kind === "PUZZLE") {
    await db.attempt.update({ where: { id: attemptId }, data: { submittedAt: at, score: marks, maxScore: q.marks } });
    await evaluateBadges(db, attempt.userId, attemptId, at);
  }
  return instant ? { correct, solution: q.solution, answer: JSON.parse(q.answer) } : { saved: true };
}

/** Grades all responses and closes the attempt. */
export async function submitAttempt(db: PrismaClient, attemptId: string, at = new Date()) {
  const attempt = await db.attempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: { assessment: { include: { items: { include: { question: true } } } }, responses: { include: { question: true } } },
  });
  if (attempt.submittedAt) return { newBadges: [] as string[], score: attempt.score ?? 0, maxScore: attempt.maxScore ?? 0 };

  let score = 0;
  let maxScore = 0;
  if (attempt.assessment.kind === "PRACTICE") {
    for (const r of attempt.responses) {
      maxScore += r.question.marks;
      score += r.marks;
    }
  } else {
    for (const item of attempt.assessment.items) {
      maxScore += item.marks;
      const r = attempt.responses.find((x) => x.questionId === item.questionId);
      if (!r) continue;
      const correct = isCorrect(item.question.type, JSON.parse(item.question.answer), r.answer ? JSON.parse(r.answer) : null);
      const marks = correct ? item.marks : 0;
      score += marks;
      await db.response.update({ where: { id: r.id }, data: { correct, marks } });
    }
  }
  await db.attempt.update({ where: { id: attemptId }, data: { submittedAt: at, score, maxScore } });

  if (attempt.assessment.kind === "PRACTICE" && attempt.responses.length) await addXp(db, attempt.userId, XP.SET_COMPLETED, "Practice set completed", at);
  if (attempt.assessment.kind === "TEST" || attempt.assessment.kind === "ASSIGNMENT") await addXp(db, attempt.userId, Math.round(score * XP.TEST_PER_MARK), `Completed: ${attempt.assessment.title}`, at);

  const newBadges = await evaluateBadges(db, attempt.userId, attemptId, at);
  return { newBadges, score, maxScore };
}

/** Number of questions this practice set will actually have (8, or fewer if the pool is small). */
export async function practiceSetSize(db: PrismaClient, attemptId: string) {
  const attempt = await db.attempt.findUniqueOrThrow({ where: { id: attemptId }, include: { assessment: true } });
  const bp = JSON.parse(attempt.assessment.blueprint ?? "{}") as PracticeBlueprint;
  const n = await db.question.count({ where: { chapterId: { in: bp.chapterIds }, isPuzzle: false, status: "PUBLISHED", ...(bp.skill ? { skills: { contains: bp.skill } } : {}) } });
  return Math.min(PRACTICE_LENGTH, n);
}

/**
 * Adaptive practice: two consecutive correct answers → harder; two consecutive wrong → easier.
 * Returns null when the set is complete or the pool is exhausted.
 */
export async function nextPracticeQuestion(db: PrismaClient, attemptId: string, rand = Math.random) {
  const attempt = await db.attempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: { assessment: true, responses: { include: { question: true }, orderBy: { createdAt: "asc" } } },
  });
  if (attempt.responses.length >= PRACTICE_LENGTH) return null;
  const bp = JSON.parse(attempt.assessment.blueprint ?? "{}") as PracticeBlueprint;

  let target = 1;
  if (attempt.responses.length) {
    target = attempt.responses[attempt.responses.length - 1].question.difficulty;
    const last2 = attempt.responses.slice(-2);
    if (last2.length === 2 && last2.every((r) => r.correct)) target = Math.min(3, target + 1);
    else if (last2.length === 2 && last2.every((r) => r.correct === false)) target = Math.max(1, target - 1);
  }

  // Prefer questions this student has never answered correctly.
  const mastered = await db.response.findMany({ where: { correct: true, attempt: { userId: attempt.userId } }, select: { questionId: true } });
  const answeredHere = new Set(attempt.responses.map((r) => r.questionId));
  const masteredIds = new Set(mastered.map((m) => m.questionId));
  const pool = await db.question.findMany({
    where: {
      chapterId: { in: bp.chapterIds },
      isPuzzle: false,
      status: "PUBLISHED",
      ...(bp.skill ? { skills: { contains: bp.skill } } : {}),
    },
  });
  const candidates = pool.filter((q) => !answeredHere.has(q.id));
  if (!candidates.length) return null;
  const score = (q: (typeof candidates)[number]) => Math.abs(q.difficulty - target) * 10 + (masteredIds.has(q.id) ? 5 : 0) + rand();
  candidates.sort((a, b) => score(a) - score(b));
  return candidates[0];
}
