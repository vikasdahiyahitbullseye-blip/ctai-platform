"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireSectionAccess, requireTestAccess } from "@/lib/teacher";
import { generatePaper } from "@/lib/generator";
import { parseSkills } from "@/lib/progress";

export async function toggleLeaderboard(sectionId: string) {
  const user = await requireUser("TEACHER", "ADMIN");
  const section = await requireSectionAccess(user.id, sectionId);
  await prisma.classSection.update({ where: { id: sectionId }, data: { leaderboard: !section.leaderboard } });
  revalidatePath(`/teacher/class/${sectionId}`);
}

export async function addObservation(studentId: string, form: FormData) {
  const user = await requireUser("TEACHER", "ADMIN");
  const enr = await prisma.enrollment.findFirst({ where: { userId: studentId, section: { teachers: { some: { userId: user.id } } } } });
  if (!enr) throw new Error("Not your student");
  const data = z.object({ skill: z.string().min(1), rating: z.coerce.number().int().min(1).max(4), note: z.string().max(500).optional() }).parse({
    skill: form.get("skill"), rating: form.get("rating"), note: form.get("note") || undefined,
  });
  await prisma.observation.create({ data: { ...data, studentId, observerId: user.id } });
  revalidatePath(`/teacher/student/${studentId}`);
}

const GenSchema = z.object({
  title: z.string().trim().min(3).max(120),
  classLevel: z.coerce.number().int().min(3).max(8),
  sectionId: z.string().optional(),
  chapterIds: z.array(z.string()).min(1, "Choose at least one chapter"),
  skills: z.array(z.string()).default([]),
  types: z.array(z.string()).default([]),
  count: z.coerce.number().int().min(1).max(60),
  easy: z.coerce.number().min(0).max(100),
  medium: z.coerce.number().min(0).max(100),
  hard: z.coerce.number().min(0).max(100),
  durationMin: z.coerce.number().int().min(0).max(240),
  instructions: z.string().max(1000).optional(),
});

export async function generateTest(_: unknown, form: FormData) {
  const user = await requireUser("TEACHER", "ADMIN");
  const parsed = GenSchema.safeParse({
    title: form.get("title"),
    classLevel: form.get("classLevel"),
    sectionId: form.get("sectionId") || undefined,
    chapterIds: form.getAll("chapterIds").map(String),
    skills: form.getAll("skills").map(String),
    types: form.getAll("types").map(String),
    count: form.get("count"),
    easy: form.get("easy"),
    medium: form.get("medium"),
    hard: form.get("hard"),
    durationMin: form.get("durationMin"),
    instructions: form.get("instructions") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues.map((i) => i.message).join(" ") };
  const d = parsed.data;
  if (d.easy + d.medium + d.hard <= 0) return { error: "Difficulty mix must add up to more than 0%." };
  if (d.sectionId) await requireSectionAccess(user.id, d.sectionId);

  const pool = (await prisma.question.findMany({ where: { classLevel: d.classLevel, isPuzzle: false, status: "PUBLISHED", chapterId: { in: d.chapterIds } } }))
    .map((q) => ({ id: q.id, chapterId: q.chapterId, skills: parseSkills(q.skills), type: q.type, difficulty: q.difficulty, marks: q.marks }));

  // Avoid questions this section already saw in recent tests (last 60 days).
  const recent = d.sectionId
    ? await prisma.assessmentItem.findMany({ where: { assessment: { assignments: { some: { sectionId: d.sectionId, createdAt: { gte: new Date(Date.now() - 60 * 86400000) } } } } }, select: { questionId: true } })
    : [];
  const blueprint = { chapterIds: d.chapterIds, skills: d.skills, types: d.types, count: d.count, difficultyMix: { 1: d.easy, 2: d.medium, 3: d.hard }, avoidIds: recent.map((r) => r.questionId), seed: Date.now() % 100000 };
  const gen = generatePaper(pool, blueprint);
  if (!gen.items.length) return { error: "No questions match these settings. Try more chapters or fewer filters." };

  const test = await prisma.assessment.create({
    data: {
      kind: "TEST",
      title: d.title,
      classLevel: d.classLevel,
      schoolId: user.schoolId,
      createdById: user.id,
      durationMin: d.durationMin || null,
      instructions: d.instructions,
      blueprint: JSON.stringify({ ...blueprint, avoidIds: undefined, sectionId: d.sectionId, warnings: gen.warnings }),
      items: { create: gen.items.map((q, i) => ({ questionId: q.id, position: i + 1, marks: q.marks, section: q.difficulty === 3 ? "B" : "A" })) },
    },
  });
  redirect(`/teacher/tests/${test.id}?new=1`);
}

export async function swapItem(testId: string, itemId: string) {
  const user = await requireUser("TEACHER", "ADMIN");
  const test = await requireTestAccess(user, testId);
  const started = await prisma.attempt.count({ where: { assessmentId: testId } });
  if (started) throw new Error("Students have started this test; it can no longer be edited.");
  const item = await prisma.assessmentItem.findUniqueOrThrow({ where: { id: itemId }, include: { question: true } });
  const onPaper = (await prisma.assessmentItem.findMany({ where: { assessmentId: testId }, select: { questionId: true } })).map((i) => i.questionId);
  const candidates = await prisma.question.findMany({
    where: { classLevel: test.classLevel, isPuzzle: false, chapterId: item.question.chapterId, id: { notIn: onPaper } },
  });
  const best = candidates.sort((a, b) => Math.abs(a.difficulty - item.question.difficulty) - Math.abs(b.difficulty - item.question.difficulty) || Math.random() - 0.5)[0];
  if (!best) return;
  await prisma.assessmentItem.update({ where: { id: itemId }, data: { questionId: best.id, marks: best.marks, section: best.difficulty === 3 ? "B" : "A" } });
  revalidatePath(`/teacher/tests/${testId}`);
}

export async function removeItem(testId: string, itemId: string) {
  const user = await requireUser("TEACHER", "ADMIN");
  await requireTestAccess(user, testId);
  if (await prisma.attempt.count({ where: { assessmentId: testId } })) throw new Error("Test already started.");
  await prisma.assessmentItem.delete({ where: { id: itemId } });
  const rest = await prisma.assessmentItem.findMany({ where: { assessmentId: testId }, orderBy: { position: "asc" } });
  for (const [i, it] of rest.entries()) await prisma.assessmentItem.update({ where: { id: it.id }, data: { position: i + 1 } });
  revalidatePath(`/teacher/tests/${testId}`);
}

export async function assignTest(testId: string, form: FormData) {
  const user = await requireUser("TEACHER", "ADMIN");
  await requireTestAccess(user, testId);
  const sectionId = String(form.get("sectionId"));
  await requireSectionAccess(user.id, sectionId);
  const due = String(form.get("dueAt") || "");
  const showAnswers = form.get("showAnswers") === "AFTER_DUE" ? "AFTER_DUE" : "AFTER_SUBMIT";
  const existing = await prisma.assessmentAssignment.findFirst({ where: { assessmentId: testId, sectionId } });
  const data = { dueAt: due ? new Date(`${due}T23:59:00`) : null, showAnswers };
  if (existing) await prisma.assessmentAssignment.update({ where: { id: existing.id }, data });
  else await prisma.assessmentAssignment.create({ data: { assessmentId: testId, sectionId, ...data } });
  revalidatePath(`/teacher/tests/${testId}`);
}
