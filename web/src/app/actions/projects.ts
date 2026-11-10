"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireSectionAccess } from "@/lib/teacher";
import { requireRunAccess } from "@/lib/projects";
import { saveUpload } from "@/lib/files";
import { addXp, award } from "@/lib/progress";
import { XP } from "@/lib/gamification";
import { rng, shuffle } from "@/lib/generator";

const TEAM_NAMES = ["Pixel Pioneers", "Data Detectives", "Logic Legends", "Bright Sparks", "Code Comets", "Idea Owls", "Pattern Pandas", "Think Tank"];

export async function launchProject(kitId: string, form: FormData) {
  const user = await requireUser("TEACHER", "ADMIN");
  const sectionId = String(form.get("sectionId"));
  const section = await requireSectionAccess(user.id, sectionId);
  const kit = await prisma.projectKit.findUniqueOrThrow({ where: { id: kitId } });
  if (kit.classLevel !== section.classLevel) throw new Error("This kit is for a different class.");
  const teamCount = Math.max(1, Math.min(10, Number(form.get("teams") ?? 4)));
  const due = String(form.get("dueAt") ?? "");
  const students = (await prisma.enrollment.findMany({ where: { sectionId, user: { active: true } }, include: { user: true } })).map((e) => e.user);
  const ordered = form.get("grouping") === "alpha" ? students.sort((a, b) => a.name.localeCompare(b.name)) : shuffle(students, rng(Date.now() % 100000));
  const run = await prisma.projectRun.create({ data: { kitId, sectionId, teacherId: user.id, dueAt: due ? new Date(`${due}T23:59:00`) : null } });
  for (let t = 0; t < teamCount; t++) {
    const members = ordered.filter((_, i) => i % teamCount === t);
    await prisma.projectTeam.create({ data: { runId: run.id, name: TEAM_NAMES[t % TEAM_NAMES.length], members: { create: members.map((m) => ({ userId: m.id })) } } });
  }
  redirect(`/teacher/projects/run/${run.id}?launched=1`);
}

export async function moveStudent(runId: string, form: FormData) {
  const user = await requireUser("TEACHER", "ADMIN");
  await requireRunAccess(user, runId);
  const userId = String(form.get("userId"));
  const teamId = String(form.get("teamId"));
  const team = await prisma.projectTeam.findFirst({ where: { id: teamId, runId } });
  if (!team) throw new Error("Team not found");
  await prisma.projectTeamMember.deleteMany({ where: { userId, team: { runId } } });
  await prisma.projectTeamMember.create({ data: { teamId, userId } });
  revalidatePath(`/teacher/projects/run/${runId}`);
}

export async function renameTeam(teamId: string, form: FormData) {
  const user = await requireUser("TEACHER", "ADMIN");
  const team = await prisma.projectTeam.findUniqueOrThrow({ where: { id: teamId } });
  await requireRunAccess(user, team.runId);
  const name = String(form.get("name") ?? "").trim().slice(0, 40);
  if (name) await prisma.projectTeam.update({ where: { id: teamId }, data: { name } });
  revalidatePath(`/teacher/projects/team/${teamId}`);
}

export async function reviewSubmission(submissionId: string, decision: "APPROVED" | "RETURNED", form: FormData) {
  const user = await requireUser("TEACHER", "ADMIN");
  const sub = await prisma.milestoneSubmission.findUniqueOrThrow({ where: { id: submissionId }, include: { team: { include: { members: true } } } });
  await requireRunAccess(user, sub.team.runId);
  const feedback = String(form.get("feedback") ?? "").trim() || null;
  if (decision === "RETURNED" && !feedback) throw new Error("Please tell the team what to improve.");
  await prisma.milestoneSubmission.update({ where: { id: submissionId }, data: { status: decision, feedback, reviewedAt: new Date() } });
  if (decision === "APPROVED" && sub.status !== "APPROVED") {
    for (const m of sub.team.members) {
      await addXp(prisma, m.userId, XP.MILESTONE_APPROVED, "Project milestone approved");
      await award(prisma, m.userId, "TEAM_PLAYER");
    }
  }
  revalidatePath(`/teacher/projects/team/${sub.teamId}`);
}

export async function scoreRubric(teamId: string, form: FormData) {
  const user = await requireUser("TEACHER", "ADMIN");
  const team = await prisma.projectTeam.findUniqueOrThrow({ where: { id: teamId }, include: { run: { include: { kit: { include: { criteria: true } } } } } });
  await requireRunAccess(user, team.runId);
  for (const c of team.run.kit.criteria) {
    const level = Number(form.get(`level_${c.id}`));
    if (!level) continue;
    const comment = String(form.get(`comment_${c.id}`) ?? "").trim() || null;
    await prisma.rubricScore.upsert({ where: { teamId_criterionId: { teamId, criterionId: c.id } }, create: { teamId, criterionId: c.id, level, comment }, update: { level, comment } });
  }
  revalidatePath(`/teacher/projects/team/${teamId}`);
}

export async function toggleShowcase(teamId: string) {
  const user = await requireUser("TEACHER", "ADMIN");
  const team = await prisma.projectTeam.findUniqueOrThrow({ where: { id: teamId }, include: { members: true } });
  await requireRunAccess(user, team.runId);
  await prisma.projectTeam.update({ where: { id: teamId }, data: { showcase: !team.showcase } });
  if (!team.showcase) for (const m of team.members) if (await award(prisma, m.userId, "SHOWCASE")) await addXp(prisma, m.userId, XP.SHOWCASE, "Project showcased");
  revalidatePath(`/teacher/projects/team/${teamId}`);
}

export async function setRunStatus(runId: string, status: "ACTIVE" | "COMPLETED") {
  const user = await requireUser("TEACHER", "ADMIN");
  await requireRunAccess(user, runId);
  await prisma.projectRun.update({ where: { id: runId }, data: { status } });
  revalidatePath(`/teacher/projects/run/${runId}`);
}

// ---------- Student ----------
async function myTeam(teamId: string) {
  const user = await requireUser("STUDENT");
  const team = await prisma.projectTeam.findFirst({ where: { id: teamId, members: { some: { userId: user.id } } }, include: { run: true } });
  if (!team) throw new Error("Not your team");
  return { user, team };
}

export async function submitMilestone(teamId: string, milestoneId: string, _: unknown, form: FormData) {
  const { user, team } = await myTeam(teamId);
  if (team.run.status !== "ACTIVE") return { error: "This project has finished." };
  const ms = await prisma.projectMilestone.findFirst({ where: { id: milestoneId, kitId: team.run.kitId } });
  if (!ms) return { error: "Milestone not found." };
  const existing = await prisma.milestoneSubmission.findUnique({ where: { teamId_milestoneId: { teamId, milestoneId } } });
  if (existing?.status === "APPROVED") return { error: "Already approved." };
  const text = String(form.get("text") ?? "").trim() || null;
  const link = String(form.get("link") ?? "").trim() || null;
  if (link && !/^https:\/\//.test(link)) return { error: "Links must start with https://" };
  let fileId: string | undefined;
  try {
    const f = await saveUpload(form.get("file") as File | null, user.id);
    if (f) fileId = f.id;
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (!text && !link && !fileId && !existing?.fileId) return { error: "Add a description, a link or a file." };
  const data = { text, link, ...(fileId ? { fileId } : {}), submittedById: user.id, status: "SUBMITTED", submittedAt: new Date() };
  await prisma.milestoneSubmission.upsert({ where: { teamId_milestoneId: { teamId, milestoneId } }, create: { teamId, milestoneId, ...data }, update: data });
  revalidatePath(`/student/projects/${teamId}`);
  return { ok: true };
}

export async function saveReflection(teamId: string, _: unknown, form: FormData) {
  const { user } = await myTeam(teamId);
  const learned = String(form.get("learned") ?? "").trim(), challenge = String(form.get("challenge") ?? "").trim(), nextTime = String(form.get("nextTime") ?? "").trim();
  if (!learned || !challenge || !nextTime) return { error: "Please answer all three questions." };
  await prisma.projectReflection.upsert({ where: { teamId_userId: { teamId, userId: user.id } }, create: { teamId, userId: user.id, learned, challenge, nextTime }, update: { learned, challenge, nextTime } });
  revalidatePath(`/student/projects/${teamId}`);
  return { ok: true };
}
