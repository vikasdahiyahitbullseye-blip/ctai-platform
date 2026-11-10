import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSummary, masteryFor, skillName } from "@/lib/progress";
import { studentSection, puzzleOfTheDay, assignedWork } from "@/lib/student";
import { dashboardSkills } from "@/lib/constants";
import { MASTERY_LABEL } from "@/lib/mastery";
import { Card, Pill, btn, MASTERY_TONE, Empty } from "@/components/ui";
import { startPuzzle, startPractice, startAssigned } from "@/app/actions/student";
import { Markdown } from "@/components/Markdown";

export default async function StudentHome() {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  if (!section) return <Empty>You are not enrolled in a class yet. Please ask your teacher.</Empty>;
  const [summary, puzzle, work] = await Promise.all([studentSummary(prisma, user.id), puzzleOfTheDay(section.classLevel), assignedWork(user.id, section.id)]);
  const skills = dashboardSkills(section.classLevel);
  const mastery = (await masteryFor(prisma, [user.id], skills))[user.id];
  const puzzleAttempt = puzzle && (await prisma.attempt.findFirst({ where: { userId: user.id, assessmentId: puzzle.assessment.id }, include: { responses: true } }));
  const due = work.filter((w) => w.status === "DUE" || w.status === "IN_PROGRESS");
  const weakest = skills
    .map((s) => ({ s, m: mastery[s] }))
    .sort((a, b) => (a.m.score ?? 50) - (b.m.score ?? 50))[0];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-[#6a4bff] p-6 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm/6 opacity-80">Class {section.classLevel}-{section.section}</p>
            <h1 className="text-2xl font-bold">Hi {user.name.split(" ")[0]}! 👋</h1>
            <p className="mt-1 opacity-90">Level {summary.level} · {summary.rank}</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl bg-white/15 px-4 py-3 text-center">
              <div className="text-2xl font-bold tabular-nums">🔥 {summary.streak}</div>
              <div className="text-xs opacity-80">day streak</div>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 text-center">
              <div className="text-2xl font-bold tabular-nums">⭐ {summary.xp}</div>
              <div className="text-xs opacity-80">total XP</div>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 text-center">
              <div className="text-2xl font-bold tabular-nums">🏅 {summary.badges.length}</div>
              <div className="text-xs opacity-80">badges</div>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs opacity-90">
            <span>Level {summary.level}</span>
            <span>{summary.toNext} XP to level {summary.level + 1}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-accent" style={{ width: `${(summary.intoLevel / summary.levelSpan) * 100}%` }} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="🧩 Puzzle of the Day" className="lg:col-span-2">
          {puzzle ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-surface-2 p-4"><Markdown text={puzzle.question.stem} /></div>
              {puzzleAttempt?.submittedAt ? (
                <div className="flex flex-wrap items-center gap-3">
                  {puzzleAttempt.responses[0]?.correct ? <Pill tone="good">Solved today! +25 XP</Pill> : <Pill tone="warn">Attempted — see the solution</Pill>}
                  <Link className={btn.secondary} href={`/student/result/${puzzleAttempt.id}`}>See solution</Link>
                </div>
              ) : (
                <form action={startPuzzle}><button className={btn.primary}>Solve it (+25 XP)</button></form>
              )}
            </div>
          ) : <Empty>No puzzle today.</Empty>}
        </Card>

        <Card title="Quick practice">
          <p className="text-sm text-muted">Your next focus area:</p>
          <p className="mt-1 text-lg font-semibold">{skillName(weakest.s)}</p>
          <form action={startPractice} className="mt-4">
            <input type="hidden" name="skill" value={weakest.s} />
            <button className={`${btn.primary} w-full`}>Practise 8 questions</button>
          </form>
          <Link href="/student/practice" className={`${btn.ghost} mt-2 w-full`}>Choose a chapter</Link>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Due for you" action={<Link href="/student/tests" className="text-sm font-medium text-brand">All tests</Link>}>
          {due.length ? (
            <ul className="divide-y divide-line">
              {due.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-medium">{w.title}</div>
                    <div className="text-xs text-muted">{w.questions} questions · {w.marks} marks{w.dueAt ? ` · due ${w.dueAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}</div>
                  </div>
                  <form action={startAssigned.bind(null, w.id)}>
                    <button className={btn.primary}>{w.status === "IN_PROGRESS" ? "Continue" : "Start"}</button>
                  </form>
                </li>
              ))}
            </ul>
          ) : <Empty>Nothing due. Great job! 🎉</Empty>}
        </Card>

        <Card title="My thinking skills" action={<Link href="/student/progress" className="text-sm font-medium text-brand">Details</Link>}>
          <ul className="space-y-3">
            {skills.map((s) => (
              <li key={s} className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{skillName(s)}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${MASTERY_TONE[mastery[s].level]}`}>{MASTERY_LABEL[mastery[s].level]}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {summary.badges.length > 0 && (
        <Card title="Latest badges" action={<Link href="/student/rewards" className="text-sm font-medium text-brand">All rewards</Link>}>
          <div className="flex flex-wrap gap-3">
            {summary.badges.slice(0, 5).map((b) => (
              <div key={b.code} className="flex items-center gap-2 rounded-xl bg-accent-soft px-3 py-2">
                <span className="text-xl" aria-hidden>{b.icon}</span>
                <span className="text-sm font-semibold">{b.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
