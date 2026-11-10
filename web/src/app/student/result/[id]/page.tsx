import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatAnswer } from "@/lib/scoring";
import { BADGES } from "@/lib/gamification";
import { Markdown } from "@/components/Markdown";
import { Card, PageHeader, Pill, btn } from "@/components/ui";

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
      assessment: { include: { items: { include: { question: true }, orderBy: { position: "asc" } }, assignments: true } },
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-gradient-to-br from-brand to-[#6a4bff] p-6 text-white sm:col-span-1">
          <div className="text-sm opacity-80">Your score</div>
          <div className="text-4xl font-bold tabular-nums">{attempt.score}/{attempt.maxScore}</div>
          <div className="mt-1 text-sm opacity-90">{pct}% · {correctCount} of {rows.length} correct</div>
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
                    {r?.correct ? <Pill tone="good">✓ Correct</Pill> : r?.answer ? <Pill tone="bad">✗ Incorrect</Pill> : <Pill>Not answered</Pill>}
                    <span className="ml-auto text-xs text-muted">{r?.marks ?? 0}/{marks}</span>
                  </div>
                  <Markdown text={q.stem} />
                  {opts.length > 0 && q.type !== "ORDER" && (
                    <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                      {opts.map((o, k) => <li key={k}>({String.fromCharCode(97 + k)}) {o}</li>)}
                    </ul>
                  )}
                  <div className="mt-3 grid gap-1 text-sm">
                    <div>Your answer: <strong>{describe(q.type, opts, r?.answer ?? null)}</strong></div>
                    {!r?.correct && <div>Correct answer: <strong className="text-good">{formatAnswer(q.type, opts, JSON.parse(q.answer))}</strong></div>}
                  </div>
                  <details className="mt-3 text-sm" open={!r?.correct}>
                    <summary className="cursor-pointer font-medium text-brand">Solution</summary>
                    <div className="mt-2 text-ink-2"><Markdown text={q.solution} /></div>
                  </details>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
}
