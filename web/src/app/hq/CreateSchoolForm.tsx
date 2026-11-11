"use client";
import { useActionState } from "react";
import { createSchool } from "@/app/actions/hq";
import { Credentials } from "@/components/Credentials";
import { btn } from "@/components/ui";

export function CreateSchoolForm() {
  const [state, action, pending] = useActionState(createSchool, undefined);
  const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  return (
    <form action={action}>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_2fr_auto] sm:items-end">
        <label className="text-sm font-medium">School name<input name="name" required className={input} /></label>
        <label className="text-sm font-medium">City<input name="city" required className={input} /></label>
        <label className="text-sm font-medium">Code<input name="code" required placeholder="ABC-PUNE" className={`${input} uppercase`} /></label>
        <label className="text-sm font-medium">School admin&apos;s name<input name="adminName" required className={input} /></label>
        <button className={btn.primary} disabled={pending}>Create school</button>
      </div>
      <p className="mt-2 text-xs text-muted">Creates the school and a school admin login. The admin then adds classes, teachers and students.</p>
      {state?.error && <p className="mt-2 text-sm text-bad">{state.error}</p>}
      {state?.credentials && <Credentials items={state.credentials} groupLabel="School" />}
    </form>
  );
}
