"use client";
import { useActionState } from "react";
import { saveMarks } from "@/app/actions/homework";
import { Markdown } from "@/components/Markdown";
import { btn } from "@/components/ui";

type Short = { id: string; stem: string; answer: string; model: string; max: number; marks: number | null; feedback: string };
type Task = { id: string; title: string; prompt: string; text: string; file: { id: string; name: string; isImage: boolean } | null; max: number; marks: number | null; feedback: string };

export function MarkingForm({ attemptId, shortAnswers, tasks }: { attemptId: string; shortAnswers: Short[]; tasks: Task[] }) {
  const [state, action, pending] = useActionState(saveMarks.bind(null, attemptId), undefined);
  const input = "rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  const markBox = (name: string, max: number, val: number | null) => (
    <label className="flex items-center gap-2 text-sm font-semibold">Marks
      <input type="number" name={name} min={0} max={max} step={0.5} defaultValue={val ?? ""} required className={`${input} w-20`} /> / {max}
    </label>
  );
  return (
    <form action={action} className="space-y-4">
      {shortAnswers.map((s) => (
        <div key={s.id} className="rounded-2xl border border-line bg-surface p-5">
          <Markdown text={s.stem} />
          <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm"><div className="text-xs font-semibold text-muted">Student&apos;s answer</div><p className="whitespace-pre-wrap">{s.answer || "—"}</p></div>
          <p className="mt-2 text-xs text-muted">Model answer: {s.model}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">{markBox(`r_${s.id}`, s.max, s.marks)}<input name={`rf_${s.id}`} defaultValue={s.feedback} placeholder="Feedback (optional)" className={`${input} flex-1`} /></div>
        </div>
      ))}
      {tasks.map((t) => (
        <div key={t.id} className="rounded-2xl border-2 border-accent/50 bg-surface p-5">
          <div className="font-bold">🛠️ {t.title}</div>
          <div className="text-sm text-ink-2"><Markdown text={t.prompt} /></div>
          {t.text && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-surface-2 p-3 text-sm">{t.text}</p>}
          {t.file && (t.file.isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/files/${t.file.id}`} alt={`Student upload: ${t.file.name}`} className="mt-3 max-h-80 rounded-xl" />
          ) : <p className="mt-2 text-sm">📎 <a href={`/api/files/${t.file.id}`} target="_blank" className="text-brand underline">{t.file.name}</a></p>)}
          <div className="mt-3 flex flex-wrap items-center gap-3">{markBox(`t_${t.id}`, t.max, t.marks)}<input name={`tf_${t.id}`} defaultValue={t.feedback} placeholder="Feedback for the student" className={`${input} flex-1`} /></div>
        </div>
      ))}
      {shortAnswers.length + tasks.length === 0 && <p className="text-sm text-muted">Nothing to mark by hand.</p>}
      {state?.ok && <p className="text-sm font-semibold text-good">Saved. New score: {state.score}{state.needsMarking ? " (some items still unmarked)" : " — fully marked ✓"}</p>}
      {shortAnswers.length + tasks.length > 0 && <button className={btn.primary} disabled={pending}>Save marks</button>}
    </form>
  );
}
