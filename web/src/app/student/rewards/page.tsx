import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSection, leaderboard } from "@/lib/student";
import { studentSummary } from "@/lib/progress";
import { BADGES } from "@/lib/gamification";
import { Card, PageHeader, Empty } from "@/components/ui";

export default async function RewardsPage() {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  if (!section) return <Empty>Not enrolled.</Empty>;
  const summary = await studentSummary(prisma, user.id);
  const owned = new Map(summary.badges.map((b) => [b.code, b]));
  const weekStart = new Date(Date.now() - 7 * 86400000);
  const board = await leaderboard(section.id, weekStart);
  const me = board.find((b) => b.userId === user.id);
  const classTotal = board.reduce((s, b) => s + b.xp, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Rewards" subtitle={`${summary.badges.length} of ${Object.keys(BADGES).length} badges earned`} />
      <Card title="Badges">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(BADGES).map(([code, b]) => {
            const got = owned.get(code);
            return (
              <li key={code} className={`flex items-center gap-3 rounded-2xl border p-4 ${got ? "border-accent bg-accent-soft" : "border-line opacity-60"}`}>
                <span className={`text-3xl ${got ? "" : "grayscale"}`} aria-hidden>{got ? b.icon : "🔒"}</span>
                <div>
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-xs text-muted">{b.description}</div>
                  {got && <div className="mt-0.5 text-xs text-muted">Earned {got.awardedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {section.leaderboard ? (
        <Card title={`This week's leaderboard · Class ${section.classLevel}-${section.section}`}>
          <ol className="divide-y divide-line">
            {board.slice(0, 10).map((r) => (
              <li key={r.userId} className={`flex items-center gap-4 py-2.5 ${r.userId === user.id ? "rounded-xl bg-brand-soft px-2 font-semibold" : ""}`}>
                <span className="w-8 text-center text-lg">{r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : r.rank}</span>
                <span className="flex-1">{r.name}{r.userId === user.id ? " (you)" : ""}</span>
                <span className="tabular-nums">{r.xp} XP</span>
              </li>
            ))}
          </ol>
          {me && me.rank > 10 && <p className="mt-3 text-sm">You are #{me.rank} with {me.xp} XP this week. Keep going!</p>}
        </Card>
      ) : (
        <Card title={`Class ${section.classLevel}-${section.section} team points`}>
          <p className="text-sm text-ink-2">Everyone in your class earns points together. This week your class has earned:</p>
          <p className="mt-2 text-4xl font-bold tabular-nums text-brand">⭐ {classTotal} XP</p>
          <p className="mt-2 text-sm text-muted">You added {me?.xp ?? 0} XP this week.</p>
        </Card>
      )}
    </div>
  );
}
