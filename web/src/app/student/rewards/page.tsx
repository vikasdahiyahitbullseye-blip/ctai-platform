import Link from "next/link";
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

      <Card title="Leaderboard">
        <p className="text-sm text-ink-2">{me ? <>You earned <strong>⭐ {me.xp} XP</strong> this week{section.leaderboard ? <> and are <strong>#{me.rank}</strong> in Class {section.classLevel}-{section.section}</> : null}. </> : null}See your section, class, school and friend groups on the leaderboard.</p>
        <Link href="/student/leaderboard" className="kbtn mt-3 inline-block">🏆 Open the leaderboard</Link>
      </Card>
    </div>
  );
}
