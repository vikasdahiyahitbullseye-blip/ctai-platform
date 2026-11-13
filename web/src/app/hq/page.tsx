import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader, Stat, Pill, btn } from "@/components/ui";
import { CreateSchoolForm } from "./CreateSchoolForm";
import { toggleSchool, setSchoolGroup } from "@/app/actions/hq";
import { CreateGroupForm, AddGroupAdminForm } from "./SchoolGroupForms";

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
  const groups = await prisma.schoolGroup.findMany({ include: { schools: { select: { name: true } }, admins: { select: { name: true, username: true, active: true } } }, orderBy: { name: "asc" } });
  const qByStatus = await prisma.question.groupBy({ by: ["status"], _count: true });
  const awaiting = await prisma.question.count({ where: { status: "PUBLISHED", approval: "UNREVIEWED" } });
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
      {awaiting > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-warn-soft p-4 text-sm">
          <span><strong>{awaiting}</strong> live questions are awaiting approval (students can already use them).</span>
          <Link href="/review" className={btn.primary}>Review and approve →</Link>
        </div>
      )}
      <Card title="Add a school"><CreateSchoolForm /></Card>
      <Card title="Groups of schools">
        <p className="mb-3 text-sm text-ink-2">For a chain of schools under one management. A <strong>group admin</strong> sees all the group&apos;s schools side by side and can manage each school (classes, teachers, students, logins), like that school&apos;s own admin. Put schools in a group with the Group column below.</p>
        {groups.length > 0 && (
          <ul className="mb-4 space-y-2 text-sm">
            {groups.map((g) => (
              <li key={g.id} className="rounded-xl border border-line p-3">
                <div className="font-semibold">{g.name}</div>
                <div className="text-xs text-muted">Schools: {g.schools.map((x) => x.name).join(", ") || "none yet"}</div>
                <div className="text-xs text-muted">Group admins: {g.admins.map((a) => `${a.name} (${a.username})${a.active ? "" : " – deactivated"}`).join(", ") || "none"}</div>
              </li>
            ))}
          </ul>
        )}
        <CreateGroupForm />
        {groups.length > 0 && <div className="mt-5 border-t border-line pt-4"><AddGroupAdminForm groups={groups.map((g) => ({ id: g.id, name: g.name }))} /></div>}
      </Card>
      <Card title="Schools">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">School</th><th>Code</th><th className="text-right">Classes</th><th className="text-right">Students</th><th className="text-right">Teachers</th><th className="text-right">Active (7d)</th><th className="text-right">Tests</th><th>Group</th><th className="text-right">Status</th></tr></thead>
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
                  <td>
                    <form action={setSchoolGroup.bind(null, s.id)} className="flex items-center gap-1">
                      <select name="groupId" defaultValue={s.groupId ?? ""} aria-label={`Group for ${s.name}`} className="max-w-40 rounded-lg border border-line bg-surface px-2 py-1 text-xs">
                        <option value="">No group</option>
                        {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      <button className="text-xs text-brand">Save</button>
                    </form>
                  </td>
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
