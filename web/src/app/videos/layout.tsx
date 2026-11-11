import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireUser, homeFor } from "@/lib/auth";
import { canUploadVideos } from "@/lib/videos";

/** Concept-video uploads: only for roles the super-admin allows; for everyone else the page does not exist. */
export default async function VideosLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!(await canUploadVideos(user))) notFound();
  return <AppShell user={user} nav={[{ href: homeFor(user.role), label: "← Home" }, { href: "/videos", label: "Concept videos" }]}>{children}</AppShell>;
}
