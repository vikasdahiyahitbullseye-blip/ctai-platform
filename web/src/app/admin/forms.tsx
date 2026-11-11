"use client";
import { useActionState, useState, useTransition } from "react";
import { addSection, addTeacher, addStudent, resetPassword, previewImport, commitImport, type ImportRow } from "@/app/actions/admin";
import { Credentials } from "@/components/Credentials";
import { btn } from "@/components/ui";

const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";

export function AddSectionForm() {
  const [state, action, pending] = useActionState(addSection, undefined);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <label className="text-sm font-medium">Class<select name="classLevel" className={input}>{[3, 4, 5, 6, 7, 8].map((c) => <option key={c}>{c}</option>)}</select></label>
      <label className="text-sm font-medium">Section<input name="section" placeholder="A" maxLength={3} required className={`${input} w-24 uppercase`} /></label>
      <button className={btn.primary} disabled={pending}>Add class</button>
      {state?.error && <p className="w-full text-sm text-bad">{state.error}</p>}
      {state?.ok && <p className="w-full text-sm text-good">Class added.</p>}
    </form>
  );
}

export function AddTeacherForm({ schoolName }: { schoolName: string }) {
  const [state, action, pending] = useActionState(addTeacher, undefined);
  return (
    <form action={action}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex-1 text-sm font-medium">Full name<input name="name" required placeholder="e.g. Ms. Priya Nair" className={input} /></label>
        <label className="text-sm font-medium">Role<select name="role" className={input}><option value="TEACHER">Teacher</option><option value="ADMIN">School admin</option></select></label>
        <button className={btn.primary} disabled={pending}>Create account</button>
      </div>
      {state?.error && <p className="mt-2 text-sm text-bad">{state.error}</p>}
      {state?.credentials && <Credentials items={state.credentials} schoolName={schoolName} />}
    </form>
  );
}

export function AddStudentForm({ sections, schoolName }: { sections: { id: string; label: string }[]; schoolName: string }) {
  const [state, action, pending] = useActionState(addStudent, undefined);
  return (
    <form action={action}>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
        <label className="text-sm font-medium">Student name<input name="name" required className={input} /></label>
        <label className="text-sm font-medium">Class<select name="sectionId" className={input}>{sections.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
        <label className="text-sm font-medium">Roll no.<input name="rollNo" className={input} /></label>
        <button className={btn.primary} disabled={pending}>Add</button>
      </div>
      {state?.error && <p className="mt-2 text-sm text-bad">{state.error}</p>}
      {state?.credentials && <Credentials items={state.credentials} schoolName={schoolName} />}
    </form>
  );
}

export function ResetPasswordButton({ userId, schoolName }: { userId: string; schoolName: string }) {
  const [res, setRes] = useState<{ name: string; username: string; password: string }[] | null>(null);
  const [pending, start] = useTransition();
  return (
    <span>
      <button type="button" className="text-xs font-medium text-brand" disabled={pending} onClick={() => start(async () => { const r = await resetPassword(userId); setRes(r.credentials ?? null); })}>Reset password</button>
      {res && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setRes(null)}><div className="w-full max-w-lg rounded-2xl bg-surface p-4" onClick={(e) => e.stopPropagation()}><Credentials items={res} schoolName={schoolName} /><button className={`${btn.secondary} mt-3`} onClick={() => setRes(null)}>Close</button></div></div>}
    </span>
  );
}

export function ImportWizard({ schoolName }: { schoolName: string }) {
  const [preview, action, pending] = useActionState(previewImport, undefined);
  const [result, setResult] = useState<Awaited<ReturnType<typeof commitImport>> | null>(null);
  const [committing, start] = useTransition();
  const rows: ImportRow[] = preview?.rows ?? [];
  const bad = rows.filter((r) => r.errors.length).length;
  if (result?.credentials) return <Credentials items={result.credentials} schoolName={schoolName} />;
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-3">
        <label className="block text-sm font-medium">Upload a CSV file (save your Excel sheet as CSV)
          <input type="file" name="file" accept=".csv,text/csv" className="mt-1 block text-sm" />
        </label>
        <label className="block text-sm font-medium">…or paste rows here
          <textarea name="csv" rows={6} className={`${input} font-mono`} placeholder={"name,class,section,roll\nAarav Gupta,3,A,15\nIsha Rao,6,A,17"} />
        </label>
        <button className={btn.secondary} disabled={pending}>{pending ? "Checking…" : "Check file"}</button>
      </form>
      {preview?.error && <p className="text-sm text-bad">{preview.error}</p>}
      {rows.length > 0 && (
        <div className="rounded-2xl border border-line p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm"><strong>{rows.length}</strong> rows · {bad ? <span className="text-bad">{bad} with errors</span> : <span className="text-good">no errors</span>}</div>
            <button className={btn.primary} disabled={!!bad || committing} onClick={() => start(async () => setResult(await commitImport(preview!.csv!)))}>{committing ? "Creating accounts…" : `Create ${rows.length} student accounts`}</button>
          </div>
          {result?.error && <p className="mb-2 text-sm text-bad">{result.error}</p>}
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="py-1">Line</th><th>Name</th><th>Class</th><th>Roll</th><th>Check</th></tr></thead>
              <tbody>{rows.map((r) => <tr key={r.line} className={`border-t border-line ${r.errors.length ? "bg-bad-soft" : ""}`}><td className="py-1">{r.line}</td><td>{r.name}</td><td>{r.className}</td><td>{r.rollNo}</td><td className="text-xs">{r.errors.length ? r.errors.join("; ") : "✓"}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
