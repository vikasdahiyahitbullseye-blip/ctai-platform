import Link from "next/link";
import { logout } from "@/app/actions/auth";

export function AppShell({ user, nav, children }: { user: { name: string; role: string; school: { name: string } }; nav: { href: string; label: string }[]; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white" aria-hidden>◎</span>
            <span>CT &amp; AI</span>
          </Link>
          <nav className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <div className="hidden text-right sm:block">
              <div className="font-medium leading-tight">{user.name}</div>
              <div className="text-xs text-muted">{user.school.name}</div>
            </div>
            <form action={logout}>
              <button className="rounded-lg px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-2">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
