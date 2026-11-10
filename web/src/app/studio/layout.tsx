import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("CONTENT", "SUPERADMIN");
  return (
    <AppShell
      user={user}
      nav={[
        { href: "/studio", label: "Studio home" },
        { href: "/studio/questions", label: "Questions" },
        { href: "/studio/import", label: "Import" },
        { href: "/studio/resources", label: "Resources" },
        { href: "/studio/projects", label: "Project kits" },
        { href: "/studio/connections", label: "Subject links" },
        ...(user.role === "SUPERADMIN" ? [{ href: "/hq", label: "HQ" }] : []),
      ]}
    >
      {children}
    </AppShell>
  );
}
