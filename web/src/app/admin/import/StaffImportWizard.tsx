"use client";
import { useActionState, useState, useTransition } from "react";
import { previewStaffImport, commitStaffImport, type StaffImportState } from "@/app/actions/staffImport";
import { Credentials } from "@/components/Credentials";
import { btn } from "@/components/ui";

const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";

export function StaffImportWizard({ schoolName }: { schoolName: string }) {
  const [preview, action, pending] = useActionState(previewStaffImport, undefined);
  const [result, setResult] = useState<StaffImportState>(undefined);
  const [committing, start] = useTransition();
  const shown = result?.rows ? result : preview;
  const rows = shown?.rows ?? [];
  const bad = rows.filter((r) => r.errors.length).length;
  const warn = rows.filter((r) => r.warnings.length).length;
  const admins = rows.filter((r) => r.role === "admin").length;
  if (result?.credentials) return (
    <div>
      <Credentials items={result.credentials} schoolName={schoolName} groupLabel="Role" />
      <p className="mt-3 text-sm text-ink-2">Everyone must choose their own password the first time they sign in. <a href="/admin/teachers" className="font-semibold text-brand">Go to Teachers &amp; staff</a></p>
    </div>
  );
  return (
    <div className="space-y-4">
      <form action={(fd) => { setResult(undefined); action(fd); }} className="space-y-3">
        <label className="block text-sm font-medium">Upload an Excel (.xlsx) or CSV file
          <input type="file" name="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="mt-1 block text-sm" />
        </label>
        <label className="block text-sm font-medium">…or paste rows here
          <textarea name="csv" rows={5} className={`${input} font-mono`} placeholder={"name,role,designation,email,phone,teaches\nAnjali Mehra,teacher,TGT,anjali@school.in,,6-A CT; 6-A AI"} />
        </label>
        <button className={btn.secondary} disabled={pending}>{pending ? "Checking…" : "Check file"}</button>
      </form>
      {(result?.error ?? preview?.error) && <p className="text-sm text-bad" role="alert">{result?.error ?? preview?.error}</p>}
      {rows.length > 0 && (
        <div className="rounded-2xl border border-line p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm" data-testid="staff-import-summary">
              <strong>{rows.length}</strong> {rows.length === 1 ? "person" : "people"} ({rows.length - admins} teacher{rows.length - admins === 1 ? "" : "s"}, {admins} admin{admins === 1 ? "" : "s"}) · {bad ? <span className="text-bad">{bad} with errors</span> : <span className="text-good">no errors</span>}
              {warn > 0 && <> · <span className="text-warn">{warn} to double-check</span></>}
            </div>
            <button className={btn.primary} disabled={!!bad || committing} onClick={() => start(async () => setResult(await commitStaffImport(shown!.table!)))}>
              {committing ? "Creating accounts…" : `Create ${rows.length} staff account${rows.length === 1 ? "" : "s"}`}
            </button>
          </div>
          {bad > 0 && <p className="mb-2 text-sm text-ink-2">Fix the rows marked in red in your file, then upload it again. No accounts are created until every row is correct.</p>}
          {shown?.ignored && shown.ignored.length > 0 && <p className="mb-2 text-xs text-muted">Columns not used: {shown.ignored.join(", ")}</p>}
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm [&_td]:pr-3 [&_th]:pr-3">
              <thead><tr className="text-left text-xs text-muted"><th className="py-1">Line</th><th>Name</th><th>Role</th><th>Designation</th><th>Email / phone</th><th>Teaches</th><th>Check</th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.line} className={`border-t border-line align-top ${r.errors.length ? "bg-bad-soft" : r.warnings.length ? "bg-warn-soft" : ""}`}>
                  <td className="py-1">{r.line}</td><td className="font-medium">{r.name}</td><td>{r.role}</td><td>{r.designation}</td>
                  <td className="text-xs">{[r.email, r.phone].filter(Boolean).join(" · ")}</td><td className="text-xs">{r.teaches || "—"}</td>
                  <td className="text-xs">{r.errors.length ? r.errors.join("; ") : r.warnings.length ? `⚠ ${r.warnings.join("; ")}` : "✓"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
