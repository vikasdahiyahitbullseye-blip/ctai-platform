import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSection } from "@/lib/student";
import { DAILY_XP_GAMES, GAMES, TIERS, levelFor, type GameId, type Tier } from "@/lib/games";
import { Empty, PageHeader } from "@/components/ui";

export default async function GamesPage() {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  if (!section) return <Empty>Not enrolled.</Empty>;
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const [rewardedToday, solved] = await Promise.all([
    prisma.gamePlay.count({ where: { userId: user.id, createdAt: { gte: dayStart }, xp: { gt: 0 } } }),
    prisma.gamePlay.groupBy({ by: ["game"], where: { userId: user.id }, _count: true }),
  ]);
  const count = new Map(solved.map((s) => [s.game, s._count]));
  const left = Math.max(0, DAILY_XP_GAMES - rewardedToday);

  return (
    <div className="space-y-6">
      <PageHeader title="🧩 Logic games" subtitle={`Brain games for Class ${section.classLevel}. Pick Easy, Normal or Challenge. ${left ? `${left} of today's ${DAILY_XP_GAMES} XP games left.` : "You have earned today's game XP — play on for fun!"}`} />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(GAMES) as GameId[]).map((g) => (
          <li key={g} className="flex flex-col rounded-[2rem] border-2 border-line bg-surface p-5 shadow-sm">
            <div className="text-4xl" aria-hidden>{GAMES[g].icon}</div>
            <h2 className="mt-2 text-xl font-extrabold">{GAMES[g].name}</h2>
            <p className="mt-1 flex-1 text-sm text-ink-2">{GAMES[g].blurb}</p>
            <p className="mt-2 text-xs font-bold text-muted">{GAMES[g].skill}{count.get(g) ? ` · solved ${count.get(g)}` : ""}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(TIERS) as Tier[]).map((t) => (
                <Link key={t} href={`/student/games/${g.toLowerCase()}?tier=${t}`} className={`kbtn px-3 py-1.5 text-sm ${t === "normal" ? "" : "kbtn-ghost"}`} aria-label={`${GAMES[g].name}, ${TIERS[t].label} (level ${levelFor(section.classLevel, t) + 1})`}>
                  {TIERS[t].label}
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
