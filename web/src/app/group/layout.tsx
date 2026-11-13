import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";

export default async function GroupLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("GROUPADMIN");
  return <AppShell user={user} nav={[{ href: "/group", label: "All schools" }]}>{children}</AppShell>;
}
