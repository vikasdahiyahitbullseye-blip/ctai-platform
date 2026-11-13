"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const STUDENT_NAV = [
  { href: "/student", label: "Home", icon: "🏠" },
  { href: "/student/map", label: "Adventure", icon: "🗺️" },
  { href: "/student/practice", label: "Practice", icon: "🎯" },
  { href: "/student/tests", label: "Homework", icon: "📝" },
  { href: "/student/projects", label: "Projects", icon: "🚀" },
  { href: "/student/games", label: "Games", icon: "🧩" },
  { href: "/student/leaderboard", label: "Leaderboard", icon: "🏆" },
  { href: "/student/rewards", label: "Rewards", icon: "🏅" },
  { href: "/student/me", label: "Me", icon: "🙂" },
];

function isActive(path: string, href: string) {
  return href === "/student" ? path === "/student" : path.startsWith(href);
}

export function SideNav() {
  const path = usePathname();
  return (
    <nav className="space-y-1" aria-label="Main">
      {STUDENT_NAV.map((n) => (
        <Link key={n.href} href={n.href} aria-current={isActive(path, n.href) ? "page" : undefined}
          className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-base font-extrabold transition ${isActive(path, n.href) ? "bg-brand text-white shadow-[0_4px_0_var(--brand-ink)]" : "text-ink-2 hover:bg-surface-2"}`}>
          <span className="text-xl" aria-hidden>{n.icon}</span>{n.label}
        </Link>
      ))}
    </nav>
  );
}

export function BottomNav() {
  const path = usePathname();
  const items = STUDENT_NAV.filter((n) => n.href !== "/student/rewards" && n.href !== "/student/projects" && n.href !== "/student/leaderboard");
  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-surface/95 backdrop-blur lg:hidden" aria-label="Main">
      <div className="mx-auto flex max-w-xl justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((n) => (
          <Link key={n.href} href={n.href} aria-current={isActive(path, n.href) ? "page" : undefined} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${isActive(path, n.href) ? "text-brand" : "text-muted"}`}>
            <span className={`text-xl transition ${isActive(path, n.href) ? "scale-125" : ""}`} aria-hidden>{n.icon}</span>{n.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
