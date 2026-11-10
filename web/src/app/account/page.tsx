import Link from "next/link";
import { requireUser, homeFor } from "@/lib/auth";
import { PasswordForm } from "./PasswordForm";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ first?: string }> }) {
  const user = await requireUser();
  const { first } = await searchParams;
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">{first ? "Choose your own password" : "Change password"}</h1>
      <p className="mt-1 text-sm text-muted">{user.name} · {user.username}</p>
      {first && <p className="mt-4 rounded-xl bg-warn-soft p-3 text-sm text-warn">You signed in with a temporary password. Please set a new one to continue.</p>}
      <PasswordForm />
      {!first && <Link href={homeFor(user.role)} className="mt-4 inline-block text-sm text-brand">← Back</Link>}
    </main>
  );
}
