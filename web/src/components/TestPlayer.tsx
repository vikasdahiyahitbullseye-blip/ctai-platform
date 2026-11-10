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

  const submit = () => start(() => finishAttempt(attemptId));

  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => {
      const ms = Math.max(0, deadline - Date.now());
      setLeft(ms);
      if (ms === 0) {
        clearInterval(t);
        start(() => finishAttempt(attemptId));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [deadline, attemptId]);

  const update = (v: AnswerValue) => {
    setAnswers((a) => ({ ...a, [q.id]: v }));
    setStatus("saving");
    clearTimeout(timers.current[q.id]);
    const question = q;
    timers.current[q.id] = setTimeout(async () => {
      try {
        await saveTestAnswer(attemptId, question.id, finalAnswer(question, v));
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, 600);
  };

  const answeredCount = questions.filter((x) => hasAnswer(x, answers[x.id])).length;
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
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button className={btn.secondary} onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>← Previous</button>
          <button className={btn.ghost} onClick={() => setFlags((f) => { const n = new Set(f); if (n.has(q.id)) n.delete(q.id); else n.add(q.id); return n; })}>
            {flags.has(q.id) ? "🚩 Flagged" : "Flag for review"}
          </button>
          {idx < questions.length - 1 ? (
            <button className={btn.primary} onClick={() => setIdx((i) => i + 1)}>Next →</button>
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
            <div className="mt-6 flex justify-end gap-2">
              <button className={btn.secondary} onClick={() => setConfirm(false)}>Keep working</button>
              <button className={btn.primary} onClick={submit} disabled={pending || status === "saving"}>{pending ? "Submitting…" : "Submit"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
