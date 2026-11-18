"use client";
import { useActionState, useState, useTransition } from "react";
import { previewBulkEdit, applyBulk, type BulkState, type BulkKind } from "@/app/actions/bulkEdit";
import { btn } from "@/components/ui";

export function BulkEditWizard({ kind }: { kind: BulkKind }) {
  const [checked, check, checking] = useActionState(previewBulkEdit.bind(null, kind), undefined);
  const who = kind === "staff" ? ["person", "people"] : ["student", "students"];
  const [applied, setApplied] = useState<BulkState>(undefined);
  const [saving, start] = useTransition();
  const p = applied?.preview ?? checked?.preview;
  const table = checked?.table;
  if (applied?.done !== undefined) {
    return (
      <div className="rounded-2xl bg-good-soft p-4 text-sm" role="status">
        <p className="font-semibold text-good">✓ Saved changes for {applied.done} {applied.done === 1 ? who[0] : who[1]}.</p>
        <p className="mt-1">The changes are in the activity log. <a href={`/admin/bulk-edit${kind === "staff" ? "?kind=staff" : ""}`} className="font-semibold text-brand">Upload another file</a></p>
      </div>
    );
  }
  const changedRows = p?.rows.filter((r) => r.changes.length || r.errors.length) ?? [];
  return (
    <div className="space-y-4">
      <form action={(fd) => { setApplied(undefined); check(fd); }} className="flex flex-wrap items-end gap-3">
        <label className="block text-sm font-medium">Upload the edited file (.xlsx or .csv)
          <input type="file" name="file" required accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="mt-1 block text-sm" />
        </label>
        <button className={btn.secondary} disabled={checking}>{checking ? "Checking…" : "Check changes"}</button>
      </form>
      {checked?.error && <p className="text-sm text-bad" role="alert">{checked.error}</p>}
      {p && (
        <div className="rounded-2xl border border-line p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <strong>{p.rows.length}</strong> rows · <span className="text-brand">{p.changed} to change</span> · {p.unchanged} unchanged ·{" "}
              {p.withErrors ? <span className="font-semibold text-bad">{p.withErrors} with errors</span> : <span className="text-good">no errors</span>}
              <div className="mt-1 text-xs text-muted">Columns read: {p.columns.join(", ") || "none"}{p.ignored.length ? ` · ignored: ${p.ignored.join(", ")}` : ""}. Columns left out of the file are not changed.</div>
            </div>
            <button className={btn.primary} disabled={!!p.withErrors || !p.changed || saving || !table} onClick={() => start(async () => setApplied(await applyBulk(kind, table!)))}>
              {saving ? "Saving…" : p.changed ? `Save changes for ${p.changed} ${p.changed === 1 ? who[0] : who[1]}` : "Nothing to change"}
            </button>
          </div>
          {applied?.error && <p className="mb-2 text-sm text-bad" role="alert">{applied.error}</p>}
          {p.withErrors > 0 && <p className="mb-2 text-sm text-bad">Fix the rows marked in red in your file and upload it again. Nothing has been saved.</p>}
          {changedRows.length > 0 ? (
            <div className="max-h-[28rem] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-surface"><tr className="text-left text-xs text-muted"><th className="py-1 pr-2">Row</th><th className="pr-2">{kind === "staff" ? "Person" : "Student"}</th><th>Changes / problems</th></tr></thead>
                <tbody>
                  {changedRows.map((r) => (
                    <tr key={r.line} className={`border-t border-line align-top ${r.errors.length ? "bg-bad-soft" : ""}`}>
                      <td className="py-1.5 pr-2 tabular-nums">{r.line}</td>
                      <td className="pr-2"><div className="font-medium">{r.name}</div><div className="font-mono text-xs text-muted">{r.username}</div></td>
                      <td className="py-1.5">
                        {r.errors.map((e) => <div key={e} className="text-bad">✗ {e}</div>)}
                        {r.changes.map((c) => <div key={c.label}><span className="text-muted">{c.label}:</span> <span className="line-through decoration-muted/60">{c.from || "—"}</span> → <strong>{c.to || "(cleared)"}</strong></div>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm text-muted">No changes found in this file.</p>}
        </div>
      )}
    </div>
  );
}
