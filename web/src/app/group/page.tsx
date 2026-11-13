import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { rankByXp } from "@/lib/leaderboard";
import { Card, PageHeader, Stat, Pill, Empty, btn } from "@/components/ui";
import { openSchool } from "@/app/actions/group";
import { SchoolAdminForm } from "./SchoolAdminForm";

/** Group admin home: every school in the group side by side, class-wise use, and top students across schools. */
export default async function GroupHome() {
  const user = await requireUser("GROUPADMIN");
  const group = user.schoolGroupId ? await prisma.schoolGroup.findUnique({ where: { id: user.schoolGroupId }, include: { schools: { where: { isHq: false }, orderBy: { name: "asc" } } } }) : null;
  if (!group) return <Empty>Your login is not linked to a group of schools yet. Please contact Hitbullseye.</Empty>;
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const ids = group.schools.map((s) => s.id);

  const rows = await Promise.all(group.schools.map(async (s) => {
    const [students, teachers, active, tests, scored, admins] = await Promise.all([
      prisma.user.count({ where: { schoolId: s.id, role: "STUDENT", active: true } }),
      prisma.user.count({ where: { schoolId: s.id, role: "TEACHER", active: true } }),
      prisma.attempt.groupBy({ by: ["userId"], where: { user: { schoolId: s.id }, submittedAt: { gte: weekAgo } } }).then((r) => r.length),
      prisma.assessment.count({ where: { schoolId: s.id, kind: { in: ["TEST", "ASSIGNMENT"] } } }),
      prisma.attempt.aggregate({ where: { user: { schoolId: s.id }, submittedAt: { not: null }, maxScore: { gt: 0 }, assessment: { kind: { in: ["TEST", "ASSIGNMENT"] } } }, _sum: { score: true, maxScore: true } }),
      prisma.user.findMany({ where: { schoolId: s.id, role: "ADMIN", active: true }, select: { name: true } }),
    ]);
    const avg = scored._sum.maxScore ? Math.round(((scored._sum.score ?? 0) / scored._sum.maxScore) * 100) : null;
    return { s, students, teachers, active, tests, avg, admins: admins.map((a) => a.name) };
  }));
  const sum = (k: "students" | "teachers" | "active" | "tests") => rows.reduce((a, r) => a + r[k], 0);

  // Class-wise: active students this week as a share of enrolled students, per school.
  const sections = await prisma.classSection.findMany({ where: { schoolId: { in: ids } }, include: { enrollments: { select: { userId: true } } } });
  const activeIds = new Set((await prisma.attempt.groupBy({ by: ["userId"], where: { user: { schoolId: { in: ids } }, submittedAt: { gte: weekAgo } } })).map((r) => r.userId));
  const classes = [3, 4, 5, 6, 7, 8];
  const cell = (schoolId: string, cls: number) => {
    const en = sections.filter((x) => x.schoolId === schoolId && x.classLevel === cls).flatMap((x) => x.enrollments.map((e) => e.userId));
    return en.length ? { n: en.length, pct: Math.round((en.filter((u) => activeIds.has(u)).length / en.length) * 100) } : null;
  };

  const students = await prisma.user.findMany({ where: { schoolId: { in: ids }, role: "STUDENT", active: true }, select: { id: true, name: true, school: { select: { name: true } }, enrollments: { select: { section: { select: { classLevel: true, section: true } } } } } });
  const top = (await rankByXp(students.map((u) => ({ id: u.id, name: u.name, where: `${u.school.name} · ${u.enrollments[0] ? `${u.enrollments[0].section.classLevel}-${u.enrollments[0].section.section}` : ""}` })), "week")).slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader title={group.name} subtitle={`${group.schools.length} schools · group admin`} />
      <div className="grid gap-4 sm:grid-cols-5">
        <Stat label="Schools" value={group.schools.length} />
        <Stat label="Students" value={sum("students")} />
        <Stat label="Teachers" value={sum("teachers")} />
        <Stat label="Active students (7 days)" value={sum("active")} sub={sum("students") ? `${Math.round((sum("active") / sum("students")) * 100)}% of students` : undefined} />
        <Stat label="Tests and homework set" value={sum("tests")} />
      </div>

      <Card title="Schools" action={<span className="text-xs text-muted">Open a school to manage its classes, teachers and students</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">School</th><th className="text-right">Students</th><th className="text-right">Teachers</th><th className="text-right">Active (7d)</th><th className="text-right">Tests</th><th className="text-right">Average score</th><th className="pl-6">School admins</th><th className="text-right"> </th></tr></thead>
            <tbody>
              {rows.map(({ s, students, teachers, active, tests, avg, admins }) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="py-2 font-medium">{s.name}<div className="text-xs text-muted">{s.city} · {s.code}</div></td>
                  <td className="text-right tabular-nums">{students}</td>
                  <td className="text-right tabular-nums">{teachers}</td>
                  <td className="text-right tabular-nums">{active}{students ? <span className="text-xs text-muted"> ({Math.round((active / students) * 100)}%)</span> : null}</td>
                  <td className="text-right tabular-nums">{tests}</td>
                  <td className="text-right tabular-nums">{avg === null ? "—" : `${avg}%`}</td>
                  <td className="pl-6 text-xs">{admins.join(", ") || <span className="text-bad">none</span>}</td>
                  <td className="text-right">{s.active ? <form action={openSchool.bind(null, s.id)}><button className={btn.secondary}>Manage →</button></form> : <Pill tone="bad">Suspended</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Class-wise activity (students active in the last 7 days)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="py-2">School</th>{classes.map((c) => <th key={c} className="text-center">Class {c}</th>)}</tr></thead>
              <tbody>
                {group.schools.map((s) => (
                  <tr key={s.id} className="border-t border-line">
                    <td className="py-2 font-medium">{s.name}</td>
                    {classes.map((c) => {
                      const v = cell(s.id, c);
                      return <td key={c} className="text-center tabular-nums">{v ? <span className={`rounded-md px-1.5 py-0.5 ${v.pct >= 60 ? "bg-good-soft text-good" : v.pct >= 30 ? "bg-warn-soft text-warn" : "bg-bad-soft text-bad"}`} title={`${v.n} students`}>{v.pct}%</span> : <span className="text-muted">–</span>}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Top students across the group (XP this week)">
          {top.length && top[0].xp > 0 ? (
            <ol className="divide-y divide-line text-sm">
              {top.map((t) => <li key={t.userId} className="flex items-center gap-3 py-2"><span className="w-6 text-center font-bold tabular-nums">{t.rank}</span><span className="flex-1 font-medium">{t.name}<span className="ml-2 text-xs text-muted">{t.where}</span></span><span className="tabular-nums">{t.xp} XP</span></li>)}
            </ol>
          ) : <p className="text-sm text-muted">No activity this week yet.</p>}
        </Card>
      </div>

      <Card title="Add a school admin (principal) login"><SchoolAdminForm schools={group.schools.map((s) => ({ id: s.id, name: s.name }))} /></Card>
    </div>
  );
}
