import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSection } from "@/lib/student";
import { masteryFor, skillName, studentSummary } from "@/lib/progress";
import { dashboardSkills } from "@/lib/constants";
import { MASTERY_LABEL } from "@/lib/mastery";
import { Card, PageHeader, Progress, Stat, MASTERY_TONE, Empty } from "@/components/ui";

export default async function ProgressPage() {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  if (!section) return <Empty>Not enrolled.</Empty>;
  const skills = dashboardSkills(section.classLevel);
  const [mastery, summary, attempts, xpEvents] = await Promise.all([
    masteryFor(prisma, [user.id], skills).then((m) => m[user.id]),
    studentSummary(prisma, user.id),
    prisma.attempt.findMany({ where: { userId: user.id, submittedAt: { not: null } }, include: { assessment: true, _count: { select: { responses: true } } }, orderBy: { submittedAt: "desc" }, take: 12 }),
    prisma.xpEvent.findMany({ where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 28 * 86400000) } } }),
  ]);
  const answered = await prisma.response.count({ where: { attempt: { userId: user.id }, correct: { not: null } } });
  const correct = await prisma.response.count({ where: { attempt: { userId: user.id }, correct: true } });

  // XP per week, last 4 weeks.
  const weeks = [3, 2, 1, 0].map((w) => {
    const end = Date.now() - w * 7 * 86400000;
    const startT = end - 7 * 86400000;
    return { label: w === 0 ? "This week" : `${w} wk ago`, xp: xpEvents.filter((e) => e.createdAt.getTime() > startT && e.createdAt.getTime() <= end).reduce((s, e) => s + e.amount, 0) };
  });
  const maxXp = Math.max(1, ...weeks.map((w) => w.xp));

  return (
    <div className="space-y-6">
      <PageHeader title="My progress" subtitle="Your skill levels are based on your recent answers — the more you practise, the more accurate they get." />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Questions answered" value={answered} />
        <Stat label="Accuracy" value={answered ? `${Math.round((correct / answered) * 100)}%` : "—"} />
        <Stat label="Level" value={summary.level} sub={summary.rank} />
        <Stat label="Streak" value={`🔥 ${summary.streak}`} sub="days" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card title="Thinking skills">
          <ul className="space-y-4">
            {skills.map((s) => {
              const m = mastery[s];
              return (
                <li key={s}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-medium">{skillName(s)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${MASTERY_TONE[m.level]}`}>{MASTERY_LABEL[m.level]}</span>
                  </div>
                  <Progress value={m.score ?? 0} label={skillName(s)} />
                  <div className="mt-1 text-xs text-muted">{m.count ? `Based on your last ${m.count} answers${m.score !== null ? ` · ${m.score}%` : ""}` : "No answers yet — try a practice set"}</div>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card title="XP earned (last 4 weeks)">
          <div className="flex h-48 items-end gap-4" role="img" aria-label={weeks.map((w) => `${w.label}: ${w.xp} XP`).join(", ")}>
            {weeks.map((w) => (
              <div key={w.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold tabular-nums">{w.xp}</span>
                <div className="w-full rounded-t-lg bg-brand" style={{ height: `${(w.xp / maxXp) * 140 + 4}px` }} />
                <span className="text-xs text-muted">{w.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Recent activity">
        {attempts.length ? (
          <ul className="divide-y divide-line">
            {attempts.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <div className="font-medium">{a.assessment.kind === "PRACTICE" ? `Practice · ${a.assessment.title}` : a.assessment.title}</div>
                  <div className="text-xs text-muted">{a.submittedAt!.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</div>
                </div>
                <Link href={`/student/result/${a.id}`} className="font-semibold tabular-nums text-brand">{a.score}/{a.maxScore}</Link>
              </li>
            ))}
          </ul>
        ) : <Empty>No activity yet.</Empty>}
      </Card>
    </div>
  );
}
