import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { canUploadVideos } from "@/lib/videos";

export default async function ReviewLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("REVIEWER", "SUPERADMIN");
  return (
    <AppShell
      user={user}
      nav={[
        { href: "/review", label: "Approve questions" },
        { href: "/review?state=APPROVED", label: "Approved" },
        { href: "/review?state=REJECTED", label: "Rejected" },
        ...((await canUploadVideos(user)) ? [{ href: "/videos", label: "Concept videos" }] : []),
        ...(user.role === "SUPERADMIN" ? [{ href: "/hq", label: "HQ" }, { href: "/studio", label: "Content studio" }] : []),
      ]}
    >
      {children}
    </AppShell>
  );
}
