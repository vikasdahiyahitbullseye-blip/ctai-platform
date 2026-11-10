"use client";
import { useActionState } from "react";
import { submitMilestone, saveReflection } from "@/app/actions/projects";

const input = "mt-1 w-full rounded-2xl border-2 border-line bg-surface px-3 py-2 outline-none focus:border-brand";
const button = "rounded-2xl bg-brand px-5 py-2.5 font-bold text-white shadow-[0_4px_0_var(--brand-ink)] transition active:translate-y-0.5 active:shadow-none disabled:opacity-50";

export function MilestoneForm({ teamId, milestoneId, text, link, resubmit }: { teamId: string; milestoneId: string; text: string; link: string; resubmit: boolean }) {
  const [state, action, pending] = useActionState(submitMilestone.bind(null, teamId, milestoneId), undefined);
  if (state?.ok) return <div className="mt-3 rounded-2xl bg-good-soft p-3 text-sm font-semibold text-good">🎉 Sent to your teacher!</div>;
  return (
    <details className="mt-4 rounded-2xl border-2 border-dashed border-brand/40 p-3" open={!resubmit}>
      <summary className="cursor-pointer font-bold text-brand">{resubmit ? "✏️ Update your work" : "📤 Hand in this step"}</summary>
      <form action={action} className="mt-3 space-y-3">
        <label className="block text-sm font-semibold">What did your team do?<textarea name="text" rows={4} defaultValue={text} className={input} placeholder="Describe your work, your data or your answer…" /></label>
        <label className="block text-sm font-semibold">Link (optional)<input name="link" defaultValue={link} placeholder="https://…" className={input} /></label>
        <label className="block text-sm font-semibold">Photo or file (optional)<input type="file" name="file" accept="image/*,.pdf,.docx,.pptx,.xlsx" className="mt-1 block text-sm" /></label>
        {state?.error && <p className="text-sm font-semibold text-bad">{state.error}</p>}
        <button className={button} disabled={pending}>{pending ? "Sending…" : "Send to teacher"}</button>
      </form>
    </details>
  );
}

export function ReflectionForm({ teamId, init }: { teamId: string; init: { learned: string; challenge: string; nextTime: string } | null }) {
  const [state, action, pending] = useActionState(saveReflection.bind(null, teamId), undefined);
  return (
    <form action={action} className="mt-4 grid gap-3 md:grid-cols-3">
      <label className="text-sm font-semibold">📘 What did I learn?<textarea name="learned" rows={3} defaultValue={init?.learned} className={input} /></label>
      <label className="text-sm font-semibold">🧗 What was hard?<textarea name="challenge" rows={3} defaultValue={init?.challenge} className={input} /></label>
      <label className="text-sm font-semibold">🔁 What would I do differently?<textarea name="nextTime" rows={3} defaultValue={init?.nextTime} className={input} /></label>
      <div className="md:col-span-3">
        {state?.error && <p className="mb-2 text-sm text-bad">{state.error}</p>}
        {state?.ok && <p className="mb-2 text-sm font-semibold text-good">Saved ✓</p>}
        <button className={button} disabled={pending}>Save my reflection</button>
      </div>
    </form>
  );
}
