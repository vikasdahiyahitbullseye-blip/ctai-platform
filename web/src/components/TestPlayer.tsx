"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import type { ClientQuestion } from "@/lib/questions";
import type { AnswerValue } from "@/lib/scoring";
import { QuestionInput, hasAnswer, finalAnswer } from "./QuestionInput";
import { btn } from "./ui";
import { saveTestAnswer, finishAttempt } from "@/app/actions/student";

export function TestPlayer({ attemptId, title, questions, saved, deadline, big }: { attemptId: string; title: string; questions: ClientQuestion[]; saved: Record<string, AnswerValue>; deadline: number | null; big: boolean }) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(saved);
  const [idx, setIdx] = useState(0);
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"saved" | "saving" | "error">("saved");
  const [confirm, setConfirm] = useState(false);
  const [left, setLeft] = useState<number | null>(deadline ? Math.max(0, deadline - Date.now()) : null);
  const [pending, start] = useTransition();
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const q = questions[idx];

  // Answers typed but not yet sent to the server (saving is delayed slightly while the student types).
  const unsent = useRef<Record<string, () => Promise<unknown>>>({});
  const inflight = useRef(new Set<Promise<unknown>>());
  const saveNow = async (id: string) => {
    const job = unsent.current[id];
    if (!job) return;
    delete unsent.current[id];
    clearTimeout(timers.current[id]);
    const sending = job();
    inflight.current.add(sending);
    try {
      await sending;
      if (!Object.keys(unsent.current).length) setStatus("saved");
    } catch {
      setStatus("error");
      throw new Error("Not saved");
    } finally {
      inflight.current.delete(sending);
    }
  };
  /** Sends every answer still waiting, so nothing is lost when the test is submitted. */
  const flush = async () => {
    await Promise.all(Object.keys(unsent.current).map(saveNow));
    await Promise.all([...inflight.current]);
  };
  const submit = () => start(async () => { await flush(); await finishAttempt(attemptId); });

  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => {
      const ms = Math.max(0, deadline - Date.now());
      setLeft(ms);
      if (ms === 0) {
        clearInterval(t);
        start(async () => { await flush().catch(() => {}); await finishAttempt(attemptId); });
      }
    }, 1000);
    return () => clearInterval(t);
    // flush only reads refs, so the first render's copy is always current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline, attemptId]);

  const update = (v: AnswerValue) => {
    setAnswers((a) => ({ ...a, [q.id]: v }));
    setStatus("saving");
    const question = q;
    unsent.current[q.id] = () => saveTestAnswer(attemptId, question.id, v === null ? null : finalAnswer(question, v));
    clearTimeout(timers.current[q.id]);
    timers.current[q.id] = setTimeout(() => { saveNow(question.id).catch(() => {}); }, 600);
  };

  const answeredCount = questions.filter((x) => hasAnswer(x, answers[x.id])).length;
  const unanswered = questions.map((x, i) => (hasAnswer(x, answers[x.id]) ? 0 : i + 1)).filter(Boolean);
  const current = hasAnswer(q, answers[q.id]);
  const mm = left !== null ? Math.floor(left / 60000) : 0;
  const ss = left !== null ? Math.floor((left % 60000) / 1000) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between text-sm text-muted">
          <span className="font-semibold text-ink">Question {idx + 1} of {questions.length}</span>
          <span>{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
        </div>
        <QuestionInput q={q} value={answers[q.id] ?? null} onChange={update} big={big} />
        {current && q.type !== "ORDER" && (
          <button type="button" className="mt-3 text-sm font-semibold text-muted underline-offset-2 hover:text-ink hover:underline" onClick={() => update(null)}>✕ Clear my answer</button>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button className={btn.secondary} onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>← Previous</button>
          <button className={btn.ghost} onClick={() => setFlags((f) => { const n = new Set(f); if (n.has(q.id)) n.delete(q.id); else n.add(q.id); return n; })}>
            {flags.has(q.id) ? "🚩 Flagged" : "Flag for review"}
          </button>
          {idx < questions.length - 1 ? (
            <button className={current ? btn.primary : btn.secondary} onClick={() => setIdx((i) => i + 1)}>{current ? "Next →" : "Skip for now →"}</button>
          ) : (
            <button className={btn.primary} onClick={() => setConfirm(true)}>Finish test</button>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="text-sm font-semibold">{title}</div>
          {left !== null && <div className={`mt-2 text-3xl font-bold tabular-nums ${left < 120000 ? "text-bad" : ""}`} aria-live="polite">{String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}</div>}
          <div className="mt-1 text-xs text-muted">{answeredCount}/{questions.length} answered · {status === "saving" ? "Saving…" : status === "error" ? "⚠ Not saved — check connection" : "All changes saved"}</div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold">Questions</div>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((x, i) => {
              const done = hasAnswer(x, answers[x.id]);
              return (
                <button key={x.id} onClick={() => setIdx(i)} aria-label={`Question ${i + 1}${done ? ", answered" : ""}${flags.has(x.id) ? ", flagged" : ""}`}
                  className={`relative h-9 rounded-lg text-sm font-semibold ${i === idx ? "ring-2 ring-brand" : ""} ${done ? "bg-brand text-white" : "bg-surface-2"}`}>
                  {i + 1}
                  {flags.has(x.id) && <span className="absolute -right-1 -top-1 text-xs" aria-hidden>🚩</span>}
                </button>
              );
            })}
          </div>
          <button className={`${btn.primary} mt-4 w-full`} onClick={() => setConfirm(true)}>Submit test</button>
        </div>
      </aside>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
            <h2 id="confirm-title" className="text-lg font-bold">Submit your test?</h2>
            <p className="mt-2 text-sm text-ink-2">You answered {answeredCount} of {questions.length} questions. You can&apos;t change answers after submitting.</p>
            {unanswered.length > 0 && (
              <div className="mt-3 text-sm">
                <div className="font-semibold">Not answered yet:</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {unanswered.map((n) => (
                    <button key={n} type="button" className="h-8 min-w-8 rounded-lg bg-warn-soft px-2 font-semibold text-warn" onClick={() => { setIdx(n - 1); setConfirm(false); }} aria-label={`Go to question ${n}`}>{n}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button className={btn.secondary} onClick={() => setConfirm(false)}>Keep working</button>
              <button className={btn.primary} onClick={submit} disabled={pending}>{pending ? "Submitting…" : "Submit"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
