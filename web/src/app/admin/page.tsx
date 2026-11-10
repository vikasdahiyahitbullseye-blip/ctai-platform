import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { houseStandings } from "@/lib/missions";
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
  const houses = await houseStandings(prisma, user.schoolId);
  const active = await Promise.all(sections.map((s) => prisma.attempt.groupBy({ by: ["userId"], where: { userId: { in: s.enrollments.map((e) => e.userId) }, submittedAt: { gte: weekAgo } } }).then((r) => r.length)));
  return (
    <>
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
      </Card>
      <Card title="House standings (this term)" className="mt-6">
        <div className="grid gap-3 sm:grid-cols-4">
          {houses.map((h, i) => (
            <div key={h.id} className="rounded-2xl p-4 text-white" style={{ background: h.color }}>
              <div className="text-sm opacity-90">#{i + 1} · {h.members} students</div>
              <div className="text-lg font-bold">{h.emoji} {h.name}</div>
              <div className="text-2xl font-bold tabular-nums">{h.points} pts</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
