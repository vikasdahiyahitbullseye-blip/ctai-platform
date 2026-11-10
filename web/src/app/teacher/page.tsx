import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { teacherSections, sectionAnalytics } from "@/lib/teacher";
import { Card, PageHeader, Pill, LinkButton, Empty } from "@/components/ui";

export default async function TeacherHome() {
  const user = await requireUser("TEACHER", "ADMIN");
  const sections = await teacherSections(user.id);
  const data = await Promise.all(sections.map(async (s) => ({ ...s, a: await sectionAnalytics(s.section.id) })));
  return (
    <div>
      <PageHeader title={`Welcome, ${user.name}`} subtitle="Your classes at a glance" action={<LinkButton href="/teacher/generator">+ New test</LinkButton>} />
      {data.length === 0 && <Empty>No classes are assigned to you yet.</Empty>}
      <div className="grid gap-6 md:grid-cols-2">
        {data.map(({ section, subjects, a }) => (
          <Card key={section.id} title={<span>Class {section.classLevel}-{section.section} <span className="ml-2 inline-flex gap-1">{subjects.map((s) => <Pill key={s} tone="brand">{s}</Pill>)}</span></span>} action={<Link className="text-sm font-semibold text-brand" href={`/teacher/class/${section.id}`}>Open dashboard →</Link>}>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div><dt className="text-xs text-muted">Students</dt><dd className="text-xl font-bold tabular-nums">{a.kpis.students}</dd></div>
              <div><dt className="text-xs text-muted">Active this week</dt><dd className="text-xl font-bold tabular-nums">{a.kpis.activeThisWeek}</dd></div>
              <div><dt className="text-xs text-muted">Average score</dt><dd className="text-xl font-bold tabular-nums">{a.kpis.avgScore ?? "—"}%</dd></div>
              <div><dt className="text-xs text-muted">Need support</dt><dd className={`text-xl font-bold tabular-nums ${a.needsSupport.length ? "text-warn" : ""}`}>{a.needsSupport.length}</dd></div>
            </dl>
            {a.tests[0] && (
              <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
                Latest: <Link className="font-medium text-brand" href={`/teacher/tests/${a.tests[0].id}`}>{a.tests[0].title}</Link> · {a.tests[0].submitted}/{a.kpis.students} submitted{a.tests[0].avg !== null ? ` · avg ${a.tests[0].avg}%` : ""}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
