import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teacherSections } from "@/lib/teacher";
import { PHASES } from "@/lib/projects";
import { Card, PageHeader, btn, Empty } from "@/components/ui";
import { SubjectChips, SkillChips } from "@/components/ProjectBits";
import { Markdown } from "@/components/Markdown";
import { launchProject } from "@/app/actions/projects";

export default async function KitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("TEACHER", "ADMIN");
  const kit = await prisma.projectKit.findUnique({ where: { id }, include: { milestones: { orderBy: { position: "asc" } }, criteria: { orderBy: { position: "asc" } } } });
  if (!kit) notFound();
  const sections = (await teacherSections(user.id)).filter((s) => s.section.classLevel === kit.classLevel);
  const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  return (
    <div className="space-y-6">
      <PageHeader title={<span>{kit.emoji} {kit.title}</span>} subtitle={`Class ${kit.classLevel} · ${kit.hours} hours · ${kit.milestones.length} milestones`} />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card title="About this project">
          <p className="text-lg font-semibold text-brand-ink">“{kit.drivingQuestion}”</p>
          <p className="mt-3 text-ink-2">{kit.overview}</p>
          <div className="mt-4 space-y-2 text-sm"><div><strong>Subjects:</strong> <SubjectChips codes={kit.subjects.split(",")} /></div><div><strong>Skills:</strong> <SkillChips codes={kit.skills.split(",")} /></div><div><strong>Final product:</strong> {kit.finalProduct}</div></div>
        </Card>
        <Card title="Launch for a class">
          {sections.length ? (
            <form action={launchProject.bind(null, kit.id)} className="space-y-3">
              <label className="block text-sm font-medium">Class<select name="sectionId" className={input}>{sections.map((s) => <option key={s.section.id} value={s.section.id}>Class {s.section.classLevel}-{s.section.section}</option>)}</select></label>
              <label className="block text-sm font-medium">Number of teams<input type="number" name="teams" min={1} max={10} defaultValue={4} className={input} /></label>
              <label className="block text-sm font-medium">Make teams<select name="grouping" className={input}><option value="mixed">Mixed (random)</option><option value="alpha">By name order</option></select></label>
              <label className="block text-sm font-medium">Due date<input type="date" name="dueAt" className={input} /></label>
              <button className={`${btn.primary} w-full`}>🚀 Launch project</button>
              <p className="text-xs text-muted">You can move students between teams afterwards.</p>
            </form>
          ) : <Empty>You don&apos;t teach a Class {kit.classLevel} section.</Empty>}
        </Card>
      </div>
      <Card title="Milestones and teacher guide">
        <ol className="space-y-4">
          {kit.milestones.map((m) => (
            <li key={m.id} className="rounded-2xl border border-line p-4">
              <div className="flex flex-wrap items-center gap-2"><span className="text-xl" aria-hidden>{PHASES[m.phase]?.emoji}</span><strong>{m.position}. {m.title}</strong><span className="text-xs text-muted">{PHASES[m.phase]?.label} · {m.sessions} session{m.sessions > 1 ? "s" : ""}</span></div>
              <div className="mt-2 grid gap-3 text-sm md:grid-cols-2">
                <div><div className="text-xs font-semibold uppercase text-muted">Students do</div><Markdown text={m.studentTask} /></div>
                <div className="rounded-xl bg-surface-2 p-3"><div className="text-xs font-semibold uppercase text-muted">Teacher guide</div><Markdown text={m.teacherGuide} /></div>
              </div>
              <div className="mt-2 text-xs"><strong>Deliverable:</strong> {m.deliverable}</div>
            </li>
          ))}
        </ol>
      </Card>
      <Card title="Assessment rubric">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="text-left text-xs text-muted"><th className="py-2">Criterion</th><th>1 · Beginning</th><th>2 · Developing</th><th>3 · Secure</th><th>4 · Excellent</th></tr></thead>
            <tbody>{kit.criteria.map((c) => <tr key={c.id} className="border-t border-line align-top"><td className="py-2 pr-3 font-semibold">{c.name}</td>{(JSON.parse(c.levels) as string[]).map((l, i) => <td key={i} className="py-2 pr-3 text-ink-2">{l}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
