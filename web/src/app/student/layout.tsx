import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("STUDENT");
  return (
    <AppShell
      user={user}
      nav={[
        { href: "/student", label: "Home" },
        { href: "/student/practice", label: "Practice" },
        { href: "/student/tests", label: "Tests" },
        { href: "/student/progress", label: "My Progress" },
        { href: "/student/rewards", label: "Rewards" },
      ]}
    >
      {children}
    </AppShell>
  );
}
