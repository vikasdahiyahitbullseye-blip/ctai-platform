"use server";
// Teacher actions on the Hitbullseye library and the yearly plan; studio action to rebuild a class's plan.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, audit } from "@/lib/auth";
import { requireSectionAccess } from "@/lib/teacher";
import { buildClassLibrary } from "@/lib/library";
import { budget, RESERVED_PERIODS } from "@/lib/plan";

/** Copies a library paper into the teacher's school and assigns it to one of their sections. */
export async function useLibraryItem(id: string, form: FormData) {
  const user = await requireUser("TEACHER", "ADMIN");
  const sectionId = String(form.get("sectionId") ?? "");
  const section = await requireSectionAccess(user.id, sectionId);
  const src = await prisma.assessment.findUniqueOrThrow({ where: { id }, include: { items: { orderBy: { position: "asc" } }, tasks: { orderBy: { position: "asc" } } } });
  if (!src.libType) throw new Error("Not a library item");
  if (src.classLevel !== section.classLevel) throw new Error("This item is for another class.");
  const due = String(form.get("dueAt") ?? "");
  const asHomework = src.libType === "ASSIGNMENT" || src.libType === "WORKSHEET";
  const copy = await prisma.assessment.create({
    data: {
      kind: asHomework ? "ASSIGNMENT" : "TEST", title: src.title, classLevel: src.classLevel, schoolId: user.schoolId, createdById: user.id,
      durationMin: src.durationMin, instructions: src.instructions, sourceId: src.id, blueprint: JSON.stringify({ fromLibrary: src.code }),
      items: { create: src.items.map((it) => ({ questionId: it.questionId, position: it.position, marks: it.marks, section: it.section })) },
      tasks: { create: src.tasks.map((t) => ({ position: t.position, title: t.title, prompt: t.prompt, responseType: t.responseType, marks: t.marks })) },
      assignments: { create: { sectionId, dueAt: due ? new Date(`${due}T23:59:00`) : null } },
    },
  });
  await audit(user, "LIBRARY_ITEM_USED", `${src.code} → ${section.classLevel}-${section.section}`);
  redirect(asHomework ? `/teacher/assignments/${copy.id}?created=1` : `/teacher/tests/${copy.id}`);
}

/** Marks a planned period as taught (or not) for a section. */
export async function toggleLesson(lessonId: string, sectionId: string) {
  const user = await requireUser("TEACHER", "ADMIN");
  await requireSectionAccess(user.id, sectionId);
  const existing = await prisma.lessonLog.findUnique({ where: { lessonId_sectionId: { lessonId, sectionId } } });
  if (existing) await prisma.lessonLog.delete({ where: { id: existing.id } });
  else await prisma.lessonLog.create({ data: { lessonId, sectionId, teacherId: user.id } });
  revalidatePath("/teacher/plan");
}

/** Studio: change chapter periods for a class, then rebuild its library and plan. */
export async function savePlan(classLevel: number, _: unknown, form: FormData) {
  const user = await requireUser("CONTENT", "SUPERADMIN");
  const chapters = await prisma.chapter.findMany({ where: { classLevel } });
  const periods = chapters.map((c) => ({ id: c.id, n: Math.round(Number(form.get(`p_${c.id}`))) }));
  if (periods.some((p) => !Number.isFinite(p.n) || p.n < 1 || p.n > 20)) return { error: "Each chapter needs between 1 and 20 periods." };
  const want = budget(classLevel).periods - RESERVED_PERIODS;
  const total = periods.reduce((a, p) => a + p.n, 0);
  if (total !== want) return { error: `Chapter periods add up to ${total}, but Class ${classLevel} has ${want} teaching periods (plus ${RESERVED_PERIODS} for orientation, revision and term exams). Adjust by ${want - total > 0 ? "+" : ""}${want - total}.` };
  for (const p of periods) await prisma.chapter.update({ where: { id: p.id }, data: { periods: p.n } });
  const r = await buildClassLibrary(prisma, classLevel);
  await audit(user, "PLAN_REBUILT", `Class ${classLevel}: ${r.periods} periods`);
  revalidatePath("/studio/plan");
  revalidatePath("/teacher/plan");
  revalidatePath("/teacher/library");
  return { ok: true, message: `Rebuilt Class ${classLevel}: ${r.periods} periods, ${r.worksheets} worksheets, ${r.assignments} assignments, ${r.monthly} monthly assessments.` };
}
