import { AppShell } from "@/components/AppShell";
import { requireSchoolAdmin } from "@/lib/auth";
import { canUploadVideos } from "@/lib/videos";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSchoolAdmin();
  return (
    <AppShell
      user={user}
      nav={[
        ...(user.role === "GROUPADMIN" ? [{ href: "/group", label: `← All schools (${user.school.name})` }] : []),
        { href: "/admin", label: "Overview" },
        { href: "/admin/classes", label: "Classes" },
        { href: "/admin/teachers", label: "Teachers" },
        { href: "/admin/students", label: "Students" },
        { href: "/admin/import", label: "Bulk import" },
        { href: "/admin/audit", label: "Activity log" },
        ...((await canUploadVideos(user)) ? [{ href: "/videos", label: "Concept videos" }] : []),
      ]}
    >
      {children}
    </AppShell>
  );
}
