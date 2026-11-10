import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { teacherSections, sectionAnalytics } from "@/lib/teacher";
import { Card, PageHeader, Pill, LinkButton, Empty, Stat } from "@/components/ui";
import { prisma } from "@/lib/db";

export default async function TeacherHome() {
  const user = await requireUser("TEACHER", "ADMIN");
  const sections = await teacherSections(user.id);
  const data = await Promise.all(sections.map(async (s) => ({ ...s, a: await sectionAnalytics(s.section.id) })));
  const ids = sections.map((s) => s.section.id);
  const [toMark, toReview, activeProjects] = await Promise.all([
    prisma.attempt.count({ where: { needsMarking: true, assessment: { assignments: { some: { sectionId: { in: ids } } } } } }),
    prisma.milestoneSubmission.count({ where: { status: "SUBMITTED", team: { run: { sectionId: { in: ids } } } } }),
    prisma.projectRun.count({ where: { status: "ACTIVE", sectionId: { in: ids } } }),
  ]);
  return (
    <div>
      <PageHeader title={`Welcome, ${user.name}`} subtitle="Your classes at a glance" action={<LinkButton href="/teacher/generator">+ New test</LinkButton>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Link href="/teacher/assignments"><Stat label="Homework to mark" value={toMark} tone={toMark ? "warn" : "good"} sub="Written answers and activities" /></Link>
        <Link href="/teacher/projects"><Stat label="Project work to review" value={toReview} tone={toReview ? "warn" : "good"} sub={`${activeProjects} active project${activeProjects === 1 ? "" : "s"}`} /></Link>
        <Link href="/teacher/curriculum"><Stat label="Curriculum map" value="📚" sub="Chapters, skills and subject links" /></Link>
      </div>
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
