import "server-only";
import { notFound } from "next/navigation";
import { prisma } from "./db";

export const PHASES: Record<string, { label: string; emoji: string }> = {
  DEFINE: { label: "Define", emoji: "🎯" },
  COLLECT: { label: "Collect", emoji: "📋" },
  EXPLORE: { label: "Explore", emoji: "🔍" },
  CREATE: { label: "Create", emoji: "🛠️" },
  PRESENT: { label: "Present", emoji: "🎤" },
  REFLECT: { label: "Reflect", emoji: "💭" },
};

export async function runOverview(runId: string) {
  const run = await prisma.projectRun.findUnique({
    where: { id: runId },
    include: {
      kit: { include: { milestones: { orderBy: { position: "asc" } }, criteria: { orderBy: { position: "asc" } } } },
      section: { include: { enrollments: { include: { user: true } } } },
      teams: { include: { members: { include: { user: true } }, submissions: true, scores: true, reflections: true }, orderBy: { name: "asc" } },
    },
  });
  if (!run) notFound();
  return run;
}

export function teamProgress(milestoneIds: string[], submissions: { milestoneId: string; status: string }[]) {
  const approved = submissions.filter((s) => s.status === "APPROVED").length;
  const current = milestoneIds.findIndex((id) => submissions.find((s) => s.milestoneId === id)?.status !== "APPROVED");
  return { approved, total: milestoneIds.length, pct: Math.round((approved / (milestoneIds.length || 1)) * 100), currentIndex: current === -1 ? milestoneIds.length : current };
}

/** Rubric total as a percentage (levels 1–4, equal weights). */
export function rubricPercent(criteriaCount: number, scores: { level: number }[]) {
  if (!criteriaCount || scores.length < criteriaCount) return null;
  return Math.round((scores.reduce((s, x) => s + x.level, 0) / (criteriaCount * 4)) * 100);
}

export async function requireRunAccess(user: { id: string; role: string; schoolId: string }, runId: string) {
  const run = await prisma.projectRun.findUnique({ where: { id: runId }, include: { section: true } });
  if (!run || run.section.schoolId !== user.schoolId) notFound();
  if (user.role === "TEACHER") {
    const teaches = await prisma.teacherAssignment.findFirst({ where: { userId: user.id, sectionId: run.sectionId } });
    if (!teaches) notFound();
  }
  return run;
}
