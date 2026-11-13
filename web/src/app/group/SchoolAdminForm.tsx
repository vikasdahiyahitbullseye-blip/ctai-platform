"use client";
import { useActionState } from "react";
import { createSchoolAdmin } from "@/app/actions/group";
import { Credentials } from "@/components/Credentials";
import { btn } from "@/components/ui";

export function SchoolAdminForm({ schools }: { schools: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(createSchoolAdmin, undefined);
  const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  return (
    <form action={action}>
      <div className="grid gap-3 sm:grid-cols-[2fr_2fr_auto] sm:items-end">
        <label className="text-sm font-medium">School<select name="schoolId" required className={input}>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label className="text-sm font-medium">Principal / admin&apos;s name<input name="name" required className={input} /></label>
        <button className={btn.primary} disabled={pending}>Create login</button>
      </div>
      {state?.error && <p className="mt-2 text-sm text-bad">{state.error}</p>}
      {state?.credentials && <Credentials items={state.credentials} groupLabel="School" />}
    </form>
  );
}
