import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teacherSections } from "@/lib/teacher";
import { teamProgress } from "@/lib/projects";
import { Card, PageHeader, Pill, Progress, Empty } from "@/components/ui";
import { SubjectChips } from "@/components/ProjectBits";

export default async function TeacherProjects() {
  const user = await requireUser("TEACHER", "ADMIN");
  const sections = await teacherSections(user.id);
  const sectionIds = sections.map((s) => s.section.id);
  const levels = [...new Set(sections.map((s) => s.section.classLevel))];
  const [runs, kits] = await Promise.all([
    prisma.projectRun.findMany({ where: { sectionId: { in: sectionIds } }, include: { kit: { include: { milestones: true } }, section: true, teams: { include: { submissions: true } } }, orderBy: { startedAt: "desc" } }),
    prisma.projectKit.findMany({ where: { published: true, kind: "PROJECT", classLevel: { in: levels } }, orderBy: [{ classLevel: "asc" }] }),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Projects" subtitle="Classes 6–8: two 20-hour interdisciplinary projects per year (CBSE). Classes 3–5: optional mini-projects." />
      <Card title="Running and past projects">
        {runs.length === 0 ? <Empty>No projects yet — launch one from the library below.</Empty> : (
          <ul className="divide-y divide-line">
            {runs.map((r) => {
              const ids = r.kit.milestones.map((m) => m.id);
              const avg = Math.round(r.teams.reduce((s, t) => s + teamProgress(ids, t.submissions).pct, 0) / (r.teams.length || 1));
              const pending = r.teams.reduce((s, t) => s + t.submissions.filter((x) => x.status === "SUBMITTED").length, 0);
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-4 py-3">
                  <span className="text-3xl" aria-hidden>{r.kit.emoji}</span>
                  <div className="min-w-48 flex-1">
                    <Link href={`/teacher/projects/run/${r.id}`} className="font-semibold text-brand">{r.kit.title}</Link>
                    <div className="text-xs text-muted">Class {r.section.classLevel}-{r.section.section} · {r.teams.length} teams{r.dueAt ? ` · due ${r.dueAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}</div>
                  </div>
                  <div className="w-40"><Progress value={avg} label="Average progress" /><div className="mt-1 text-xs text-muted">{avg}% of milestones approved</div></div>
                  {pending > 0 && <Pill tone="warn">{pending} to review</Pill>}
                  <Pill tone={r.status === "ACTIVE" ? "brand" : "default"}>{r.status === "ACTIVE" ? "Active" : "Completed"}</Pill>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <h2 className="text-lg font-bold">Project library</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {kits.map((k) => (
          <Link key={k.id} href={`/teacher/projects/kit/${k.id}`} className="group rounded-2xl border border-line bg-surface p-5 shadow-sm transition hover:border-brand">
            <div className="flex items-start gap-3">
              <span className="text-4xl" aria-hidden>{k.emoji}</span>
              <div>
                <div className="font-bold group-hover:text-brand">{k.title}</div>
                <div className="text-sm text-ink-2">{k.tagline}</div>
                <div className="mt-2 text-xs text-muted">Class {k.classLevel} · {k.hours} hours{k.classLevel <= 5 ? " · optional" : " · counts towards the 40 project hours"}</div>
                <div className="mt-2"><SubjectChips codes={k.subjects.split(",")} /></div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
