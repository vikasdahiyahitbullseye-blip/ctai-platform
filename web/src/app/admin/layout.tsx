import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("ADMIN");
  return (
    <AppShell
      user={user}
      nav={[
        { href: "/admin", label: "Overview" },
        { href: "/admin/classes", label: "Classes" },
        { href: "/admin/teachers", label: "Teachers" },
        { href: "/admin/students", label: "Students" },
        { href: "/admin/import", label: "Bulk import" },
        { href: "/admin/audit", label: "Activity log" },
      ]}
    >
      {children}
    </AppShell>
  );
}
