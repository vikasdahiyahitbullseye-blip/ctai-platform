"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { nextPracticeQuestion, saveAnswer, submitAttempt } from "@/lib/attempts";
import { toClient } from "@/lib/questions";
import { formatAnswer, type AnswerValue } from "@/lib/scoring";
import { studentSection, puzzleOfTheDay } from "@/lib/student";
import { XP } from "@/lib/gamification";

async function ownAttempt(attemptId: string) {
  const user = await requireUser("STUDENT");
  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId }, include: { assessment: true } });
  if (!attempt || attempt.userId !== user.id) throw new Error("Not found");
  return { user, attempt };
}

export async function startPractice(form: FormData) {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  if (!section) throw new Error("Not enrolled");
  const chapterId = String(form.get("chapterId") ?? "");
  const skill = String(form.get("skill") ?? "") || undefined;
  const chapters = chapterId
    ? [chapterId]
    : (await prisma.chapter.findMany({ where: { classLevel: section.classLevel }, select: { id: true } })).map((c) => c.id);
  const title = chapterId ? (await prisma.chapter.findUnique({ where: { id: chapterId } }))?.title ?? "Practice" : `Skill practice`;
  const a = await prisma.assessment.create({ data: { kind: "PRACTICE", title, classLevel: section.classLevel, blueprint: JSON.stringify({ chapterIds: chapters, skill }) } });
  const attempt = await prisma.attempt.create({ data: { userId: user.id, assessmentId: a.id } });
  redirect(`/student/play/${attempt.id}`);
}

export async function nextQuestion(attemptId: string) {
  await ownAttempt(attemptId);
  const q = await nextPracticeQuestion(prisma, attemptId);
  return q ? toClient(q, { withHint: true }) : null;
}

export async function answerInstant(attemptId: string, questionId: string, answer: AnswerValue, usedHint: boolean) {
  const { attempt } = await ownAttempt(attemptId);
  if (attempt.assessment.kind !== "PRACTICE" && attempt.assessment.kind !== "PUZZLE") throw new Error("Not an instant-feedback attempt");
  const res = (await saveAnswer(prisma, attemptId, questionId, answer, { usedHint })) as { correct: boolean; solution: string; answer: AnswerValue };
  const q = await prisma.question.findUniqueOrThrow({ where: { id: questionId } });
  const xp = attempt.assessment.kind === "PUZZLE"
    ? (res.correct ? XP.PUZZLE_SOLVED : 0)
    : XP.PRACTICE_ATTEMPT + (res.correct ? (usedHint ? XP.PRACTICE_CORRECT_WITH_HINT : XP.PRACTICE_CORRECT) : 0);
  return { correct: res.correct, solution: res.solution, correctText: formatAnswer(q.type, JSON.parse(q.options), res.answer), xp };
}

export async function saveTestAnswer(attemptId: string, questionId: string, answer: AnswerValue) {
  const { attempt } = await ownAttempt(attemptId);
  if (attempt.submittedAt) return { ok: false };
  const onPaper = await prisma.assessmentItem.findFirst({ where: { assessmentId: attempt.assessmentId, questionId } });
  if (!onPaper) throw new Error("Question not in this test");
  await saveAnswer(prisma, attemptId, questionId, answer);
  return { ok: true };
}

export async function finishAttempt(attemptId: string) {
  await ownAttempt(attemptId);
  const { newBadges } = await submitAttempt(prisma, attemptId);
  redirect(`/student/result/${attemptId}${newBadges.length ? `?badges=${newBadges.join(",")}` : ""}`);
}

export async function startAssigned(assessmentId: string) {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  const assigned = section && (await prisma.assessmentAssignment.findFirst({ where: { assessmentId, sectionId: section.id } }));
  if (!assigned) throw new Error("Not assigned to you");
  const existing = await prisma.attempt.findFirst({ where: { userId: user.id, assessmentId }, orderBy: { startedAt: "desc" } });
  if (existing?.submittedAt) redirect(`/student/result/${existing.id}`);
  const attempt = existing ?? (await prisma.attempt.create({ data: { userId: user.id, assessmentId } }));
  redirect(`/student/play/${attempt.id}`);
}

export async function startPuzzle() {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  if (!section) throw new Error("Not enrolled");
  const p = await puzzleOfTheDay(section.classLevel);
  if (!p) redirect("/student");
  const existing = await prisma.attempt.findFirst({ where: { userId: user.id, assessmentId: p.assessment.id } });
  if (existing?.submittedAt) redirect(`/student/result/${existing.id}`);
  const attempt = existing ?? (await prisma.attempt.create({ data: { userId: user.id, assessmentId: p.assessment.id } }));
  redirect(`/student/play/${attempt.id}`);
}
