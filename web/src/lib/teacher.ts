import "server-only";
import { notFound } from "next/navigation";
import { prisma } from "./db";
import { masteryFor } from "./progress";
import { dashboardSkills } from "./constants";

export async function teacherSections(userId: string) {
  const rows = await prisma.teacherAssignment.findMany({ where: { userId }, include: { section: true } });
  const map = new Map<string, { section: (typeof rows)[number]["section"]; subjects: string[] }>();
  for (const r of rows) {
    const e = map.get(r.sectionId) ?? { section: r.section, subjects: [] };
    e.subjects.push(r.subject);
    map.set(r.sectionId, e);
  }
  return [...map.values()].sort((a, b) => a.section.classLevel - b.section.classLevel);
}

export async function requireSectionAccess(userId: string, sectionId: string) {
  const ok = await prisma.teacherAssignment.findFirst({ where: { userId, sectionId }, include: { section: true } });
  if (!ok) notFound();
  return ok.section;
}

export async function requireTestAccess(user: { id: string; schoolId: string }, assessmentId: string) {
  const a = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!a || a.schoolId !== user.schoolId || (a.kind !== "TEST" && a.kind !== "ASSIGNMENT")) notFound();
  return a;
}

const DAY = 86400000;

export async function sectionAnalytics(sectionId: string) {
  const section = await prisma.classSection.findUniqueOrThrow({ where: { id: sectionId } });
  const enrollments = await prisma.enrollment.findMany({ where: { sectionId }, include: { user: true }, orderBy: { user: { name: "asc" } } });
  const students = enrollments.map((e) => e.user);
  const ids = students.map((s) => s.id);
  const skills = dashboardSkills(section.classLevel);
  const [mastery, attempts, chapterRows, assignments] = await Promise.all([
    masteryFor(prisma, ids, skills),
    prisma.attempt.findMany({ where: { userId: { in: ids }, submittedAt: { not: null } }, include: { assessment: true } }),
    prisma.response.findMany({
      where: { attempt: { userId: { in: ids }, submittedAt: { not: null } }, correct: { not: null } },
      select: { correct: true, question: { select: { chapter: { select: { id: true, title: true, number: true, part: true } } } } },
    }),
    prisma.assessmentAssignment.findMany({ where: { sectionId }, include: { assessment: { include: { attempts: { where: { userId: { in: ids } } }, items: true } } }, orderBy: { createdAt: "desc" } }),
  ]);

  const weekAgo = Date.now() - 7 * DAY;
  const lastActive = new Map<string, number>();
  for (const a of attempts) lastActive.set(a.userId, Math.max(lastActive.get(a.userId) ?? 0, a.submittedAt!.getTime()));
  const activeThisWeek = ids.filter((id) => (lastActive.get(id) ?? 0) > weekAgo).length;

  const scored = attempts.filter((a) => a.maxScore && a.assessment.kind !== "PUZZLE");
  const avgScore = scored.length ? Math.round((scored.reduce((s, a) => s + (a.score ?? 0) / a.maxScore!, 0) / scored.length) * 100) : null;

  const chapters = new Map<string, { title: string; label: string; n: number; c: number }>();
  for (const r of chapterRows) {
    const ch = r.question.chapter;
    const e = chapters.get(ch.id) ?? { title: ch.title, label: `${ch.part === "AI" ? "AI " : ""}Ch ${ch.number}`, n: 0, c: 0 };
    e.n++;
    if (r.correct) e.c++;
    chapters.set(ch.id, e);
  }

  const tests = assignments.map((as) => {
    const done = as.assessment.attempts.filter((a) => a.submittedAt);
    return {
      id: as.assessment.id,
      title: as.assessment.title,
      dueAt: as.dueAt,
      submitted: done.length,
      avg: done.length ? Math.round((done.reduce((s, a) => s + (a.score ?? 0) / (a.maxScore || 1), 0) / done.length) * 100) : null,
    };
  });
  const testCompletion = tests.length ? Math.round((tests.reduce((s, t) => s + t.submitted, 0) / (tests.length * (ids.length || 1))) * 100) : null;

  const needsSupport = students
    .map((s) => {
      const weak = skills.filter((k) => mastery[s.id][k].level === "BEGINNING");
      const inactiveDays = lastActive.has(s.id) ? Math.floor((Date.now() - lastActive.get(s.id)!) / DAY) : null;
      const reasons: string[] = [];
      if (weak.length >= 2) reasons.push(`${weak.length} skills at Beginning`);
      if (inactiveDays === null || inactiveDays >= 7) reasons.push(inactiveDays === null ? "No activity yet" : `Inactive ${inactiveDays} days`);
      return { student: s, reasons, weak };
    })
    .filter((x) => x.reasons.length);

  return {
    section,
    students,
    skills,
    mastery,
    lastActive,
    kpis: { students: ids.length, activeThisWeek, avgScore, testCompletion, answered: chapterRows.length },
    chapters: [...chapters.values()].map((c) => ({ ...c, accuracy: Math.round((c.c / c.n) * 100) })).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true })),
    tests,
    needsSupport,
  };
}

export async function itemAnalysis(assessmentId: string) {
  const items = await prisma.assessmentItem.findMany({ where: { assessmentId }, include: { question: true }, orderBy: { position: "asc" } });
  const responses = await prisma.response.findMany({ where: { attempt: { assessmentId, submittedAt: { not: null } } } });
  const submitted = await prisma.attempt.count({ where: { assessmentId, submittedAt: { not: null } } });
  return items.map((it) => {
    const rs = responses.filter((r) => r.questionId === it.questionId);
    const correct = rs.filter((r) => r.correct).length;
    const opts = JSON.parse(it.question.options) as string[];
    const distractors: Record<string, number> = {};
    if (it.question.type === "MCQ") for (const r of rs) if (r.answer) distractors[JSON.parse(r.answer)] = (distractors[JSON.parse(r.answer)] ?? 0) + 1;
    const p = submitted ? correct / submitted : null;
    return {
      position: it.position,
      question: it.question,
      options: opts,
      attempted: rs.filter((r) => r.answer !== null).length,
      skipped: submitted - rs.filter((r) => r.answer !== null).length,
      correct,
      p,
      distractors,
      flag: p === null ? null : p < 0.25 ? "Very hard — check wording or reteach" : p > 0.95 ? "Very easy — little information" : null,
    };
  });
}
