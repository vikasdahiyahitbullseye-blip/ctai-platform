"use client";
import { useActionState } from "react";
import { createStaff } from "@/app/actions/hq";
import { Credentials } from "@/components/Credentials";
import { btn } from "@/components/ui";

export function CreateStaffForm() {
  const [state, action, pending] = useActionState(createStaff, undefined);
  const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  return (
    <form action={action}>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <label className="text-sm font-medium">Full name<input name="name" required className={input} /></label>
        <label className="text-sm font-medium">Role
          <select name="role" defaultValue="REVIEWER" className={input}>
            <option value="REVIEWER">Question reviewer (approves questions)</option>
            <option value="CONTENT">Content team (writes and edits questions)</option>
          </select>
        </label>
        <button className={btn.primary} disabled={pending}>Create login</button>
      </div>
      <p className="mt-2 text-xs text-muted">A temporary password is shown once. The person must change it when they first sign in.</p>
      {state?.error && <p className="mt-2 text-sm text-bad">{state.error}</p>}
      {state?.credentials && <Credentials items={state.credentials} schoolName="Hitbullseye" groupLabel="Role" />}
    </form>
  );
}
