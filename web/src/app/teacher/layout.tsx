import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("TEACHER", "ADMIN");
  return (
    <AppShell
      user={user}
      nav={[
        { href: "/teacher", label: "My classes" },
        { href: "/teacher/generator", label: "Test generator" },
        { href: "/teacher/tests", label: "Tests" },
        { href: "/teacher/questions", label: "Question bank" },
      ]}
    >
      {children}
    </AppShell>
  );
}
