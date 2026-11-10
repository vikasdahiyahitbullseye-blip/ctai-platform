import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PHASES, teamProgress, rubricPercent } from "@/lib/projects";
import { Markdown } from "@/components/Markdown";
import { SubjectChips, SkillChips, STATUS_STYLE } from "@/components/ProjectBits";
import { MilestoneForm, ReflectionForm } from "./forms";

const LEVEL_NAMES = ["Beginning", "Developing", "Secure", "Excellent"];

export default async function ProjectJourney({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("STUDENT");
  const team = await prisma.projectTeam.findFirst({
    where: { id, members: { some: { userId: user.id } } },
    include: {
      members: { include: { user: true } },
      submissions: { include: { file: true } },
      scores: true,
      reflections: true,
      run: { include: { kit: { include: { milestones: { orderBy: { position: "asc" } }, criteria: { orderBy: { position: "asc" } } } } } },
    },
  });
  if (!team) notFound();
  const kit = team.run.kit;
  const p = teamProgress(kit.milestones.map((m) => m.id), team.submissions);
  const mine = team.reflections.find((r) => r.userId === user.id);
  const rp = rubricPercent(kit.criteria.length, team.scores);
  const active = team.run.status === "ACTIVE";

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff9a3c] via-[#ff5e8a] to-[#8b5cf6] p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center gap-5">
          <span className="text-6xl drop-shadow" aria-hidden>{kit.emoji}</span>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold">{kit.title}</h1>
            <p className="mt-1 text-lg opacity-95">“{kit.drivingQuestion}”</p>
            <p className="mt-2 text-sm opacity-90">Team <strong>{team.name}</strong>: {team.members.map((m) => m.user.name).join(", ")}</p>
          </div>
          <div className="rounded-2xl bg-white/20 px-5 py-3 text-center">
            <div className="text-3xl font-extrabold tabular-nums">{p.approved}/{p.total}</div>
            <div className="text-xs">steps done</div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 text-sm"><SubjectChips codes={kit.subjects.split(",")} /><SkillChips codes={kit.skills.split(",")} /></div>

      <ol className="relative space-y-6 border-l-4 border-dashed border-line pl-8">
        {kit.milestones.map((m, i) => {
          const s = team.submissions.find((x) => x.milestoneId === m.id);
          const st = STATUS_STYLE[s?.status ?? "NONE"];
          const isCurrent = i === p.currentIndex;
          const locked = i > p.currentIndex + 1 && !s;
          return (
            <li key={m.id} className="relative">
              <span className={`absolute -left-[3.15rem] flex h-11 w-11 items-center justify-center rounded-full border-4 border-bg text-xl shadow ${s?.status === "APPROVED" ? "bg-good text-white" : isCurrent ? "bg-accent text-white" : "bg-surface-2"}`} aria-hidden>
                {s?.status === "APPROVED" ? "✓" : PHASES[m.phase]?.emoji}
              </span>
              <div className={`rounded-3xl border-2 bg-surface p-5 shadow-sm ${isCurrent ? "border-accent" : "border-line"} ${locked ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-extrabold">Step {m.position}: {m.title}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>{st.label}</span>
                </div>
                <div className="mt-1 text-xs font-medium text-muted">{PHASES[m.phase]?.label} · about {m.sessions} class period{m.sessions > 1 ? "s" : ""}</div>
                <div className="mt-3"><Markdown text={m.studentTask} /></div>
                <p className="mt-2 text-sm"><strong>Hand in:</strong> {m.deliverable}</p>
                {s?.feedback && <div className={`mt-3 rounded-2xl p-3 text-sm ${s.status === "RETURNED" ? "bg-bad-soft" : "bg-good-soft"}`}>💬 <strong>Teacher:</strong> {s.feedback}</div>}
                {s && s.status !== "RETURNED" && (
                  <div className="mt-3 rounded-2xl bg-surface-2 p-3 text-sm">
                    {s.text && <Markdown text={s.text} />}
                    {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-brand underline">{s.link}</a>}
                    {s.file && <p>📎 <a href={`/api/files/${s.file.id}`} target="_blank" className="text-brand underline">{s.file.filename}</a></p>}
                  </div>
                )}
                {active && !locked && s?.status !== "APPROVED" && <MilestoneForm teamId={team.id} milestoneId={m.id} text={s?.text ?? ""} link={s?.link ?? ""} resubmit={!!s} />}
              </div>
            </li>
          );
        })}
      </ol>

      <section className="rounded-3xl border-2 border-line bg-surface p-6">
        <h2 className="text-xl font-extrabold">💭 My reflection</h2>
        <p className="text-sm text-muted">Everyone writes their own.</p>
        <ReflectionForm teamId={team.id} init={mine ? { learned: mine.learned, challenge: mine.challenge, nextTime: mine.nextTime } : null} />
      </section>

      <section className="rounded-3xl border-2 border-line bg-surface p-6">
        <h2 className="text-xl font-extrabold">🏅 How your project is assessed {rp !== null && <span className="text-brand">· {rp}%</span>}</h2>
        <div className="mt-3 space-y-3">
          {kit.criteria.map((c) => {
            const levels = JSON.parse(c.levels) as string[];
            const sc = team.scores.find((x) => x.criterionId === c.id);
            return (
              <div key={c.id} className="rounded-2xl bg-surface-2 p-3 text-sm">
                <div className="flex justify-between gap-2"><strong>{c.name}</strong>{sc && <span className="font-bold text-brand">{"⭐".repeat(sc.level)} {LEVEL_NAMES[sc.level - 1]}</span>}</div>
                <div className="mt-1 text-ink-2">Excellent looks like: {levels[3]}</div>
                {sc?.comment && <div className="mt-1">💬 {sc.comment}</div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
