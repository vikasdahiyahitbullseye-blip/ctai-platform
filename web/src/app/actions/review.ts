"use server";
// Question approval: a reviewer (or the super-admin) signs off questions as APPROVED,
// or rejects them, which also takes them out of use (status RETIRED).
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, audit } from "@/lib/auth";

const approver = () => requireUser("REVIEWER", "SUPERADMIN");
const ids = (form: FormData) => form.getAll("ids").map(String).filter(Boolean);

function refresh() {
  revalidatePath("/review");
  revalidatePath("/studio/questions");
  revalidatePath("/teacher/questions");
  revalidatePath("/hq");
}

/** Approves every ticked question in the form. */
export async function approveSelected(form: FormData) {
  const user = await approver();
  const list = ids(form);
  if (!list.length) return;
  const res = await prisma.question.updateMany({ where: { id: { in: list }, status: "PUBLISHED" }, data: { approval: "APPROVED", approvedById: user.id, approvedAt: new Date(), reviewNote: null } });
  await audit(user, "QUESTIONS_APPROVED", `${res.count} question(s)`);
  refresh();
}

export async function approveOne(id: string) {
  const user = await approver();
  const q = await prisma.question.update({ where: { id }, data: { approval: "APPROVED", approvedById: user.id, approvedAt: new Date(), reviewNote: null } });
  await audit(user, "QUESTION_APPROVED", q.code);
  refresh();
}

/** Rejects a question: it is removed from practice, tests and homework, with the reason kept for the content team. */
export async function rejectOne(id: string, form: FormData) {
  const user = await approver();
  const note = String(form.get(`note-${id}`) ?? "").trim().slice(0, 500) || "Rejected by reviewer";
  const q = await prisma.question.update({ where: { id }, data: { approval: "REJECTED", status: "RETIRED", reviewNote: note, approvedById: user.id, approvedAt: new Date() } });
  await audit(user, "QUESTION_REJECTED", `${q.code}: ${note}`);
  refresh();
}

/** Puts an approved or rejected question back in the queue (a rejected one goes back into use). */
export async function reopenOne(id: string) {
  const user = await approver();
  const old = await prisma.question.findUniqueOrThrow({ where: { id } });
  const q = await prisma.question.update({ where: { id }, data: { approval: "UNREVIEWED", approvedById: null, approvedAt: null, ...(old.approval === "REJECTED" ? { status: "PUBLISHED", reviewNote: null } : {}) } });
  await audit(user, "QUESTION_REOPENED", q.code);
  refresh();
}
