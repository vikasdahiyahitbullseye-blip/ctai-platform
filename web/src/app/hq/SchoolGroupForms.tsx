"use client";
import { useActionState } from "react";
import { createSchoolGroup, addGroupAdmin } from "@/app/actions/hq";
import { Credentials } from "@/components/Credentials";
import { btn } from "@/components/ui";

const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";

export function CreateGroupForm() {
  const [state, action, pending] = useActionState(createSchoolGroup, undefined);
  return (
    <form action={action}>
      <div className="grid gap-3 sm:grid-cols-[2fr_2fr_auto] sm:items-end">
        <label className="text-sm font-medium">Group name<input name="name" required placeholder="e.g. Sunrise Group of Schools" className={input} /></label>
        <label className="text-sm font-medium">Group admin&apos;s name<input name="adminName" required className={input} /></label>
        <button className={btn.primary} disabled={pending}>Create group</button>
      </div>
      {state?.error && <p className="mt-2 text-sm text-bad">{state.error}</p>}
      {state?.credentials && <Credentials items={state.credentials} groupLabel="Group" />}
    </form>
  );
}

export function AddGroupAdminForm({ groups }: { groups: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(addGroupAdmin, undefined);
  return (
    <form action={action}>
      <div className="grid gap-3 sm:grid-cols-[2fr_2fr_auto] sm:items-end">
        <label className="text-sm font-medium">Group<select name="groupId" required className={input}>{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
        <label className="text-sm font-medium">Admin&apos;s name<input name="adminName" required className={input} /></label>
        <button className={btn.secondary} disabled={pending}>Add group admin</button>
      </div>
      {state?.error && <p className="mt-2 text-sm text-bad">{state.error}</p>}
      {state?.credentials && <Credentials items={state.credentials} groupLabel="Group" />}
    </form>
  );
}
