"use client";
import { useActionState } from "react";
import Link from "next/link";
import { changePassword } from "../actions/auth";
import { btn } from "@/components/ui";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  if (state?.ok) return <div className="mt-6 rounded-xl bg-good-soft p-4 text-good">Password changed. <Link href={state.home!} className="font-semibold underline">Continue</Link></div>;
  const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2";
  return (
    <form action={action} className="mt-6 space-y-4 rounded-2xl border border-line bg-surface p-6">
      <label className="block text-sm font-medium">Current password<input name="current" type="password" required className={input} autoComplete="current-password" /></label>
      <label className="block text-sm font-medium">New password<input name="next" type="password" required minLength={6} className={input} autoComplete="new-password" /></label>
      <label className="block text-sm font-medium">Confirm new password<input name="confirm" type="password" required className={input} autoComplete="new-password" /></label>
      {state?.error && <p className="text-sm text-bad" role="alert">{state.error}</p>}
      <button className={`${btn.primary} w-full`} disabled={pending}>Save password</button>
    </form>
  );
}
