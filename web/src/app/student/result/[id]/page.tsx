import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatAnswer } from "@/lib/scoring";
import { BADGES } from "@/lib/gamification";
import { Markdown } from "@/components/Markdown";
import { StemFigure, OptionList } from "@/components/QuestionFigures";
import { Card, PageHeader, Pill, btn } from "@/components/ui";
import { Confetti, Mascot } from "@/components/kid";

function describe(type: string, options: string[], raw: string | null) {
  if (raw === null) return "—";
  const v = JSON.parse(raw);
  if (v === null || v === "") return "—";
  return formatAnswer(type, options, v);
}

export default async function ResultPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ badges?: string }> }) {
  const { id } = await params;
  const { badges } = await searchParams;
  const user = await requireUser("STUDENT");
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: {
      responses: { include: { question: true }, orderBy: { createdAt: "asc" } },
      taskResponses: { include: { file: true } },
      assessment: { include: { items: { include: { question: true }, orderBy: { position: "asc" } }, assignments: true, tasks: { orderBy: { position: "asc" } } } },
    },
  });
  if (!attempt || attempt.userId !== user.id || !attempt.submittedAt) notFound();

  const a = attempt.assessment;
  const isFixed = a.kind === "TEST" || a.kind === "ASSIGNMENT" || a.kind === "PUZZLE";
  const rows = isFixed
    ? a.items.map((it) => ({ q: it.question, r: attempt.responses.find((r) => r.questionId === it.questionId), marks: it.marks }))
    : attempt.responses.map((r) => ({ q: r.question, r, marks: r.question.marks }));
  const assignment = a.assignments[0];
  const hideAnswers = assignment?.showAnswers === "AFTER_DUE" && assignment.dueAt && assignment.dueAt > new Date();
  const pct = attempt.maxScore ? Math.round(((attempt.score ?? 0) / attempt.maxScore) * 100) : 0;
  const newBadges = (badges ?? "").split(",").filter((b) => BADGES[b]);
  const correctCount = rows.filter((x) => x.r?.correct).length;

  return (
    <div className="space-y-6">
      <PageHeader title={a.kind === "PRACTICE" ? `Practice result: ${a.title}` : a.title} action={<Link href="/student" className={btn.secondary}>Back to home</Link>} />

      <Confetti fire={newBadges.length > 0 || pct >= 85 ? 1 : 0} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="relative rounded-[2rem] bg-gradient-to-br from-brand to-[#ff5e8a] p-6 text-white sm:col-span-1">
          <div className="absolute right-3 top-3"><Mascot size={56} mood={pct >= 65 ? "cheer" : "think"} /></div>
          <div className="text-sm opacity-80">Your score</div>
          <div className="text-4xl font-bold tabular-nums">{attempt.score}/{attempt.maxScore}</div>
          <div className="mt-1 text-sm opacity-90">{pct}% · {correctCount} of {rows.length} correct</div>
          {attempt.needsMarking && <div className="mt-2 rounded-xl bg-white/20 px-3 py-1.5 text-sm">⏳ Some answers are waiting for your teacher to mark</div>}
          <div className="mt-3 text-lg">{pct >= 85 ? "Outstanding! 🌟" : pct >= 65 ? "Great work! 👍" : pct >= 40 ? "Good effort — keep practising 💪" : "Keep going — every try builds your brain 🧠"}</div>
        </div>
        {newBadges.length > 0 && (
          <div className="rounded-3xl border-2 border-accent bg-accent-soft p-6 sm:col-span-2">
            <div className="font-bold">New badge{newBadges.length > 1 ? "s" : ""} unlocked!</div>
            <div className="mt-3 flex flex-wrap gap-3">
              {newBadges.map((b) => (
                <div key={b} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
                  <span className="text-3xl" aria-hidden>{BADGES[b].icon}</span>
                  <div><div className="font-semibold">{BADGES[b].name}</div><div className="text-xs text-muted">{BADGES[b].description}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Card title="Review your answers">
        {hideAnswers ? (
          <p className="text-sm text-muted">Your teacher will release the answers after the due date ({assignment!.dueAt!.toLocaleDateString("en-IN")}).</p>
        ) : (
          <ol className="space-y-5">
            {rows.map(({ q, r, marks }, i) => {
              const opts = JSON.parse(q.options) as string[];
              return (
                <li key={q.id} className="rounded-2xl border border-line p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-semibold">Q{i + 1}.</span>
                    {q.type === "SHORT" && r?.answer && !r.markedAt ? <Pill tone="warn">⏳ Waiting for teacher</Pill> : r?.correct ? <Pill tone="good">✓ Correct</Pill> : r?.answer ? <Pill tone="bad">✗ Incorrect</Pill> : <Pill>Not answered</Pill>}
                    <span className="ml-auto text-xs text-muted">{r?.marks ?? 0}/{marks}</span>
                  </div>
                  <Markdown text={q.stem} />
                  <StemFigure json={q.figure} />
                  {q.type !== "ORDER" && <OptionList options={opts} figuresJson={q.optionFigures} />}
                  <div className="mt-3 grid gap-1 text-sm">
                    <div>Your answer: <strong>{describe(q.type, opts, r?.answer ?? null)}</strong></div>
                    {q.type === "SHORT" ? (r?.markedAt ? <div>Model answer: <span className="text-ink-2">{formatAnswer(q.type, opts, JSON.parse(q.answer))}</span></div> : null) : !r?.correct && <div>Correct answer: <strong className="text-good">{formatAnswer(q.type, opts, JSON.parse(q.answer))}</strong></div>}
                    {r?.feedback && <div>💬 Teacher: {r.feedback}</div>}
                  </div>
                  <details className="mt-3 text-sm" open={!r?.correct && (q.type !== "SHORT" || !!r?.markedAt)} hidden={q.type === "SHORT" && !r?.markedAt}>
                    <summary className="cursor-pointer font-medium text-brand">Solution</summary>
                    <div className="mt-2 text-ink-2"><Markdown text={q.solution} /></div>
                  </details>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      {a.tasks.length > 0 && (
        <Card title="🛠️ Activities">
          <ul className="space-y-4">
            {a.tasks.map((t) => {
              const tr = attempt.taskResponses.find((x) => x.taskId === t.id);
              return (
                <li key={t.id} className="rounded-2xl border border-line p-4 text-sm">
                  <div className="flex items-center justify-between gap-2"><strong>{t.title}</strong>{tr?.markedAt ? <Pill tone="good">{tr.marks}/{t.marks}</Pill> : tr ? <Pill tone="warn">⏳ Waiting for teacher</Pill> : <Pill>Not done</Pill>}</div>
                  {tr?.text && <p className="mt-2 whitespace-pre-wrap rounded-xl bg-surface-2 p-3">{tr.text}</p>}
                  {tr?.file && <p className="mt-2">📎 <a className="text-brand underline" href={`/api/files/${tr.file.id}`} target="_blank">{tr.file.filename}</a></p>}
                  {tr?.feedback && <p className="mt-2">💬 Teacher: {tr.feedback}</p>}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
