"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireSectionAccess, requireTestAccess } from "@/lib/teacher";
import { generatePaper } from "@/lib/generator";
import { parseSkills } from "@/lib/progress";
import { saveTaskResponse, markWork } from "@/lib/attempts";
import { saveUpload } from "@/lib/files";

export async function createHomework(_: unknown, form: FormData) {
  const user = await requireUser("TEACHER", "ADMIN");
  const sectionId = String(form.get("sectionId"));
  const section = await requireSectionAccess(user.id, sectionId);
  const title = String(form.get("title") ?? "").trim();
  if (title.length < 3) return { error: "Please give the homework a title." };
  const chapterIds = form.getAll("chapterIds").map(String);
  const count = Math.max(0, Math.min(20, Number(form.get("count") ?? 0)));
  const tasks = [1, 2, 3].map((i) => ({
    title: String(form.get(`task${i}_title`) ?? "").trim(),
    prompt: String(form.get(`task${i}_prompt`) ?? "").trim(),
    responseType: String(form.get(`task${i}_type`) ?? "ANY"),
    marks: Math.max(1, Math.min(10, Number(form.get(`task${i}_marks`) ?? 2))),
  })).filter((t) => t.title && t.prompt);
  if (!count && !tasks.length) return { error: "Add some questions or at least one activity." };
  let items: { id: string; marks: number }[] = [];
  if (count) {
    if (!chapterIds.length) return { error: "Choose chapters for the questions." };
    const pool = (await prisma.question.findMany({ where: { classLevel: section.classLevel, isPuzzle: false, status: "PUBLISHED", chapterId: { in: chapterIds } } }))
      .map((q) => ({ id: q.id, chapterId: q.chapterId, skills: parseSkills(q.skills), type: q.type, difficulty: q.difficulty, marks: q.marks }));
    items = generatePaper(pool, { chapterIds, count, difficultyMix: { 1: 40, 2: 40, 3: 20 }, seed: Date.now() % 100000 }).items;
  }
  const due = String(form.get("dueAt") ?? "");
  const hw = await prisma.assessment.create({
    data: {
      kind: "ASSIGNMENT", title, classLevel: section.classLevel, schoolId: user.schoolId, createdById: user.id,
      instructions: String(form.get("instructions") ?? "").trim() || null,
      items: { create: items.map((q, i) => ({ questionId: q.id, position: i + 1, marks: q.marks })) },
      tasks: { create: tasks.map((t, i) => ({ ...t, position: i + 1 })) },
      assignments: { create: { sectionId, dueAt: due ? new Date(`${due}T23:59:00`) : null } },
    },
  });
  redirect(`/teacher/assignments/${hw.id}?created=1`);
}

export async function saveMarks(attemptId: string, _: unknown, form: FormData) {
  const user = await requireUser("TEACHER", "ADMIN");
  const attempt = await prisma.attempt.findUniqueOrThrow({ where: { id: attemptId }, include: { responses: true, taskResponses: true } });
  await requireTestAccess(user, attempt.assessmentId);
  const r = await markWork(prisma, attemptId, {
    responses: attempt.responses.filter((x) => form.has(`r_${x.id}`)).map((x) => ({ id: x.id, marks: Number(form.get(`r_${x.id}`)), feedback: String(form.get(`rf_${x.id}`) ?? "") || undefined })),
    tasks: attempt.taskResponses.filter((x) => form.has(`t_${x.id}`)).map((x) => ({ id: x.id, marks: Number(form.get(`t_${x.id}`)), feedback: String(form.get(`tf_${x.id}`) ?? "") || undefined })),
  });
  revalidatePath(`/teacher/marking/${attemptId}`);
  return { ok: true, ...r };
}

// ---------- Student ----------
async function ownOpenAttempt(attemptId: string) {
  const user = await requireUser("STUDENT");
  const a = await prisma.attempt.findUnique({ where: { id: attemptId } });
  if (!a || a.userId !== user.id) throw new Error("Not found");
  if (a.submittedAt) throw new Error("Already submitted");
  return { user, a };
}

export async function saveTaskText(attemptId: string, taskId: string, text: string) {
  await ownOpenAttempt(attemptId);
  await saveTaskResponse(prisma, attemptId, taskId, { text: text.slice(0, 5000) });
  return { ok: true };
}

export async function uploadTaskFile(attemptId: string, taskId: string, form: FormData) {
  const { user } = await ownOpenAttempt(attemptId);
  try {
    const f = await saveUpload(form.get("file") as File | null, user.id);
    if (!f) return { error: "Choose a file first." };
    await saveTaskResponse(prisma, attemptId, taskId, { fileId: f.id });
    return { ok: true, file: { id: f.id, name: f.filename, isImage: f.mime.startsWith("image/") } };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
