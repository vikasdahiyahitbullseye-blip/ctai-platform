import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canUploadVideos, isRecorded } from "@/lib/videos";

/** Shared link for modules and videos: opens the right view for the signed-in role. */
export default async function LearnRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const r = await prisma.resource.findUnique({ where: { id }, select: { kind: true, url: true, fileId: true, classLevel: true } });
  // A concept video without a recording exists only for the people allowed to record it.
  if (r?.kind === "VIDEO" && !isRecorded(r) && (await canUploadVideos(user))) redirect(`/videos?cls=${r.classLevel ?? ""}#v${id}`);
  if (user.role === "STUDENT") redirect(`/student/learn/${id}`);
  if (user.role === "TEACHER" || user.role === "ADMIN") redirect(`/teacher/learn/${id}`);
  if (r?.kind === "VIDEO" && isRecorded(r) && user.role !== "CONTENT" && user.role !== "SUPERADMIN") redirect(`/videos?cls=${r.classLevel ?? ""}#v${id}`);
  redirect(`/studio/resources/${id}`);
}
