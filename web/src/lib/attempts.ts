// Attempt lifecycle: answering, grading, submitting, adaptive practice selection.
import type { PrismaClient } from "@prisma/client";
import { isCorrect, type AnswerValue } from "./scoring";
import { XP } from "./gamification";
import { addXp, evaluateBadges } from "./progress";

export const PRACTICE_LENGTH = 15;
/** A CBSE book-questions round covers all of the chapter's CBSE questions (up to this many). */
export const CBSE_ROUND_MAX = 40;
const roundLength = (bp: PracticeBlueprint) => (bp.source === "CBSE" ? CBSE_ROUND_MAX : PRACTICE_LENGTH);

export type PracticeBlueprint = { chapterIds: string[]; skill?: string; source?: "CBSE" };

/** Records (or replaces) an answer. Practice and puzzle answers are graded immediately; tests at submit. */
export async function saveAnswer(
  db: PrismaClient,
  attemptId: string,
  questionId: string,
  answer: AnswerValue,
  opts: { usedHint?: boolean; timeSec?: number; at?: Date; skip?: boolean } = {},
) {
  const attempt = await db.attempt.findUniqueOrThrow({ where: { id: attemptId }, include: { assessment: true } });
  if (attempt.submittedAt) throw new Error("Attempt already submitted");
  const q = await db.question.findUniqueOrThrow({ where: { id: questionId } });
  const item = await db.assessmentItem.findFirst({ where: { assessmentId: attempt.assessmentId, questionId } });
  const instant = attempt.assessment.kind === "PRACTICE" || attempt.assessment.kind === "PUZZLE";
  // A skipped practice question is recorded with no answer and no result: it uses up its place in the round
  // but does not count as wrong in accuracy, mastery or the adaptive difficulty.
  const skip = !!opts.skip && attempt.assessment.kind === "PRACTICE";
  const blank = answer === null || answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0);
  const correct = !skip && isCorrect(q.type, JSON.parse(q.answer), answer);
  const marks = correct ? item?.marks ?? q.marks : 0;
  const at = opts.at ?? new Date();

  const existing = await db.response.findUnique({ where: { attemptId_questionId: { attemptId, questionId } } });
  if (existing && instant) return { correct: existing.correct, solution: q.solution, answer: JSON.parse(q.answer) };

  const data = {
    answer: skip || blank ? null : JSON.stringify(answer),
    correct: instant && !skip ? correct : null,
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

  if (attempt.assessment.kind === "PRACTICE" && !skip) {
    await addXp(db, attempt.userId, XP.PRACTICE_ATTEMPT + (correct ? (opts.usedHint ? XP.PRACTICE_CORRECT_WITH_HINT : XP.PRACTICE_CORRECT) : 0), "Practice answer", at);
  }
  if (attempt.assessment.kind === "PUZZLE" && correct) await addXp(db, attempt.userId, XP.PUZZLE_SOLVED, "Puzzle of the Day", at);
  if (attempt.assessment.kind === "PUZZLE") {
    await db.attempt.update({ where: { id: attemptId }, data: { submittedAt: at, score: marks, maxScore: q.marks } });
    await evaluateBadges(db, attempt.userId, attemptId, at);
  }
  return instant ? { correct: skip ? null : correct, solution: q.solution, answer: JSON.parse(q.answer) } : { saved: true };
}

/** Grades all responses and closes the attempt. Written answers and activity tasks are left for the teacher. */
export async function submitAttempt(db: PrismaClient, attemptId: string, at = new Date()) {
  const attempt = await db.attempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: {
      assessment: { include: { items: { include: { question: true } }, tasks: true } },
      responses: { include: { question: true } },
      taskResponses: true,
    },
  });
  if (attempt.submittedAt) return { newBadges: [] as string[], score: attempt.score ?? 0, maxScore: attempt.maxScore ?? 0 };

  let score = 0;
  let maxScore = 0;
  let needsMarking = false;
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
      if (item.question.type === "SHORT") {
        if (r.answer && JSON.parse(r.answer)) needsMarking = true;
        continue;
      }
      const correct = isCorrect(item.question.type, JSON.parse(item.question.answer), r.answer ? JSON.parse(r.answer) : null);
      const marks = correct ? item.marks : 0;
      score += marks;
      await db.response.update({ where: { id: r.id }, data: { correct, marks } });
    }
    for (const t of attempt.assessment.tasks) {
      maxScore += t.marks;
      const tr = attempt.taskResponses.find((x) => x.taskId === t.id);
      if (tr && (tr.text?.trim() || tr.fileId)) needsMarking = true;
    }
  }
  await db.attempt.update({ where: { id: attemptId }, data: { submittedAt: at, score, maxScore, needsMarking } });

  if (attempt.assessment.kind === "PRACTICE" && attempt.responses.length) await addXp(db, attempt.userId, XP.SET_COMPLETED, "Practice set completed", at);
  if (attempt.assessment.kind === "TEST" || attempt.assessment.kind === "ASSIGNMENT") await addXp(db, attempt.userId, Math.round(score * XP.TEST_PER_MARK), `Completed: ${attempt.assessment.title}`, at);

  const newBadges = await evaluateBadges(db, attempt.userId, attemptId, at);
  return { newBadges, score, maxScore };
}

/** Saves a student's response to an activity task (text and/or uploaded file). */
export async function saveTaskResponse(db: PrismaClient, attemptId: string, taskId: string, data: { text?: string | null; fileId?: string | null }) {
  const attempt = await db.attempt.findUniqueOrThrow({ where: { id: attemptId } });
  if (attempt.submittedAt) throw new Error("Already submitted");
  const task = await db.assignmentTask.findFirst({ where: { id: taskId, assessmentId: attempt.assessmentId } });
  if (!task) throw new Error("Task not in this assignment");
  const patch = { ...(data.text !== undefined ? { text: data.text } : {}), ...(data.fileId !== undefined ? { fileId: data.fileId } : {}) };
  return db.taskResponse.upsert({ where: { attemptId_taskId: { attemptId, taskId } }, create: { attemptId, taskId, ...patch }, update: patch });
}

/**
 * Teacher marking of written answers and tasks. Recomputes the attempt score and clears needsMarking when everything is marked.
 * Extra XP for marked work is awarded at 2 XP per mark.
 */
export async function markWork(
  db: PrismaClient,
  attemptId: string,
  marks: { responses: { id: string; marks: number; feedback?: string }[]; tasks: { id: string; marks: number; feedback?: string }[] },
  at = new Date(),
) {
  const attempt = await db.attempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: { assessment: { include: { items: true, tasks: true } }, responses: { include: { question: true } }, taskResponses: true },
  });
  let added = 0;
  for (const m of marks.responses) {
    const r = attempt.responses.find((x) => x.id === m.id);
    if (!r || r.question.type !== "SHORT") continue;
    const item = attempt.assessment.items.find((i) => i.questionId === r.questionId);
    const v = Math.max(0, Math.min(item?.marks ?? r.question.marks, m.marks));
    added += v - (r.markedAt ? r.marks : 0);
    await db.response.update({ where: { id: r.id }, data: { marks: v, correct: v > 0, feedback: m.feedback ?? null, markedAt: at } });
  }
  for (const m of marks.tasks) {
    const tr = attempt.taskResponses.find((x) => x.id === m.id);
    if (!tr) continue;
    const task = attempt.assessment.tasks.find((t) => t.id === tr.taskId)!;
    const v = Math.max(0, Math.min(task.marks, m.marks));
    added += v - (tr.marks ?? 0);
    await db.taskResponse.update({ where: { id: tr.id }, data: { marks: v, feedback: m.feedback ?? null, markedAt: at } });
  }
  const fresh = await db.attempt.findUniqueOrThrow({ where: { id: attemptId }, include: { responses: { include: { question: true } }, taskResponses: true } });
  const unmarked =
    fresh.responses.some((r) => r.question.type === "SHORT" && r.answer && JSON.parse(r.answer) && !r.markedAt) ||
    fresh.taskResponses.some((t) => (t.text?.trim() || t.fileId) && !t.markedAt);
  const score = fresh.responses.reduce((s, r) => s + r.marks, 0) + fresh.taskResponses.reduce((s, t) => s + (t.marks ?? 0), 0);
  await db.attempt.update({ where: { id: attemptId }, data: { score, needsMarking: unmarked } });
  if (added > 0) await addXp(db, attempt.userId, Math.round(added * XP.TEST_PER_MARK), `Marked: ${attempt.assessment.title}`, at);
  return { score, needsMarking: unmarked };
}

/** Number of questions this practice set will actually have (15, or fewer if the pool is small). */
export async function practiceSetSize(db: PrismaClient, attemptId: string) {
  const attempt = await db.attempt.findUniqueOrThrow({ where: { id: attemptId }, include: { assessment: true } });
  const bp = JSON.parse(attempt.assessment.blueprint ?? "{}") as PracticeBlueprint;
  const n = await db.question.count({ where: { chapterId: { in: bp.chapterIds }, isPuzzle: false, status: "PUBLISHED", type: { not: "SHORT" }, ...(bp.skill ? { skills: { contains: bp.skill } } : {}), ...(bp.source ? { source: bp.source } : {}) } });
  return Math.min(roundLength(bp), n);
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
  if (attempt.responses.length >= roundLength(JSON.parse(attempt.assessment.blueprint ?? "{}") as PracticeBlueprint)) return null;
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
      type: { not: "SHORT" },
      ...(bp.skill ? { skills: { contains: bp.skill } } : {}),
      ...(bp.source ? { source: bp.source } : {}),
    },
  });
  const candidates = pool.filter((q) => !answeredHere.has(q.id));
  if (!candidates.length) return null;
  // CBSE handbook exercises: book order, starting with ones the student has not yet got right.
  if (bp.source === "CBSE") return candidates.sort((a, b) => Number(masteredIds.has(a.id)) - Number(masteredIds.has(b.id)) || a.code.localeCompare(b.code))[0];
  return pickForCoverage(candidates, pool, attempt.responses.map((r) => r.question), target, masteredIds, rand);
}

type Pickable = { id: string; type: string; difficulty: number; skills: string; figure: string | null; optionFigures: string | null; source: string };
/** The kind of a question for coverage: its format, whether it is a picture question, and whether it is from the CBSE book. */
export const questionKind = (q: Pickable) => `${q.source === "CBSE" ? "CBSE " : ""}${q.type}${q.figure || q.optionFigures ? " (picture)" : ""}`;

/**
 * Chooses the next practice question so that a round covers every kind of question the chapter has
 * (formats, picture questions, CBSE book questions) and every skill, then follows the adaptive difficulty target.
 */
export function pickForCoverage<T extends Pickable>(candidates: T[], pool: Pickable[], done: Pickable[], target: number, mastered: Set<string>, rand: () => number = Math.random): T {
  const usedKinds = new Set(done.map(questionKind));
  const missingKinds = new Set(pool.map(questionKind).filter((k) => !usedKinds.has(k)));
  const usedSkills = new Set(done.flatMap((q) => q.skills.split(",")));
  const missingSkills = new Set(pool.flatMap((q) => q.skills.split(",")).filter((k) => k && !usedSkills.has(k)));
  const score = (q: T) =>
    (missingKinds.size && !missingKinds.has(questionKind(q)) ? 100 : 0) +
    (missingSkills.size && !q.skills.split(",").some((k) => missingSkills.has(k)) ? 30 : 0) +
    Math.abs(q.difficulty - target) * 10 + (mastered.has(q.id) ? 5 : 0) + rand();
  return [...candidates].sort((a, b) => score(a) - score(b))[0];
}
