"use client";
import { useActionState } from "react";
import { login } from "../actions/auth";
import { btn } from "@/components/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <label className="block">
        <span className="text-sm font-medium">Username</span>
        <input name="username" autoComplete="username" required className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 outline-none focus:border-brand" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 outline-none focus:border-brand" />
      </label>
      {state?.error && <p className="text-sm text-bad" role="alert">{state.error}</p>}
      <button className={`${btn.primary} w-full`} disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
