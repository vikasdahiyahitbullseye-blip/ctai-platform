import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { requireRunAccess, runOverview, teamProgress, rubricPercent, PHASES } from "@/lib/projects";
import { Card, PageHeader, Pill, btn } from "@/components/ui";
import { STATUS_STYLE } from "@/components/ProjectBits";
import { moveStudent, setRunStatus } from "@/app/actions/projects";

export default async function RunPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ launched?: string }> }) {
  const { id } = await params;
  const { launched } = await searchParams;
  const user = await requireUser("TEACHER", "ADMIN");
  await requireRunAccess(user, id);
  const run = await runOverview(id);
  const ms = run.kit.milestones;
  const ids = ms.map((m) => m.id);
  const assigned = new Set(run.teams.flatMap((t) => t.members.map((m) => m.userId)));
  const unassigned = run.section.enrollments.map((e) => e.user).filter((u) => !assigned.has(u.id));
  const queue = run.teams.flatMap((t) => t.submissions.filter((s) => s.status === "SUBMITTED").map((s) => ({ team: t, s, m: ms.find((x) => x.id === s.milestoneId)! })));
  return (
    <div className="space-y-6">
      <PageHeader
        title={<span>{run.kit.emoji} {run.kit.title}</span>}
        subtitle={`Class ${run.section.classLevel}-${run.section.section} · started ${run.startedAt.toLocaleDateString("en-IN")}${run.dueAt ? ` · due ${run.dueAt.toLocaleDateString("en-IN")}` : ""}`}
        action={<form action={setRunStatus.bind(null, id, run.status === "ACTIVE" ? "COMPLETED" : "ACTIVE")}><button className={btn.secondary}>{run.status === "ACTIVE" ? "Mark project complete" : "Reopen project"}</button></form>}
      />
      {launched && <div className="rounded-xl bg-good-soft p-3 text-sm text-good">Project launched! Students can now see it under “Projects”. Check the teams below.</div>}
      <Card title="Progress by team">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="py-2">Team</th>
                {ms.map((m) => <th key={m.id} className="px-1 text-center" title={m.title}>{PHASES[m.phase]?.emoji} {m.position}</th>)}
                <th className="text-right">Rubric</th>
              </tr>
            </thead>
            <tbody>
              {run.teams.map((t) => {
                const p = teamProgress(ids, t.submissions);
                const rp = rubricPercent(run.kit.criteria.length, t.scores);
                return (
                  <tr key={t.id} className="border-t border-line">
                    <td className="py-2"><Link href={`/teacher/projects/team/${t.id}`} className="font-semibold text-brand">{t.name}</Link>{t.showcase && " 🌟"}<div className="text-xs text-muted">{t.members.length} members · {p.pct}%</div></td>
                    {ms.map((m) => {
                      const s = t.submissions.find((x) => x.milestoneId === m.id);
                      const st = STATUS_STYLE[s?.status ?? "NONE"];
                      return <td key={m.id} className="px-1 text-center"><span title={st.label} className={`inline-block h-7 w-7 rounded-lg leading-7 ${st.cls}`}>{s?.status === "APPROVED" ? "✓" : s?.status === "SUBMITTED" ? "!" : s?.status === "RETURNED" ? "↩" : "·"}</span></td>;
                    })}
                    <td className="text-right tabular-nums">{rp !== null ? `${rp}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">{Object.values(STATUS_STYLE).map((s) => <span key={s.label} className={`rounded-md px-2 py-1 ${s.cls}`}>{s.label}</span>)}</div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={`Waiting for your review (${queue.length})`}>
          {queue.length ? (
            <ul className="divide-y divide-line text-sm">
              {queue.map(({ team, s, m }) => <li key={s.id} className="flex justify-between gap-2 py-2"><span><strong>{team.name}</strong> · {m.position}. {m.title}</span><Link href={`/teacher/projects/team/${team.id}#m${m.id}`} className="font-semibold text-brand">Review →</Link></li>)}
            </ul>
          ) : <p className="text-sm text-muted">All caught up.</p>}
        </Card>
        <Card title="Teams">
          <ul className="space-y-3 text-sm">
            {run.teams.map((t) => (
              <li key={t.id}><strong>{t.name}:</strong> {t.members.map((m) => m.user.name).join(", ") || "—"}</li>
            ))}
            {unassigned.length > 0 && <li className="text-warn">Not in a team: {unassigned.map((u) => u.name).join(", ")}</li>}
          </ul>
          <form action={moveStudent.bind(null, id)} className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            <select name="userId" className="rounded-xl border border-line bg-surface px-3 py-2 text-sm">{run.section.enrollments.map((e) => <option key={e.userId} value={e.userId}>{e.user.name}</option>)}</select>
            <span className="self-center text-sm">→</span>
            <select name="teamId" className="rounded-xl border border-line bg-surface px-3 py-2 text-sm">{run.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
            <button className={btn.secondary}>Move</button>
          </form>
        </Card>
      </div>
      <p className="text-sm"><Pill>{run.kit.hours} hours</Pill> <Link href={`/teacher/projects/kit/${run.kitId}`} className="ml-2 text-brand">View teacher guide and rubric →</Link></p>
    </div>
  );
}
