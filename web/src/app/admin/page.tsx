import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { Card, PageHeader, Stat } from "@/components/ui";

export default async function AdminHome() {
  const user = await requireUser("ADMIN");
  const sections = await prisma.classSection.findMany({ where: { schoolId: user.schoolId }, include: { enrollments: true, teachers: { include: { user: true } } }, orderBy: [{ classLevel: "asc" }, { section: "asc" }] });
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const [students, teachers, attemptsWeek, questions, tests] = await Promise.all([
    prisma.user.count({ where: { schoolId: user.schoolId, role: "STUDENT" } }),
    prisma.user.count({ where: { schoolId: user.schoolId, role: "TEACHER" } }),
    prisma.attempt.count({ where: { user: { schoolId: user.schoolId }, submittedAt: { gte: weekAgo } } }),
    prisma.question.count(),
    prisma.assessment.count({ where: { schoolId: user.schoolId, kind: "TEST" } }),
  ]);
  const active = await Promise.all(sections.map((s) => prisma.attempt.groupBy({ by: ["userId"], where: { userId: { in: s.enrollments.map((e) => e.userId) }, submittedAt: { gte: weekAgo } } }).then((r) => r.length)));
  return (
    <AppShell user={user} nav={[{ href: "/admin", label: "School overview" }]}>
      <PageHeader title={user.school.name} subtitle={`Session ${user.school.session} · CT & AI usage`} />
      <div className="grid gap-4 sm:grid-cols-5">
        <Stat label="Students" value={students} />
        <Stat label="Teachers" value={teachers} />
        <Stat label="Activities this week" value={attemptsWeek} />
        <Stat label="Tests created" value={tests} />
        <Stat label="Questions available" value={questions} />
      </div>
      <Card title="Sections" className="mt-6">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted"><th className="py-2 font-medium">Section</th><th className="py-2 font-medium">Teachers</th><th className="py-2 text-right font-medium">Students</th><th className="py-2 text-right font-medium">Active this week</th></tr></thead>
          <tbody>
            {sections.map((s, i) => (
              <tr key={s.id} className="border-t border-line">
                <td className="py-2 font-medium">Class {s.classLevel}-{s.section}</td>
                <td className="py-2">{[...new Set(s.teachers.map((t) => t.user.name))].join(", ")}</td>
                <td className="py-2 text-right tabular-nums">{s.enrollments.length}</td>
                <td className="py-2 text-right tabular-nums">{active[i]}/{s.enrollments.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-muted">Bulk user import, class mapping and school-wide skill reports are planned for the MVP pilot phase (see docs/SPEC.md §12).</p>
      </Card>
    </AppShell>
  );
}
