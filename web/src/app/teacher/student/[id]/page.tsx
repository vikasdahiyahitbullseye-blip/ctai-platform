import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { masteryFor, skillName, studentSummary } from "@/lib/progress";
import { dashboardSkills, CORE_CT_SKILLS } from "@/lib/constants";
import { MASTERY_LABEL } from "@/lib/mastery";
import { Card, PageHeader, Progress, Stat, MASTERY_TONE, btn, Empty } from "@/components/ui";
import { addObservation } from "@/app/actions/teacher";

const RATING = ["", "Needs support", "Developing", "Secure", "Exceeding"];

export default async function StudentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("TEACHER", "ADMIN");
  const enr = await prisma.enrollment.findFirst({ where: { userId: id, section: { teachers: { some: { userId: user.id } } } }, include: { user: true, section: true } });
  if (!enr) notFound();
  const student = enr.user;
  const skills = dashboardSkills(enr.section.classLevel);
  const [mastery, summary, attempts, observations] = await Promise.all([
    masteryFor(prisma, [id], skills).then((m) => m[id]),
    studentSummary(prisma, id),
    prisma.attempt.findMany({ where: { userId: id, submittedAt: { not: null }, assessment: { kind: { not: "PUZZLE" } } }, include: { assessment: true }, orderBy: { submittedAt: "desc" }, take: 15 }),
    prisma.observation.findMany({ where: { studentId: id }, include: { observer: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={student.name} subtitle={`Class ${enr.section.classLevel}-${enr.section.section} · Roll no. ${student.rollNo ?? "—"}`} action={<Link href={`/teacher/class/${enr.sectionId}`} className={btn.secondary}>Back to class</Link>} />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Level" value={summary.level} sub={summary.rank} />
        <Stat label="Total XP" value={summary.xp} />
        <Stat label="Streak" value={`${summary.streak} days`} />
        <Stat label="Badges" value={summary.badges.length} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Skill mastery">
          <ul className="space-y-4">
            {skills.map((s) => (
              <li key={s}>
                <div className="mb-1 flex items-center justify-between"><span className="text-sm font-medium">{skillName(s)}</span><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${MASTERY_TONE[mastery[s].level]}`}>{MASTERY_LABEL[mastery[s].level]}</span></div>
                <Progress value={mastery[s].score ?? 0} label={skillName(s)} />
                <div className="mt-1 text-xs text-muted">{mastery[s].count} answers{mastery[s].score !== null ? ` · ${mastery[s].score}% weighted accuracy` : ""}</div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Recent work">
          {attempts.length ? (
            <ul className="divide-y divide-line text-sm">
              {attempts.map((a) => (
                <li key={a.id} className="flex justify-between gap-3 py-2">
                  <span>{a.assessment.kind === "PRACTICE" ? `Practice · ${a.assessment.title}` : a.assessment.title}<span className="block text-xs text-muted">{a.submittedAt!.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></span>
                  <span className="font-semibold tabular-nums">{a.score}/{a.maxScore}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>No work submitted yet.</Empty>}
        </Card>
      </div>
      <Card title="Teacher observation journal">
        <form action={addObservation.bind(null, id)} className="mb-5 grid gap-3 rounded-xl bg-surface-2 p-4 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end">
          <label className="text-xs text-muted">Skill<br />
            <select name="skill" className="mt-1 w-full rounded-lg border border-line bg-surface px-2 py-2 text-sm">{[...CORE_CT_SKILLS, ...skills.filter((s) => !CORE_CT_SKILLS.includes(s))].map((s) => <option key={s} value={s}>{skillName(s)}</option>)}</select>
          </label>
          <label className="text-xs text-muted">Rating<br />
            <select name="rating" defaultValue={3} className="mt-1 w-full rounded-lg border border-line bg-surface px-2 py-2 text-sm">{[1, 2, 3, 4].map((r) => <option key={r} value={r}>{r} — {RATING[r]}</option>)}</select>
          </label>
          <label className="text-xs text-muted">Note<br />
            <input name="note" maxLength={500} placeholder="What did you observe?" className="mt-1 w-full rounded-lg border border-line bg-surface px-2 py-2 text-sm" />
          </label>
          <button className={btn.primary}>Add</button>
        </form>
        {observations.length ? (
          <ul className="divide-y divide-line text-sm">
            {observations.map((o) => (
              <li key={o.id} className="py-2.5">
                <div className="flex flex-wrap items-center gap-2"><strong>{skillName(o.skill)}</strong><span className="text-muted">· {o.rating} — {RATING[o.rating]}</span><span className="ml-auto text-xs text-muted">{o.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {o.observer.name}</span></div>
                {o.note && <p className="mt-0.5 text-ink-2">{o.note}</p>}
              </li>
            ))}
          </ul>
        ) : <Empty>No observations yet.</Empty>}
      </Card>
    </div>
  );
}
