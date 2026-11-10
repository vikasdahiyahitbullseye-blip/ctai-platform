import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSection } from "@/lib/student";
import { teamProgress } from "@/lib/projects";
import { PageHeader, Empty } from "@/components/ui";
import { SubjectChips } from "@/components/ProjectBits";

export default async function StudentProjects() {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  const [mine, showcase] = await Promise.all([
    prisma.projectTeam.findMany({ where: { members: { some: { userId: user.id } } }, include: { run: { include: { kit: { include: { milestones: true } } } }, members: { include: { user: true } }, submissions: true }, orderBy: { run: { startedAt: "desc" } } }),
    section ? prisma.projectTeam.findMany({ where: { showcase: true, run: { sectionId: section.id } }, include: { run: { include: { kit: true } }, members: { include: { user: true } }, submissions: { where: { status: "APPROVED" }, orderBy: { submittedAt: "desc" }, take: 1 } } }) : [],
  ]);
  return (
    <div className="space-y-8">
      <PageHeader title="🚀 My projects" subtitle="Work with your team to solve real problems — step by step." />
      {mine.length === 0 ? <Empty>No projects yet. Your teacher will start one soon!</Empty> : (
        <div className="grid gap-5 md:grid-cols-2">
          {mine.map((t) => {
            const p = teamProgress(t.run.kit.milestones.sort((a, b) => a.position - b.position).map((m) => m.id), t.submissions);
            return (
              <Link key={t.id} href={`/student/projects/${t.id}`} className="group overflow-hidden rounded-3xl border-2 border-line bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-brand">
                <div className="flex items-center gap-4 bg-gradient-to-br from-[#ffe4c4] to-[#ffd1e8] p-5 dark:from-[#3b2614] dark:to-[#3a1630]">
                  <span className="text-5xl" aria-hidden>{t.run.kit.emoji}</span>
                  <div>
                    <div className="text-xl font-extrabold text-ink">{t.run.kit.title}</div>
                    <div className="text-sm text-ink-2">{t.run.kit.tagline}</div>
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <div className="text-sm"><strong>Team {t.name}</strong> · {t.members.map((m) => m.user.name.split(" ")[0]).join(", ")}</div>
                  <SubjectChips codes={t.run.kit.subjects.split(",")} />
                  <div>
                    <div className="mb-1 flex justify-between text-xs font-semibold"><span>{p.approved} of {p.total} steps done</span><span>{t.run.status === "COMPLETED" ? "Finished 🎉" : `${p.pct}%`}</span></div>
                    <div className="h-3 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-gradient-to-r from-accent to-[#ff4d8d]" style={{ width: `${p.pct}%` }} /></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {showcase.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-extrabold">🌟 Class showcase</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((t) => (
              <div key={t.id} className="rounded-3xl border-2 border-accent bg-accent-soft p-5">
                <div className="text-3xl" aria-hidden>{t.run.kit.emoji}</div>
                <div className="mt-1 font-bold">{t.name}</div>
                <div className="text-sm text-ink-2">{t.run.kit.title}</div>
                {t.submissions[0]?.text && <p className="mt-2 line-clamp-3 text-sm">“{t.submissions[0].text}”</p>}
                <div className="mt-2 text-xs text-muted">{t.members.map((m) => m.user.name.split(" ")[0]).join(", ")}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
