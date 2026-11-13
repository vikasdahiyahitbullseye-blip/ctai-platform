"use client";
import { useState, useTransition } from "react";
import type { ClientQuestion } from "@/lib/questions";
import type { AnswerValue } from "@/lib/scoring";
import { QuestionInput, hasAnswer, finalAnswer } from "./QuestionInput";
import { Markdown } from "./Markdown";
import { btn, Progress } from "./ui";
import { Confetti, Mascot } from "./kid";
import { answerInstant, skipInstant, nextQuestion, skippedQuestion, finishAttempt } from "@/app/actions/student";
import { DIFFICULTY } from "@/lib/constants";

type Feedback = { correct: boolean; solution: string; correctText: string; xp: number };

/**
 * Instant-feedback player for practice rounds and Puzzle of the Day.
 * In practice a student can skip a question and come back to it any time before the round ends
 * (the skipped tray), and the round asks about skipped questions before finishing.
 */
export function PracticePlayer({ attemptId, initial, answered, total, mode, big, skippedIds = [] }: { attemptId: string; initial: ClientQuestion | null; answered: number; total: number; mode: "PRACTICE" | "PUZZLE"; big: boolean; skippedIds?: string[] }) {
  const [q, setQ] = useState(initial);
  const [count, setCount] = useState(answered);
  const [value, setValue] = useState<AnswerValue>(null);
  const [hint, setHint] = useState(false);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [xp, setXp] = useState(0);
  const [party, setParty] = useState(0);
  const [skipped, setSkipped] = useState<string[]>(skippedIds);
  const [revisiting, setRevisiting] = useState(false);
  const [pending, start] = useTransition();
  const finish = () => finishAttempt(attemptId);

  const show = (n: ClientQuestion | null, back = false) => {
    setQ(n);
    setValue(null);
    setHint(false);
    setFb(null);
    setRevisiting(back);
  };

  const check = () =>
    start(async () => {
      if (!q) return;
      const r = await answerInstant(attemptId, q.id, finalAnswer(q, value), hint);
      setFb(r);
      if (r.correct) setParty((n) => n + 1);
      setXp((x) => x + r.xp);
      if (revisiting) setSkipped((s) => s.filter((id) => id !== q.id));
      else setCount((c) => c + 1);
    });

  /** Next new question; at the end of the round, stop at the skipped-questions screen if any are left. */
  const load = async (done: number, left: string[]) => {
    if (mode === "PUZZLE") return finish();
    if (done < total) {
      const n = await nextQuestion(attemptId);
      if (n) return show(n);
    }
    if (left.length) return show(null);
    return finish();
  };
  const next = () => start(() => load(count, skipped));

  const skip = () =>
    start(async () => {
      if (!q) return;
      if (revisiting) return load(count, skipped); // leave it skipped
      await skipInstant(attemptId, q.id);
      const left = [...skipped, q.id];
      setSkipped(left);
      setCount((c) => c + 1);
      await load(count + 1, left);
    });

  const goBack = (id: string) =>
    start(async () => {
      const n = await skippedQuestion(attemptId, id);
      if (n) show(n, true);
      else setSkipped((s) => s.filter((x) => x !== id));
    });

  const stop = () => {
    const done = count - skipped.length;
    if (confirm(`End this round now? You answered ${done} of ${total} questions${skipped.length ? ` and skipped ${skipped.length}` : ""}. Questions you did not reach are not counted.`)) start(finish);
  };

  const tray = mode === "PRACTICE" && skipped.length > 0 && (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl bg-surface-2 px-3 py-2 text-sm">
      <span className="font-bold">⏭ Skipped:</span>
      {skipped.map((id, i) => (
        <button key={id} type="button" onClick={() => goBack(id)} disabled={pending || (revisiting && q?.id === id)}
          className={`rounded-full px-3 py-1 text-xs font-bold ${revisiting && q?.id === id ? "bg-brand text-white" : "bg-surface text-brand hover:bg-brand-soft"}`}
          aria-label={`Go back to skipped question ${i + 1}`}>
          Go back to {i + 1}
        </button>
      ))}
    </div>
  );

  if (!q) {
    // End of the round with skipped questions still open, or nothing left to ask.
    return (
      <div className="mx-auto max-w-xl text-center">
        {skipped.length > 0 ? (
          <div className="rounded-[2rem] border-2 border-line bg-surface p-6 shadow-sm">
            <Mascot size={64} mood="think" />
            <h2 className="mt-2 text-2xl font-extrabold">You reached the end of the round!</h2>
            <p className="mt-2 text-ink-2">You skipped {skipped.length} question{skipped.length > 1 ? "s" : ""}. Have another go before you finish?</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {skipped.map((id, i) => <button key={id} className="kbtn px-4 py-2 text-sm" onClick={() => goBack(id)} disabled={pending}>Skipped question {i + 1}</button>)}
            </div>
            <button className={`${btn.secondary} mt-5`} onClick={() => start(finish)} disabled={pending}>Finish and see results</button>
          </div>
        ) : (
          <>
            <p className="mb-4">No more questions in this set.</p>
            <button className={btn.primary} onClick={() => start(finish)}>See results</button>
          </>
        )}
      </div>
    );
  }

  const roundOver = count >= total;
  return (
    <div className="mx-auto max-w-3xl">
      <Confetti fire={party} pieces={40} />
      {mode === "PRACTICE" && (
        <div className="mb-4 flex items-center gap-4">
          <Progress value={count} max={total} label="Set progress" />
          <span className="whitespace-nowrap text-sm font-medium tabular-nums">{revisiting ? "Skipped question" : `${Math.min(count + (fb ? 0 : 1), total)} / ${total}`}</span>
          <span className="whitespace-nowrap rounded-full bg-accent px-3 py-1 text-sm font-extrabold tabular-nums text-white">+{xp} XP</span>
        </div>
      )}
      {mode === "PRACTICE" && (
        <div className="-mt-2 mb-3 flex items-center justify-end text-xs text-muted">
          {count > 0 && <button type="button" className="font-semibold text-brand underline-offset-2 hover:underline disabled:opacity-50" onClick={stop} disabled={pending}>End round and see results</button>}
        </div>
      )}
      {tray}
      <div className="rounded-[2rem] border-2 border-line bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-muted">
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5">{DIFFICULTY[q.difficulty as 1 | 2 | 3]}</span>
          {revisiting && <span className="rounded-full bg-warn-soft px-2.5 py-0.5 text-warn">You skipped this one earlier</span>}
          {mode === "PUZZLE" && <span className="rounded-full bg-accent-soft px-2.5 py-0.5">Puzzle of the Day</span>}
        </div>
        <QuestionInput q={q} value={value} onChange={setValue} disabled={!!fb || pending} big={big} />

        {hint && q.hint && !fb && <div className="mt-4 rounded-xl bg-warn-soft p-3 text-sm text-warn">💡 {q.hint}</div>}

        {fb && (
          <div className={`pop-in mt-6 flex gap-3 rounded-3xl p-4 ${fb.correct ? "bg-good-soft" : "bg-warn-soft"}`} role="status">
            <Mascot size={56} mood={fb.correct ? "cheer" : "think"} />
            <div className="flex-1">
            <div className={`text-xl font-extrabold ${fb.correct ? "text-good" : "text-warn"}`}>
              {fb.correct ? ["Brilliant! 🎉", "You got it! 🌟", "Super thinking! 🚀"][party % 3] : "Not quite — let's see why 💡"} {fb.xp > 0 && <span className="text-sm font-semibold">+{fb.xp} XP</span>}
            </div>
            {!fb.correct && <div className="mt-1 text-sm">Correct answer: <strong>{fb.correctText}</strong></div>}
            <div className="mt-3 text-sm text-ink-2"><div className="mb-1 font-semibold text-ink">How to think about it</div><Markdown text={fb.solution} /></div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {!fb && q.hint && mode === "PRACTICE" ? (
            <button type="button" className={btn.ghost} onClick={() => setHint(true)} disabled={hint}>💡 {hint ? "Hint shown (+5 XP if correct)" : "Show a hint"}</button>
          ) : <span />}
          {!fb ? (
            <span className="flex flex-wrap items-center gap-3">
            {mode === "PRACTICE" && <button type="button" className={btn.ghost} onClick={skip} disabled={pending}>{revisiting ? "Leave it skipped ⏭" : "Skip ⏭"}</button>}
            <button className="kbtn" onClick={check} disabled={!hasAnswer(q, value) && q.type !== "ORDER" || pending}>{pending ? "Checking…" : "Check answer"}</button>
            </span>
          ) : (
            <button className="kbtn kbtn-accent" onClick={next} disabled={pending}>{mode === "PUZZLE" || (roundOver && !skipped.length) ? "Finish" : roundOver ? "Continue →" : "Next question →"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
