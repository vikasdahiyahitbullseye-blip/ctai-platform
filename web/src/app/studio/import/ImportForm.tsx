"use client";
import { useActionState } from "react";
import { importQuestions } from "@/app/actions/studio";
import { btn } from "@/components/ui";

export function ImportForm() {
  const [state, action, pending] = useActionState(importQuestions, undefined);
  const ok = state?.results?.filter((r) => r.ok).length ?? 0;
  return (
    <form action={action} className="space-y-3">
      <input type="file" name="file" accept=".csv,text/csv" className="block text-sm" />
      <textarea name="csv" rows={5} placeholder="…or paste CSV here" className="w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-sm" />
      <button className={btn.primary} disabled={pending}>{pending ? "Importing…" : "Import as drafts"}</button>
      {state?.error && <p className="text-sm text-bad">{state.error}</p>}
      {state?.results && (
        <div className="rounded-xl border border-line p-3 text-sm">
          <p className="mb-2"><strong className="text-good">{ok} imported</strong> · <strong className="text-bad">{state.results.length - ok} rejected</strong></p>
          <ul className="max-h-64 space-y-1 overflow-auto">{state.results.map((r) => <li key={r.line} className={r.ok ? "text-good" : "text-bad"}>Line {r.line}: {r.message}</li>)}</ul>
        </div>
      )}
    </form>
  );
}
