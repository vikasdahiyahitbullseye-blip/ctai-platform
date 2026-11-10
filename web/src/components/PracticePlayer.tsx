"use client";
import { useState, useTransition } from "react";
import type { ClientQuestion } from "@/lib/questions";
import type { AnswerValue } from "@/lib/scoring";
import { QuestionInput, hasAnswer, finalAnswer } from "./QuestionInput";
import { Markdown } from "./Markdown";
import { btn, Progress } from "./ui";
import { Confetti, Mascot } from "./kid";
import { answerInstant, nextQuestion, finishAttempt } from "@/app/actions/student";
import { DIFFICULTY } from "@/lib/constants";

type Feedback = { correct: boolean; solution: string; correctText: string; xp: number };

export function PracticePlayer({ attemptId, initial, answered, total, mode, big }: { attemptId: string; initial: ClientQuestion | null; answered: number; total: number; mode: "PRACTICE" | "PUZZLE"; big: boolean }) {
  const [q, setQ] = useState(initial);
  const [count, setCount] = useState(answered);
  const [value, setValue] = useState<AnswerValue>(null);
  const [hint, setHint] = useState(false);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [xp, setXp] = useState(0);
  const [party, setParty] = useState(0);
  const [pending, start] = useTransition();

  const check = () =>
    start(async () => {
      if (!q) return;
      const r = await answerInstant(attemptId, q.id, finalAnswer(q, value), hint);
      setFb(r);
      if (r.correct) setParty((n) => n + 1);
      setXp((x) => x + r.xp);
      setCount((c) => c + 1);
    });

  const next = () =>
    start(async () => {
      if (mode === "PUZZLE" || count >= total) return finishAttempt(attemptId);
      const n = await nextQuestion(attemptId);
      if (!n) return finishAttempt(attemptId);
      setQ(n);
      setValue(null);
      setHint(false);
      setFb(null);
    });

  if (!q) {
    return (
      <div className="text-center">
        <p className="mb-4">No more questions in this set.</p>
        <button className={btn.primary} onClick={() => start(() => finishAttempt(attemptId))}>See results</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Confetti fire={party} pieces={40} />
      {mode === "PRACTICE" && (
        <div className="mb-4 flex items-center gap-4">
          <Progress value={count} max={total} label="Set progress" />
          <span className="whitespace-nowrap text-sm font-medium tabular-nums">{Math.min(count + (fb ? 0 : 1), total)} / {total}</span>
          <span className="whitespace-nowrap rounded-full bg-accent px-3 py-1 text-sm font-extrabold tabular-nums text-white">+{xp} XP</span>
        </div>
      )}
      <div className="rounded-[2rem] border-2 border-line bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-muted">
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5">{DIFFICULTY[q.difficulty as 1 | 2 | 3]}</span>
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
            <button className="kbtn" onClick={check} disabled={!hasAnswer(q, value) && q.type !== "ORDER" || pending}>{pending ? "Checking…" : "Check answer"}</button>
          ) : (
            <button className="kbtn kbtn-accent" onClick={next} disabled={pending}>{mode === "PUZZLE" || count >= total ? "Finish" : "Next question →"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
