"use server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { studentSection } from "@/lib/student";
import { addXp, evaluateBadges } from "@/lib/progress";
import { DAILY_XP_GAMES, GAMES, TIERS, gameXp, isGame, levelFor, verifyGame, type Tier } from "@/lib/games";

export type GameResult = { ok: false; error: string } | { ok: true; xp: number; moves: number; onPar: boolean; xpGamesLeft: number; best: number | null };

/** Rebuilds the puzzle from its seed, checks the solution, records the play and gives XP (first few games a day). */
export async function submitGame(game: string, tier: string, seed: string, solution: unknown, timeSec: number): Promise<GameResult> {
  const user = await requireUser("STUDENT");
  const section = await studentSection(user.id);
  if (!section || !isGame(game) || !(tier in TIERS)) return { ok: false, error: "Unknown game." };
  const level = levelFor(section.classLevel, tier as Tier);
  const check = verifyGame(game, seed, level, solution);
  if (!check) return { ok: false, error: "That does not solve the puzzle yet." };
  if (await prisma.gamePlay.findUnique({ where: { userId_game_seed: { userId: user.id, game, seed } } })) return { ok: false, error: "This puzzle was already counted. Start a new one!" };

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const rewardedToday = await prisma.gamePlay.count({ where: { userId: user.id, createdAt: { gte: dayStart }, xp: { gt: 0 } } });
  const xp = rewardedToday < DAILY_XP_GAMES ? gameXp(level, check.onPar) : 0;
  const best = await prisma.gamePlay.findFirst({ where: { userId: user.id, game, level }, orderBy: [{ moves: "asc" }, { timeSec: "asc" }] });
  await prisma.gamePlay.create({ data: { userId: user.id, game, level, seed, moves: check.moves, timeSec: Math.max(0, Math.min(86400, Math.round(Number(timeSec) || 0))), xp } });
  if (xp) {
    await addXp(prisma, user.id, xp, `Logic game: ${GAMES[game].name}`);
    await evaluateBadges(prisma, user.id);
  }
  return { ok: true, xp, moves: check.moves, onPar: check.onPar, xpGamesLeft: Math.max(0, DAILY_XP_GAMES - rewardedToday - (xp ? 1 : 0)), best: best?.moves ?? null };
}
