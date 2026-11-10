import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireRunAccess, PHASES, rubricPercent } from "@/lib/projects";
import { Card, PageHeader, btn } from "@/components/ui";
import { STATUS_STYLE } from "@/components/ProjectBits";
import { Markdown } from "@/components/Markdown";
import { reviewSubmission, scoreRubric, toggleShowcase, renameTeam } from "@/app/actions/projects";

const LEVEL_NAMES = ["Beginning", "Developing", "Secure", "Excellent"];

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("TEACHER", "ADMIN");
  const team = await prisma.projectTeam.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      submissions: { include: { file: true } },
      scores: true,
      reflections: true,
      run: { include: { section: true, kit: { include: { milestones: { orderBy: { position: "asc" } }, criteria: { orderBy: { position: "asc" } } } } } },
    },
  });
  if (!team) notFound();
  await requireRunAccess(user, team.runId);
  const kit = team.run.kit;
  const names = new Map(team.members.map((m) => [m.userId, m.user.name]));
  const rp = rubricPercent(kit.criteria.length, team.scores);
  const input = "w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  return (
    <div className="space-y-6">
      <PageHeader
        title={<span>{team.name} {team.showcase && "🌟"}</span>}
        subtitle={`${kit.emoji} ${kit.title} · Class ${team.run.section.classLevel}-${team.run.section.section} · ${team.members.map((m) => m.user.name).join(", ")}`}
        action={<div className="flex gap-2"><Link href={`/teacher/projects/run/${team.runId}`} className={btn.secondary}>All teams</Link><form action={toggleShowcase.bind(null, id)}><button className={btn.secondary}>{team.showcase ? "Remove from showcase" : "🌟 Add to showcase"}</button></form></div>}
      />
      <form action={renameTeam.bind(null, id)} className="flex gap-2"><input name="name" defaultValue={team.name} className="rounded-xl border border-line bg-surface px-3 py-2 text-sm" /><button className={btn.ghost}>Rename team</button></form>
      {kit.milestones.map((m) => {
        const s = team.submissions.find((x) => x.milestoneId === m.id);
        const st = STATUS_STYLE[s?.status ?? "NONE"];
        return (
          <Card key={m.id} title={<span id={`m${m.id}`}>{PHASES[m.phase]?.emoji} {m.position}. {m.title}</span>} action={<span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>}>
            <p className="text-sm text-muted">Deliverable: {m.deliverable}</p>
            {s ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl bg-surface-2 p-3 text-sm">
                  {s.text && <Markdown text={s.text} />}
                  {s.link && <p><a href={s.link} target="_blank" rel="noopener noreferrer" className="text-brand underline">{s.link}</a></p>}
                  {s.file && (s.file.mime.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/files/${s.file.id}`} alt={`Evidence: ${s.file.filename}`} className="mt-2 max-h-72 rounded-lg" />
                  ) : <p>📎 <a href={`/api/files/${s.file.id}`} className="text-brand underline" target="_blank">{s.file.filename}</a></p>)}
                  <p className="mt-2 text-xs text-muted">Submitted by {names.get(s.submittedById) ?? "a team member"} on {s.submittedAt.toLocaleDateString("en-IN")}</p>
                </div>
                {s.status === "SUBMITTED" ? (
                  <form className="flex flex-wrap gap-2">
                    <input name="feedback" placeholder="Feedback for the team (required to send back)" className={`${input} min-w-64 flex-1`} />
                    <button formAction={reviewSubmission.bind(null, s.id, "APPROVED")} className={btn.primary}>✓ Approve (+30 XP each)</button>
                    <button formAction={reviewSubmission.bind(null, s.id, "RETURNED")} className={btn.secondary}>↩ Send back</button>
                  </form>
                ) : s.feedback ? <p className="text-sm"><strong>Your feedback:</strong> {s.feedback}</p> : null}
              </div>
            ) : <p className="mt-3 text-sm text-muted">Nothing submitted yet.</p>}
          </Card>
        );
      })}
      <Card title={`Rubric score${rp !== null ? ` · ${rp}%` : ""}`}>
        <form action={scoreRubric.bind(null, id)} className="space-y-5">
          {kit.criteria.map((c) => {
            const levels = JSON.parse(c.levels) as string[];
            const cur = team.scores.find((x) => x.criterionId === c.id);
            return (
              <fieldset key={c.id}>
                <legend className="font-semibold">{c.name}</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-4">
                  {levels.map((l, i) => (
                    <label key={i} className="flex cursor-pointer flex-col gap-1 rounded-xl border-2 border-line p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                      <span className="flex items-center gap-2 font-semibold"><input type="radio" name={`level_${c.id}`} value={i + 1} defaultChecked={cur?.level === i + 1} />{i + 1} · {LEVEL_NAMES[i]}</span>
                      <span className="text-xs text-ink-2">{l}</span>
                    </label>
                  ))}
                </div>
                <input name={`comment_${c.id}`} defaultValue={cur?.comment ?? ""} placeholder="Comment (optional)" className={`${input} mt-2`} />
              </fieldset>
            );
          })}
          <button className={btn.primary}>Save rubric scores</button>
        </form>
      </Card>
      <Card title="Individual reflections">
        {team.members.map((m) => {
          const r = team.reflections.find((x) => x.userId === m.userId);
          return (
            <div key={m.userId} className="border-t border-line py-3 text-sm first:border-0">
              <strong>{m.user.name}</strong>
              {r ? <ul className="mt-1 space-y-0.5 text-ink-2"><li>📘 Learned: {r.learned}</li><li>🧗 Challenge: {r.challenge}</li><li>🔁 Next time: {r.nextTime}</li></ul> : <p className="text-muted">Not written yet.</p>}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
