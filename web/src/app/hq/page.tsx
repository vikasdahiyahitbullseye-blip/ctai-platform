import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader, Stat, Pill } from "@/components/ui";
import { CreateSchoolForm } from "./CreateSchoolForm";
import { toggleSchool } from "@/app/actions/hq";

export default async function HqHome() {
  await requireUser("SUPERADMIN");
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const schools = await prisma.school.findMany({ where: { isHq: false }, include: { _count: { select: { users: true, sections: true } } }, orderBy: { createdAt: "desc" } });
  const rows = await Promise.all(
    schools.map(async (s) => ({
      s,
      students: await prisma.user.count({ where: { schoolId: s.id, role: "STUDENT" } }),
      teachers: await prisma.user.count({ where: { schoolId: s.id, role: "TEACHER" } }),
      active: (await prisma.attempt.groupBy({ by: ["userId"], where: { user: { schoolId: s.id }, submittedAt: { gte: weekAgo } } })).length,
      tests: await prisma.assessment.count({ where: { schoolId: s.id, kind: { in: ["TEST", "ASSIGNMENT"] } } }),
    })),
  );
  const qByStatus = await prisma.question.groupBy({ by: ["status"], _count: true });
  const total = (k: keyof (typeof rows)[number]) => rows.reduce((a, r) => a + (r[k] as number), 0);
  return (
    <div className="space-y-6">
      <PageHeader title="Hitbullseye HQ" subtitle="All schools on the platform" />
      <div className="grid gap-4 sm:grid-cols-5">
        <Stat label="Schools" value={schools.length} />
        <Stat label="Students" value={total("students")} />
        <Stat label="Teachers" value={total("teachers")} />
        <Stat label="Active students (7 days)" value={total("active")} />
        <Stat label="Published questions" value={qByStatus.find((q) => q.status === "PUBLISHED")?._count ?? 0} sub={`${qByStatus.filter((q) => q.status !== "PUBLISHED").reduce((a, q) => a + q._count, 0)} in draft/review`} />
      </div>
      <Card title="Add a school"><CreateSchoolForm /></Card>
      <Card title="Schools">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">School</th><th>Code</th><th className="text-right">Classes</th><th className="text-right">Students</th><th className="text-right">Teachers</th><th className="text-right">Active (7d)</th><th className="text-right">Tests</th><th className="text-right">Status</th></tr></thead>
            <tbody>
              {rows.map(({ s, students, teachers, active, tests }) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="py-2 font-medium">{s.name}<div className="text-xs text-muted">{s.city}</div></td>
                  <td className="font-mono text-xs">{s.code}</td>
                  <td className="text-right tabular-nums">{s._count.sections}</td>
                  <td className="text-right tabular-nums">{students}</td>
                  <td className="text-right tabular-nums">{teachers}</td>
                  <td className="text-right tabular-nums">{active}</td>
                  <td className="text-right tabular-nums">{tests}</td>
                  <td className="text-right"><form action={toggleSchool.bind(null, s.id)} className="inline-flex items-center gap-2">{s.active ? <Pill tone="good">Active</Pill> : <Pill tone="bad">Suspended</Pill>}<button className="text-xs text-brand">{s.active ? "Suspend" : "Reactivate"}</button></form></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
