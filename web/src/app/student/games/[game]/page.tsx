import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSection } from "@/lib/student";
import { DAILY_XP_GAMES, GAMES, TIERS, isGame, levelFor, type Tier } from "@/lib/games";
import { GamePlayer } from "@/components/games/GamePlayer";
import { Empty, PageHeader } from "@/components/ui";

export default async function PlayGame({ params, searchParams }: { params: Promise<{ game: string }>; searchParams: Promise<{ tier?: string }> }) {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  if (!section) return <Empty>Not enrolled.</Empty>;
  const game = (await params).game.toUpperCase();
  if (!isGame(game)) notFound();
  const sp = await searchParams;
  const tier: Tier = sp.tier && sp.tier in TIERS ? (sp.tier as Tier) : "normal";
  const level = levelFor(section.classLevel, tier);
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const rewardedToday = await prisma.gamePlay.count({ where: { userId: user.id, createdAt: { gte: dayStart }, xp: { gt: 0 } } });
  return (
    <div>
      <PageHeader title={`${GAMES[game].icon} ${GAMES[game].name}`} subtitle={`${TIERS[tier].label} · level ${level + 1} of 7`} />
      <GamePlayer game={game} tier={tier} level={level} xpGamesLeft={Math.max(0, DAILY_XP_GAMES - rewardedToday)} />
    </div>
  );
}
