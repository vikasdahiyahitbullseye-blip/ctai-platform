import Link from "next/link";
import type { BoardRow, Period, Scope } from "@/lib/leaderboard";
import { PERIODS } from "@/lib/leaderboard";

const medal = (rank: number) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : String(rank));

/** Tabs to switch board (scope) and period. `base` is the page the links point to. */
export function BoardTabs({ base, boards, scope, period }: { base: string; boards: { scope: Scope; short: string }[]; scope: Scope; period: Period }) {
  const href = (s: Scope, p: Period) => `${base}?board=${encodeURIComponent(s)}&period=${p}`;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Leaderboard">
        {boards.map((b) => (
          <Link key={b.scope} href={href(b.scope, period)} role="tab" aria-selected={b.scope === scope} scroll={false}
            className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${b.scope === scope ? "bg-brand text-white" : "bg-surface-2 text-ink-2 hover:bg-brand-soft"}`}>
            {b.short}
          </Link>
        ))}
      </div>
      <div className="flex gap-2 text-xs font-bold">
        {(Object.keys(PERIODS) as Period[]).map((p) => (
          <Link key={p} href={href(scope, p)} scroll={false} aria-current={p === period ? "true" : undefined} className={`rounded-full border-2 px-2.5 py-0.5 ${p === period ? "border-brand text-brand" : "border-line text-muted"}`}>{PERIODS[p]}</Link>
        ))}
      </div>
    </div>
  );
}

/** A ranked list; shows the top `top` and always the student's own row. */
export function BoardList({ rows, me, top = 10 }: { rows: BoardRow[]; me: string; top?: number }) {
  if (!rows.length) return <p className="py-3 text-sm font-semibold text-muted">No one here yet.</p>;
  const mine = rows.find((r) => r.userId === me);
  const shown = rows.slice(0, top);
  const extra = mine && !shown.includes(mine) ? mine : null;
  const Row = ({ r }: { r: BoardRow }) => (
    <li className={`flex items-center gap-3 py-2 ${r.userId === me ? "rounded-xl bg-brand-soft px-2 font-extrabold" : ""}`}>
      <span className="w-8 shrink-0 text-center text-lg tabular-nums">{medal(r.rank)}</span>
      <span className="min-w-0 flex-1 truncate">{r.name}{r.userId === me ? " (you)" : ""}{r.where && <span className="ml-2 text-xs font-semibold text-muted">{r.where}</span>}</span>
      <span className="shrink-0 tabular-nums">⭐ {r.xp}</span>
    </li>
  );
  return (
    <ol className="divide-y divide-line">
      {shown.map((r) => <Row key={r.userId} r={r} />)}
      {extra && (
        <>
          <li className="py-1 text-center text-muted" aria-hidden>⋯</li>
          <Row r={extra} />
        </>
      )}
    </ol>
  );
}
