import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";

export default async function HqLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("SUPERADMIN");
  return <AppShell user={user} nav={[{ href: "/hq", label: "Schools" }, { href: "/review", label: "Approve questions" }, { href: "/hq/staff", label: "Staff accounts" }, { href: "/studio", label: "Content studio" }]}>{children}</AppShell>;
}
