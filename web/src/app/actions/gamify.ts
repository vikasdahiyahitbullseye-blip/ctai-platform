"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ANIMALS, BACKGROUNDS, ACCESSORIES } from "@/lib/avatar";
import { studentSummary, addXp } from "@/lib/progress";
import { claimMission as claim, challengeProgress } from "@/lib/missions";
import { requireSectionAccess } from "@/lib/teacher";

export async function saveAvatar(form: FormData) {
  const user = await requireUser("STUDENT");
  const { level } = await studentSummary(prisma, user.id);
  const animal = String(form.get("animal"));
  const bg = String(form.get("bg"));
  const accessory = String(form.get("accessory") ?? "") || null;
  if (!ANIMALS.some((a) => a.id === animal) || !BACKGROUNDS.some((b) => b.id === bg)) throw new Error("Invalid choice");
  const acc = ACCESSORIES.find((a) => a.id === accessory);
  if (accessory && (!acc || acc.level > level)) throw new Error("Not unlocked yet");
  await prisma.user.update({ where: { id: user.id }, data: { avatar: JSON.stringify({ animal, bg, accessory }) } });
  revalidatePath("/student", "layout");
}

export async function claimMissionAction(code: string) {
  const user = await requireUser("STUDENT");
  await claim(prisma, user.id, code);
  revalidatePath("/student");
}

export async function claimChallenge(challengeId: string) {
  const user = await requireUser("STUDENT");
  const ch = await prisma.classChallenge.findUniqueOrThrow({ where: { id: challengeId } });
  const member = await prisma.enrollment.findFirst({ where: { userId: user.id, sectionId: ch.sectionId } });
  if (!member) throw new Error("Not your class");
  const progress = await challengeProgress(prisma, ch);
  if (progress < ch.target) return;
  const existing = await prisma.missionClaim.findUnique({ where: { userId_mission_weekKey: { userId: user.id, mission: `CH_${ch.id}`, weekKey: "challenge" } } });
  if (existing) return;
  await prisma.missionClaim.create({ data: { userId: user.id, mission: `CH_${ch.id}`, weekKey: "challenge" } });
  await addXp(prisma, user.id, ch.rewardXp, `Class challenge: ${ch.title}`);
  revalidatePath("/student");
}

export async function createChallenge(sectionId: string, form: FormData) {
  const user = await requireUser("TEACHER", "ADMIN");
  await requireSectionAccess(user.id, sectionId);
  const p = z.object({
    title: z.string().trim().min(3).max(100),
    metric: z.enum(["CORRECT_ANSWERS", "PRACTICE_SETS", "PUZZLES"]),
    target: z.coerce.number().int().min(1).max(100000),
    days: z.coerce.number().int().min(1).max(60),
    rewardXp: z.coerce.number().int().min(0).max(200),
  }).parse(Object.fromEntries(form));
  await prisma.classChallenge.create({ data: { sectionId, title: p.title, metric: p.metric, target: p.target, rewardXp: p.rewardXp, endsAt: new Date(Date.now() + p.days * 86400000), createdById: user.id } });
  revalidatePath(`/teacher/class/${sectionId}`);
}
