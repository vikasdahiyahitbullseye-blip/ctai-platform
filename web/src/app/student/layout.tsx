import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSummary } from "@/lib/progress";
import { parseAvatar } from "@/lib/avatar";
import { AvatarBadge } from "@/components/kid";
import { SideNav, BottomNav } from "@/components/StudentNav";
import { logout } from "@/app/actions/auth";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("STUDENT");
  const s = await studentSummary(prisma, user.id);
  const avatar = parseAvatar(user.avatar);
  return (
    <div className="kid">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@500;700;800&display=swap" />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-24 pt-4 lg:pb-8">
        <aside className="no-print sticky top-4 hidden h-[calc(100dvh-2rem)] w-60 shrink-0 flex-col rounded-3xl border-2 border-line bg-surface p-4 shadow-sm lg:flex">
          <Link href="/student" className="mb-4 flex shrink-0 items-center gap-2 px-2 font-display text-xl font-extrabold text-brand">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white" aria-hidden>◎</span> Think Quest
          </Link>
          {/* The menu scrolls on short screens so the profile and Sign out always stay visible. */}
          <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1"><SideNav /></div>
          <div className="mt-3 shrink-0 rounded-2xl bg-surface-2 p-3">
            <Link href="/student/me" className="flex items-center gap-3">
              <AvatarBadge avatar={avatar} size={44} ring={false} />
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold">{user.name.split(" ")[0]}</div>
                <div className="text-xs font-bold text-muted">Lv {s.level} · ⭐ {s.xp} · 🔥 {s.streak}</div>
              </div>
            </Link>
            <form action={logout} className="mt-2"><button className="w-full rounded-xl border-2 border-line bg-surface px-3 py-1.5 text-sm font-bold text-ink-2 hover:border-bad hover:text-bad">↪ Sign out</button></form>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="no-print mb-4 flex items-center justify-between rounded-2xl border-2 border-line bg-surface px-3 py-2 lg:hidden">
            <Link href="/student" className="font-display text-lg font-extrabold text-brand">◎ Think Quest</Link>
            <div className="flex items-center gap-3 text-sm font-extrabold">
              <span>⭐ {s.xp}</span><span>🔥 {s.streak}</span>
              <Link href="/student/me" aria-label="My profile"><AvatarBadge avatar={avatar} size={36} ring={false} /></Link>
              <form action={logout}><button className="rounded-lg px-1.5 py-1 text-xs font-bold text-muted hover:text-bad" aria-label="Sign out">↪ Sign out</button></form>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
