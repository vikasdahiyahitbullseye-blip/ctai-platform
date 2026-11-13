"use client";
import { useActionState, useState } from "react";
import { savePlan } from "@/app/actions/library";
import { btn } from "@/components/ui";

type Row = { id: string; part: string; number: number; title: string; periods: number };
const PART: Record<string, string> = { CT: "CT", AI: "AI" };

export function PlanEditor({ classLevel, rows, target }: { classLevel: number; rows: Row[]; target: number }) {
  const [state, action, pending] = useActionState(savePlan.bind(null, classLevel), undefined);
  const [values, setValues] = useState<Record<string, number>>(Object.fromEntries(rows.map((r) => [r.id, r.periods])));
  const total = Object.values(values).reduce((a, b) => a + (Number(b) || 0), 0);
  const diff = target - total;
  return (
    <form action={action} className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead><tr className="text-left text-xs text-muted"><th className="py-2">Part</th><th>Chapter</th><th className="w-28 text-right">Periods</th><th className="w-28 text-right">Time</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="py-1.5 text-xs font-semibold text-muted">{PART[r.part]}</td>
                <td>{r.number}. {r.title}</td>
                <td className="text-right"><input type="number" min={1} max={20} name={`p_${r.id}`} value={values[r.id]} onChange={(e) => setValues({ ...values, [r.id]: Number(e.target.value) })} aria-label={`Periods for ${r.title}`} className="w-20 rounded-lg border border-line bg-surface px-2 py-1 text-right tabular-nums" /></td>
                <td className="text-right tabular-nums text-muted">{Math.floor(((values[r.id] || 0) * 40) / 60)} h {((values[r.id] || 0) * 40) % 60 ? `${((values[r.id] || 0) * 40) % 60} min` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={`rounded-xl p-3 text-sm ${diff === 0 ? "bg-good-soft text-good" : "bg-warn-soft text-warn"}`} role="status">
        Chapter periods: <strong>{total}</strong> of {target}. {diff === 0 ? "Ready to rebuild." : diff > 0 ? `Add ${diff} more.` : `Remove ${-diff}.`}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className={btn.primary} disabled={pending || diff !== 0}>{pending ? "Rebuilding…" : "Save and rebuild plan"}</button>
        <span className="text-xs text-muted">Rebuilds this class&apos;s period plan, worksheets, assignments, tests and papers. Uploaded videos and teachers&apos; ticked periods are kept.</span>
      </div>
      {state?.error && <p className="text-sm text-bad">{state.error}</p>}
      {state?.ok && <p className="text-sm text-good">{state.message}</p>}
    </form>
  );
}
