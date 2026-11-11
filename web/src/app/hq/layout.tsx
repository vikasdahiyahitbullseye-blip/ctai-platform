import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { canUploadVideos } from "@/lib/videos";

export default async function HqLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("SUPERADMIN");
  return <AppShell user={user} nav={[{ href: "/hq", label: "Schools" }, { href: "/review", label: "Approve questions" }, { href: "/hq/staff", label: "Staff accounts" }, { href: "/hq/slides", label: "Class slides" }, { href: "/hq/settings", label: "Settings" }, { href: "/studio", label: "Content studio" }, ...(await canUploadVideos(user) ? [{ href: "/videos", label: "Concept videos" }] : [])]}>{children}</AppShell>;
}
