import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

/** Shared link for modules and videos: opens the right view for the signed-in role. */
export default async function LearnRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  if (user.role === "STUDENT") redirect(`/student/learn/${id}`);
  if (user.role === "TEACHER" || user.role === "ADMIN") redirect(`/teacher/learn/${id}`);
  redirect(`/studio/resources/${id}`);
}
