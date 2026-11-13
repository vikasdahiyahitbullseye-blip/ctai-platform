"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { cleanGroupName, newGroupCode, GROUP_LIMITS, GROUP_EMOJI } from "@/lib/leaderboard";

const back = (msg: string, scope?: string) => redirect(`/student/leaderboard?${scope ? `board=${encodeURIComponent(scope)}&` : ""}msg=${encodeURIComponent(msg)}`);

async function myGroupCount(userId: string) {
  return prisma.studentGroupMember.count({ where: { userId } });
}

export async function createGroup(form: FormData) {
  const user = await requireUser("STUDENT");
  const name = cleanGroupName(String(form.get("name") ?? ""));
  if (!name) return back("Please choose a friendly group name (2–30 letters, no links or rude words).");
  const emoji = GROUP_EMOJI.includes(String(form.get("emoji"))) ? String(form.get("emoji")) : GROUP_EMOJI[0];
  if ((await myGroupCount(user.id)) >= GROUP_LIMITS.maxGroupsPerStudent) return back(`You can be in up to ${GROUP_LIMITS.maxGroupsPerStudent} groups. Leave one first.`);
  let code = newGroupCode();
  while (await prisma.studentGroup.findUnique({ where: { code } })) code = newGroupCode();
  const g = await prisma.studentGroup.create({ data: { name, emoji, code, schoolId: user.schoolId, ownerId: user.id, members: { create: { userId: user.id } } } });
  back(`Group created! Share the code ${code} with your friends so they can join.`, `group:${g.id}`);
}

export async function joinGroup(form: FormData) {
  const user = await requireUser("STUDENT");
  const code = String(form.get("code") ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const g = await prisma.studentGroup.findUnique({ where: { code }, include: { _count: { select: { members: true } } } });
  // Groups are only for classmates in the same school.
  if (!g || g.schoolId !== user.schoolId) return back("No group has that code in your school. Check the code with your friend.");
  if (await prisma.studentGroupMember.findUnique({ where: { groupId_userId: { groupId: g.id, userId: user.id } } })) return back("You are already in this group.", `group:${g.id}`);
  if (g._count.members >= GROUP_LIMITS.maxMembers) return back(`This group is full (${GROUP_LIMITS.maxMembers} members).`);
  if ((await myGroupCount(user.id)) >= GROUP_LIMITS.maxGroupsPerStudent) return back(`You can be in up to ${GROUP_LIMITS.maxGroupsPerStudent} groups. Leave one first.`);
  await prisma.studentGroupMember.create({ data: { groupId: g.id, userId: user.id } });
  back(`You joined ${g.emoji} ${g.name}!`, `group:${g.id}`);
}

export async function leaveGroup(groupId: string) {
  const user = await requireUser("STUDENT");
  const g = await prisma.studentGroup.findUnique({ where: { id: groupId }, include: { members: { orderBy: { joinedAt: "asc" } } } });
  if (!g) return back("That group no longer exists.");
  await prisma.studentGroupMember.deleteMany({ where: { groupId, userId: user.id } });
  const left = g.members.filter((m) => m.userId !== user.id);
  if (!left.length) await prisma.studentGroup.delete({ where: { id: groupId } });
  else if (g.ownerId === user.id) await prisma.studentGroup.update({ where: { id: groupId }, data: { ownerId: left[0].userId } }); // the longest-standing member takes over
  back(`You left ${g.name}.`);
}

/** The group's creator can remove a member. */
export async function removeMember(groupId: string, userId: string) {
  const user = await requireUser("STUDENT");
  const g = await prisma.studentGroup.findUnique({ where: { id: groupId } });
  if (!g || g.ownerId !== user.id || userId === user.id) return back("Only the group's creator can remove members.");
  await prisma.studentGroupMember.deleteMany({ where: { groupId, userId } });
  revalidatePath("/student/leaderboard");
  back("Member removed.", `group:${groupId}`);
}

export async function deleteGroup(groupId: string) {
  const user = await requireUser("STUDENT");
  const g = await prisma.studentGroup.findUnique({ where: { id: groupId } });
  if (!g || g.ownerId !== user.id) return back("Only the group's creator can delete it.");
  await prisma.studentGroup.delete({ where: { id: groupId } });
  back(`${g.name} was deleted.`);
}

/** Teachers and school admins can remove a group (for example, an unkind name) from their school. */
export async function staffDeleteGroup(groupId: string, returnTo: string) {
  const user = await requireUser("TEACHER", "ADMIN");
  const g = await prisma.studentGroup.findUnique({ where: { id: groupId } });
  if (g && g.schoolId === user.schoolId) {
    await prisma.studentGroup.delete({ where: { id: groupId } });
    await prisma.auditLog.create({ data: { schoolId: user.schoolId, actorId: user.id, action: "STUDENT_GROUP_DELETED", detail: `${g.name} (${g.code})` } });
  }
  redirect(returnTo.startsWith("/") ? returnTo : "/teacher");
}
