"use client";
import { useRef, useState, useTransition } from "react";
import type { ClientQuestion } from "@/lib/questions";
import type { AnswerValue } from "@/lib/scoring";
import { QuestionInput, hasAnswer, finalAnswer } from "./QuestionInput";
import { Markdown } from "./Markdown";
import { saveTestAnswer, finishAttempt } from "@/app/actions/student";
import { saveTaskText, uploadTaskFile } from "@/app/actions/homework";

type Task = { id: string; title: string; prompt: string; responseType: string; marks: number; text: string; file: { id: string; name: string; isImage: boolean } | null };

export function AssignmentPlayer({ attemptId, questions, saved, tasks, big }: { attemptId: string; questions: ClientQuestion[]; saved: Record<string, AnswerValue>; tasks: Task[]; big: boolean }) {
  const [answers, setAnswers] = useState(saved);
  const [taskState, setTaskState] = useState(tasks);
  const [status, setStatus] = useState("All changes saved");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const unsent = useRef<Record<string, () => Promise<unknown>>>({});
  const inflight = useRef(new Set<Promise<unknown>>());
  const saveNow = async (key: string) => {
    const job = unsent.current[key];
    if (!job) return;
    delete unsent.current[key];
    clearTimeout(timers.current[key]);
    const sending = job();
    inflight.current.add(sending);
    try {
      await sending;
      if (!Object.keys(unsent.current).length) setStatus("All changes saved");
    } catch {
      setStatus("⚠ Not saved — check your connection");
      throw new Error("Not saved");
    } finally {
      inflight.current.delete(sending);
    }
  };
  const debounce = (key: string, fn: () => Promise<unknown>) => {
    setStatus("Saving…");
    unsent.current[key] = fn;
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => { saveNow(key).catch(() => {}); }, 700);
  };
  /** Sends every answer still waiting before handing in. */
  const flush = async () => {
    await Promise.all(Object.keys(unsent.current).map(saveNow));
    await Promise.all([...inflight.current]);
  };

  const setAnswer = (q: ClientQuestion, v: AnswerValue) => {
    setAnswers((a) => ({ ...a, [q.id]: v }));
    debounce(q.id, () => saveTestAnswer(attemptId, q.id, v === null ? null : finalAnswer(q, v)));
  };

  const answered = questions.filter((q) => hasAnswer(q, answers[q.id])).length;
  const tasksDone = taskState.filter((t) => t.text.trim() || t.file).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="sticky top-16 z-10 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-surface/95 px-4 py-2 text-sm shadow-sm backdrop-blur">
        <span>{questions.length > 0 && <>✏️ {answered}/{questions.length} questions · </>}{tasks.length > 0 && <>🛠️ {tasksDone}/{tasks.length} activities</>}</span>
        <span className="text-muted">{status}</span>
      </div>
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-3xl border-2 border-line bg-surface p-6">
          <div className="mb-3 text-sm font-bold text-muted">Question {i + 1} · {q.marks} mark{q.marks > 1 ? "s" : ""}</div>
          <QuestionInput q={q} value={answers[q.id] ?? null} big={big} onChange={(v) => setAnswer(q, v)} />
          {hasAnswer(q, answers[q.id]) && q.type !== "ORDER" && (
            <button type="button" className="mt-3 text-sm font-semibold text-muted underline-offset-2 hover:text-ink hover:underline" onClick={() => setAnswer(q, null)}>✕ Clear my answer</button>
          )}
        </div>
      ))}
      {taskState.map((t, i) => (
        <div key={t.id} className="rounded-3xl border-2 border-accent/60 bg-accent-soft p-6">
          <div className="text-sm font-bold text-accent">🛠️ Activity {i + 1} · {t.marks} marks · marked by your teacher</div>
          <h3 className="mt-1 text-xl font-extrabold">{t.title}</h3>
          <div className="mt-2"><Markdown text={t.prompt} /></div>
          {t.responseType !== "FILE" && (
            <label className="mt-4 block text-sm font-semibold">Your answer
              <textarea rows={5} value={t.text} onChange={(e) => { const text = e.target.value; setTaskState((s) => s.map((x) => (x.id === t.id ? { ...x, text } : x))); debounce(`t${t.id}`, () => saveTaskText(attemptId, t.id, text)); }} className="mt-1 w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 outline-none focus:border-brand" />
            </label>
          )}
          {t.responseType !== "TEXT" && (
            <form className="mt-3 flex flex-wrap items-center gap-2" action={(fd) => start(async () => {
              setError(null);
              const r = await uploadTaskFile(attemptId, t.id, fd);
              if (r.error) setError(r.error);
              else if (r.file) setTaskState((s) => s.map((x) => (x.id === t.id ? { ...x, file: r.file! } : x)));
            })}>
              <input type="file" name="file" accept="image/*,.pdf,.docx" className="text-sm" />
              <button className="rounded-xl bg-surface px-3 py-1.5 text-sm font-semibold shadow-sm" disabled={pending}>📷 Upload photo/file</button>
              {t.file && <span className="text-sm text-good">✓ {t.file.name}</span>}
            </form>
          )}
        </div>
      ))}
      {error && <p className="text-sm font-semibold text-bad">{error}</p>}
      <div className="flex justify-end">
        <button className="rounded-2xl bg-brand px-6 py-3 text-lg font-bold text-white shadow-[0_5px_0_var(--brand-ink)] active:translate-y-0.5 active:shadow-none disabled:opacity-50" disabled={pending} onClick={() => { const left = questions.length - answered + tasks.length - tasksDone; if (confirm(`Hand in your homework?${left > 0 ? ` ${left} question${left > 1 ? "s are" : " is"} still blank — you can hand in anyway.` : ""} You can't change it afterwards.`)) start(async () => { await flush(); await finishAttempt(attemptId); }); }}>
          📬 Hand in homework
        </button>
      </div>
    </div>
  );
}
