import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { requireSectionAccess, sectionAnalytics } from "@/lib/teacher";
import { skillName } from "@/lib/progress";
import { MASTERY_LABEL } from "@/lib/mastery";
import { Card, PageHeader, Stat, Pill, LinkButton, MASTERY_TONE, Empty } from "@/components/ui";
import { ChapterChart } from "@/components/Charts";
import { toggleLeaderboard } from "@/app/actions/teacher";
import { createChallenge } from "@/app/actions/gamify";
import { prisma } from "@/lib/db";
import { challengeProgress } from "@/lib/missions";

const SHORT: Record<string, string> = { ABSTRACT: "Abstract", PATTERN: "Pattern", DECOMPOSITION: "Decomp.", ALGORITHMIC: "Algorithm", AI_CONCEPT: "AI", DATA: "Data", ETHICS: "Ethics" };

export default async function ClassDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("TEACHER", "ADMIN");
  await requireSectionAccess(user.id, id);
  const a = await sectionAnalytics(id);
  const { section } = a;
  const challenges = await prisma.classChallenge.findMany({ where: { sectionId: id }, orderBy: { endsAt: "desc" }, take: 3 });
  const chProgress = await Promise.all(challenges.map((c) => challengeProgress(prisma, c)));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Class ${section.classLevel}-${section.section} dashboard`}
        subtitle={`${a.kpis.students} students · ${a.kpis.answered} answers recorded`}
        action={<LinkButton href={`/teacher/generator?section=${section.id}`}>+ New test for this class</LinkButton>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Average score" value={a.kpis.avgScore !== null ? `${a.kpis.avgScore}%` : "—"} sub="All submitted work" />
        <Stat label="Active this week" value={`${a.kpis.activeThisWeek}/${a.kpis.students}`} sub="Completed at least one activity" />
        <Stat label="Test completion" value={a.kpis.testCompletion !== null ? `${a.kpis.testCompletion}%` : "—"} sub="Across assigned tests" />
        <Stat label="Need support" value={a.needsSupport.length} tone={a.needsSupport.length ? "warn" : "good"} sub="See list below" />
      </div>

      <Card title="Skill mastery by student" action={<span className="text-xs text-muted">Based on each student&apos;s last 20 answers per skill</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="py-2 pr-3 font-medium">Student</th>
                {a.skills.map((s) => <th key={s} className="px-1 py-2 text-center font-medium" title={skillName(s)}>{SHORT[s] ?? s}</th>)}
                <th className="py-2 pl-3 text-right font-medium">Last active</th>
              </tr>
            </thead>
            <tbody>
              {a.students.map((s) => {
                const last = a.lastActive.get(s.id);
                return (
                  <tr key={s.id} className="border-t border-line">
                    <td className="py-1.5 pr-3"><Link href={`/teacher/student/${s.id}`} className="font-medium hover:text-brand">{s.name}</Link></td>
                    {a.skills.map((k) => {
                      const m = a.mastery[s.id][k];
                      return (
                        <td key={k} className="px-1 py-1.5 text-center">
                          <span className={`inline-block min-w-14 rounded-md px-1.5 py-1 text-xs font-semibold tabular-nums ${MASTERY_TONE[m.level]}`} title={`${skillName(k)}: ${MASTERY_LABEL[m.level]} (${m.count} answers)`}>
                            {m.level === "NO_EVIDENCE" ? "–" : `${m.score}%`}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-1.5 pl-3 text-right text-xs text-muted">{last ? new Date(last).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Never"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {Object.entries(MASTERY_LABEL).map(([k, v]) => <span key={k} className={`rounded-md px-2 py-1 font-medium ${MASTERY_TONE[k]}`}>{v}</span>)}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Accuracy by chapter">
          {a.chapters.length ? <ChapterChart data={a.chapters} /> : <Empty>No answers yet.</Empty>}
        </Card>
        <Card title="Students who may need support">
          {a.needsSupport.length ? (
            <ul className="divide-y divide-line">
              {a.needsSupport.map((n) => (
                <li key={n.student.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                  <Link href={`/teacher/student/${n.student.id}`} className="font-medium hover:text-brand">{n.student.name}</Link>
                  <span className="flex flex-wrap gap-1">{n.reasons.map((r) => <Pill key={r} tone="warn">{r}</Pill>)}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>Everyone is on track. 👏</Empty>}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card title="Tests for this class">
          {a.tests.length ? (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="py-2 font-medium">Test</th><th className="py-2 font-medium">Due</th><th className="py-2 text-right font-medium">Submitted</th><th className="py-2 text-right font-medium">Average</th></tr></thead>
              <tbody>
                {a.tests.map((t) => (
                  <tr key={t.id} className="border-t border-line">
                    <td className="py-2"><Link className="font-medium text-brand" href={`/teacher/tests/${t.id}`}>{t.title}</Link></td>
                    <td className="py-2 text-muted">{t.dueAt ? t.dueAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</td>
                    <td className="py-2 text-right tabular-nums">{t.submitted}/{a.kpis.students}</td>
                    <td className="py-2 text-right tabular-nums">{t.avg !== null ? `${t.avg}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <Empty>No tests assigned yet.</Empty>}
        </Card>
        <Card title="Gamification">
          <p className="text-sm text-ink-2">Weekly leaderboard for this class is <strong>{section.leaderboard ? "on" : "off"}</strong>. {section.classLevel <= 5 && "For Classes 3–5 we recommend class team points instead of individual ranking."}</p>
          <form action={toggleLeaderboard.bind(null, section.id)} className="mt-4">
            <button className="rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:bg-surface-2">{section.leaderboard ? "Turn leaderboard off" : "Turn leaderboard on"}</button>
          </form>
          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-2 text-sm font-semibold">Class challenges</div>
            <ul className="mb-3 space-y-2 text-sm">
              {challenges.map((c, i) => <li key={c.id}><div className="flex justify-between gap-2"><span>{c.title}</span><span className="tabular-nums text-muted">{chProgress[i]}/{c.target}</span></div><div className="mt-1 h-1.5 rounded-full bg-surface-2"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (chProgress[i] / c.target) * 100)}%` }} /></div></li>)}
            </ul>
            <form action={createChallenge.bind(null, section.id)} className="grid gap-2 text-sm">
              <input name="title" required placeholder="e.g. 200 correct answers this week!" className="rounded-lg border border-line bg-surface px-2 py-1.5" />
              <div className="grid grid-cols-2 gap-2">
                <select name="metric" className="rounded-lg border border-line bg-surface px-2 py-1.5"><option value="CORRECT_ANSWERS">Correct answers</option><option value="PRACTICE_SETS">Practice sets</option><option value="PUZZLES">Puzzles solved</option></select>
                <input name="target" type="number" min={1} defaultValue={200} className="rounded-lg border border-line bg-surface px-2 py-1.5" aria-label="Target" />
                <input name="days" type="number" min={1} max={60} defaultValue={7} className="rounded-lg border border-line bg-surface px-2 py-1.5" aria-label="Days" />
                <input name="rewardXp" type="number" min={0} max={200} defaultValue={30} className="rounded-lg border border-line bg-surface px-2 py-1.5" aria-label="Reward XP" />
              </div>
              <button className="rounded-xl bg-brand px-3 py-2 font-semibold text-white">Start challenge</button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
