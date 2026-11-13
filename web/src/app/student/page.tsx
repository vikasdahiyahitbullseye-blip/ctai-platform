import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSummary, masteryFor, skillName } from "@/lib/progress";
import { studentSection, puzzleOfTheDay, assignedWork } from "@/lib/student";
import { missionProgress, challengeProgress, myWeek } from "@/lib/missions";
import { adventure } from "@/lib/adventure";
import { dashboardSkills } from "@/lib/constants";
import { parseAvatar } from "@/lib/avatar";
import { Markdown } from "@/components/Markdown";
import { Mascot, SpeechBubble, AvatarBadge } from "@/components/kid";
import { Empty } from "@/components/ui";
import { startPuzzle, startPractice, startAssigned } from "@/app/actions/student";
import { claimMissionAction, claimChallenge } from "@/app/actions/gamify";
import { board, boardsFor, parsePeriod, parseScope } from "@/lib/leaderboard";
import { BoardList, BoardTabs } from "@/components/Leaderboard";

const GREETINGS = ["Ready for today's brain workout?", "Every puzzle makes your brain stronger!", "Let's find some patterns today!", "Mistakes help us learn — have a go!"];

export default async function StudentHome({ searchParams }: { searchParams: Promise<{ board?: string; period?: string }> }) {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  if (!section) return <Empty>You are not in a class yet. Please ask your teacher.</Empty>;
  const [summary, puzzle, work, missions, challenges, week, adv] = await Promise.all([
    studentSummary(prisma, user.id),
    puzzleOfTheDay(section.classLevel),
    assignedWork(user.id, section.id),
    missionProgress(prisma, user.id),
    prisma.classChallenge.findMany({ where: { sectionId: section.id, endsAt: { gte: new Date() } }, orderBy: { endsAt: "asc" }, take: 1 }),
    myWeek(prisma, user.id),
    adventure(prisma, user.id, section.classLevel),
  ]);
  const skills = dashboardSkills(section.classLevel);
  const mastery = (await masteryFor(prisma, [user.id], skills))[user.id];
  const weakest = skills.map((s) => ({ s, m: mastery[s] })).sort((a, b) => (a.m.score ?? 50) - (b.m.score ?? 50))[0];
  const puzzleAttempt = puzzle && (await prisma.attempt.findFirst({ where: { userId: user.id, assessmentId: puzzle.assessment.id }, include: { responses: true } }));
  const due = work.filter((w) => w.status === "DUE" || w.status === "IN_PROGRESS");
  const ch = challenges[0];
  const chProgress = ch ? await challengeProgress(prisma, ch) : 0;
  const chClaimed = ch ? !!(await prisma.missionClaim.findUnique({ where: { userId_mission_weekKey: { userId: user.id, mission: `CH_${ch.id}`, weekKey: "challenge" } } })) : false;
  const avatar = parseAvatar(user.avatar);
  const sp = await searchParams;
  const boards = (await boardsFor(user.id, section)).list;
  let scope = parseScope(sp.board);
  if (!boards.some((b) => b.scope === scope)) scope = boards[0]?.scope ?? "section";
  const period = parsePeriod(sp.period);
  const rows = boards.length ? await board(user.id, section, scope, period) : null;
  const myRow = rows?.find((r) => r.userId === user.id);
  const greeting = GREETINGS[new Date().getDate() % GREETINGS.length];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#6c4dff] via-[#8b5cf6] to-[#ff5e8a] p-6 text-white shadow-lg">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" aria-hidden />
        <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10" aria-hidden />
        <div className="relative flex flex-wrap items-center gap-5">
          <AvatarBadge avatar={avatar} size={88} />
          <div className="min-w-48 flex-1">
            <p className="text-sm font-bold opacity-90">Class {section.classLevel}-{section.section}</p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Hi {user.name.split(" ")[0]}!</h1>
            <p className="font-bold opacity-95">Level {summary.level} {summary.rank}</p>
            <div className="mt-3 max-w-md">
              <div className="mb-1 flex justify-between text-xs font-bold"><span>⭐ {summary.xp} XP</span><span>{summary.toNext} XP to Level {summary.level + 1}</span></div>
              <div className="h-4 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-gradient-to-r from-[#ffd43b] to-[#ff8a1f]" style={{ width: `${(summary.intoLevel / summary.levelSpan) * 100}%` }} /></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl bg-white/20 px-4 py-3 text-center"><div className="text-3xl font-extrabold">🔥 {summary.streak}</div><div className="text-xs font-bold">day streak</div></div>
            <div className="rounded-2xl bg-white/20 px-4 py-3 text-center"><div className="text-3xl font-extrabold">🏅 {summary.badges.length}</div><div className="text-xs font-bold">badges</div></div>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-3"><Mascot size={64} /><SpeechBubble>{greeting} {due.length ? `You have ${due.length} thing${due.length > 1 ? "s" : ""} to do.` : "Nothing due — try the Puzzle of the Day!"}</SpeechBubble></div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        {/* Puzzle */}
        <section className="rounded-[2rem] border-2 border-line bg-surface p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold">🧩 Puzzle of the Day</h2>
          {puzzle ? (
            <>
              <div className="mt-3 rounded-2xl bg-surface-2 p-4 text-lg"><Markdown text={puzzle.question.stem} /></div>
              <div className="mt-4">
                {puzzleAttempt?.submittedAt ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-4 py-2 font-extrabold ${puzzleAttempt.responses[0]?.correct ? "bg-good-soft text-good" : "bg-warn-soft text-warn"}`}>{puzzleAttempt.responses[0]?.correct ? "Solved! +25 XP 🎉" : "Nice try! See how to solve it"}</span>
                    <Link className="kbtn kbtn-ghost" href={`/student/result/${puzzleAttempt.id}`}>See solution</Link>
                  </div>
                ) : <form action={startPuzzle}><button className="kbtn kbtn-accent text-lg">Solve it! +25 XP</button></form>}
              </div>
            </>
          ) : <p className="mt-2 text-muted">No puzzle today.</p>}
        </section>

        {/* Missions */}
        <section className="rounded-[2rem] border-2 border-line bg-surface p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold">🎯 This week&apos;s missions</h2>
          <ul className="mt-3 space-y-3">
            {missions.missions.map((m) => (
              <li key={m.code} className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>{m.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm font-bold"><span>{m.title}</span><span className="tabular-nums text-muted">{m.progress}/{m.target}</span></div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-surface-2"><div className={`h-full rounded-full ${m.done ? "bg-good" : "bg-brand"}`} style={{ width: `${(m.progress / m.target) * 100}%` }} /></div>
                </div>
                {m.claimed ? <span className="text-xs font-extrabold text-good">✓ +{m.xp}</span> : m.done ? <form action={claimMissionAction.bind(null, m.code)}><button className="kbtn kbtn-accent px-3 py-1.5 text-xs">Claim +{m.xp}</button></form> : <span className="text-xs font-bold text-muted">+{m.xp}</span>}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Leaderboard */}
      <section id="leaderboard" className="scroll-mt-4 rounded-[2rem] border-2 border-line bg-surface p-6 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-extrabold">🏆 Leaderboard</h2>
          <span className="flex items-center gap-3">
            {myRow && <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-extrabold text-brand">You are #{myRow.rank} of {rows!.length}</span>}
            <Link href="/student/leaderboard" className="text-sm font-bold text-brand">Groups &amp; full board →</Link>
          </span>
        </div>
        {boards.length ? (
          <>
            <BoardTabs base="/student" boards={boards} scope={scope} period={period} />
            <div className="mt-3">{rows ? <BoardList rows={rows} me={user.id} top={5} /> : null}</div>
          </>
        ) : (
          <p className="font-semibold text-ink-2">Class leaderboards are off for your class. <Link className="text-brand underline" href="/student/leaderboard">Make a group with friends</Link> to compare XP!</p>
        )}
      </section>

      <Link href="/student/games" className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border-2 border-line bg-gradient-to-r from-[#fff4d6] to-[#ffe3ef] p-5 shadow-sm dark:from-[#3a2c10] dark:to-[#3a1626]">
        <span><span className="text-2xl font-extrabold">🧩 Logic games</span><span className="block text-sm font-bold text-ink-2">Sudoku · Tower of Hanoi · Lights Out · Sliding tiles · Code breaker — levels for Class {section.classLevel}</span></span>
        <span className="kbtn kbtn-accent">Play →</span>
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Due work */}
        <section className="rounded-[2rem] border-2 border-line bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="text-2xl font-extrabold">📝 To do</h2><Link href="/student/tests" className="text-sm font-bold text-brand">See all</Link></div>
          {due.length ? (
            <ul className="mt-3 space-y-3">
              {due.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 p-3">
                  <div>
                    <div className="font-extrabold">{w.kind === "ASSIGNMENT" ? "📝" : "🧪"} {w.title}</div>
                    <div className="text-xs font-semibold text-muted">{w.kind === "ASSIGNMENT" ? "Homework" : "Test"} · {w.marks} marks{w.dueAt ? ` · due ${w.dueAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}</div>
                  </div>
                  <form action={startAssigned.bind(null, w.id)}><button className="kbtn px-4 py-2 text-sm">{w.status === "IN_PROGRESS" ? "Continue" : "Start"}</button></form>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 font-semibold text-muted">All done! 🎉</p>}
        </section>

        {/* Adventure */}
        <section className="rounded-[2rem] border-2 border-line bg-gradient-to-br from-[#dff7ee] to-[#e6f0ff] p-6 shadow-sm dark:from-[#10302a] dark:to-[#121c3d]">
          <div className="flex items-center justify-between"><h2 className="text-2xl font-extrabold">🗺️ My adventure</h2><span className="font-extrabold">⭐ {adv.totalStars}/{adv.maxStars}</span></div>
          {adv.next ? (
            <div className="mt-3">
              <p className="text-sm font-semibold text-ink-2">Next island:</p>
              <p className="text-xl font-extrabold">{adv.next.part === "AI" ? "🤖 " : "🏝️ "}{adv.next.title}</p>
              <p className="text-sm text-muted">{"⭐".repeat(adv.next.stars)}{"☆".repeat(3 - adv.next.stars)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={startPractice}><input type="hidden" name="chapterId" value={adv.next.id} /><button className="kbtn">Play this island</button></form>
                <Link href="/student/map" className="kbtn kbtn-ghost">Open map</Link>
              </div>
            </div>
          ) : <p className="mt-3 font-semibold">You have collected every star! 🌟</p>}
          <p className="mt-4 text-sm font-semibold text-ink-2">Focus skill: <strong>{skillName(weakest.s)}</strong></p>
          <form action={startPractice} className="mt-2"><input type="hidden" name="skill" value={weakest.s} /><button className="text-sm font-extrabold text-brand underline">Practise {skillName(weakest.s)} →</button></form>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {ch && (
          <section className="rounded-[2rem] border-2 border-accent bg-accent-soft p-6 shadow-sm">
            <h2 className="text-xl font-extrabold">🏁 Class challenge</h2>
            <p className="mt-1 font-bold">{ch.title}</p>
            <div className="mt-3 h-5 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-gradient-to-r from-accent to-[#ff4d8d]" style={{ width: `${Math.min(100, (chProgress / ch.target) * 100)}%` }} /></div>
            <div className="mt-1 flex justify-between text-sm font-bold"><span>{chProgress} / {ch.target}</span><span>ends {ch.endsAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></div>
            {chProgress >= ch.target && (chClaimed ? <p className="mt-2 font-extrabold text-good">✓ Reward collected!</p> : <form action={claimChallenge.bind(null, ch.id)} className="mt-3"><button className="kbtn kbtn-accent">Goal reached! Claim +{ch.rewardXp} XP</button></form>)}
          </section>
        )}
        <section className="rounded-[2rem] border-2 border-line bg-surface p-6 shadow-sm">
          <h2 className="text-xl font-extrabold">📈 My week</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-brand-soft p-3"><div className="text-2xl font-extrabold tabular-nums">⭐ {week.xp}</div><div className="text-xs font-bold text-muted">XP this week</div></div>
            <div className="rounded-2xl bg-accent-soft p-3"><div className="text-2xl font-extrabold tabular-nums">{week.answered}</div><div className="text-xs font-bold text-muted">questions answered</div></div>
            <div className="rounded-2xl bg-good-soft p-3"><div className="text-2xl font-extrabold tabular-nums">{week.accuracy === null ? "–" : `${week.accuracy}%`}</div><div className="text-xs font-bold text-muted">answers right</div></div>
          </div>
          <p className="mt-3 text-sm font-bold text-ink-2">{week.xp > week.xpLast ? `🚀 That is ${week.xp - week.xpLast} XP more than last week. Great work!` : week.xpLast > 0 ? `Last week you earned ${week.xpLast} XP. Can you beat it?` : "Every question you try earns XP. Have a go!"}</p>
        </section>
      </div>
    </div>
  );
}
