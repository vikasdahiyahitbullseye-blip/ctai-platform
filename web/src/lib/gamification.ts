// Gamification rules v1 (docs/SPEC.md §8).

export const XP = {
  PRACTICE_CORRECT: 10,
  PRACTICE_CORRECT_WITH_HINT: 5,
  PRACTICE_ATTEMPT: 2,
  SET_COMPLETED: 20,
  TEST_PER_MARK: 2,
  MILESTONE_APPROVED: 30,
  SHOWCASE: 50,
  PUZZLE_SOLVED: 25,
} as const;

const RANKS = ["Explorer", "Thinker", "Solver", "Strategist", "Innovator", "Mastermind", "Visionary"];

/** Cumulative XP needed to reach level n (level 1 starts at 0). */
export function xpForLevel(n: number): number {
  const k = n - 1;
  return (100 * k * (k + 1)) / 2;
}

export function levelInfo(totalXp: number) {
  let level = 1;
  while (totalXp >= xpForLevel(level + 1)) level++;
  const floor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    rank: RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 2))],
    intoLevel: totalXp - floor,
    levelSpan: next - floor,
    toNext: next - totalXp,
  };
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Consecutive active days ending today (or yesterday). Weekends never break a streak
 * but only count when the student was active on them.
 */
export function computeStreak(activityDates: Date[], today = new Date()): number {
  const active = new Set(activityDates.map(dayKey));
  let streak = 0;
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  // Today not yet active: start counting from yesterday without breaking.
  if (!active.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  for (let i = 0; i < 400; i++) {
    const k = dayKey(cursor);
    const dow = cursor.getUTCDay();
    if (active.has(k)) streak++;
    else if (dow !== 0 && dow !== 6) break;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export const BADGES: Record<string, { name: string; description: string; icon: string }> = {
  FIRST_STEPS: { name: "First Steps", description: "Completed your first practice set", icon: "🚀" },
  SHARP_EYE: { name: "Sharp Eye", description: "10 pattern questions answered correctly", icon: "👁️" },
  PERFECT_SCORE: { name: "Perfect Score", description: "Scored 100% on a test or set", icon: "🏆" },
  PUZZLE_STREAK_5: { name: "Puzzle Streak", description: "Solved 5 Puzzles of the Day", icon: "🧩" },
  PATTERN_PRO: { name: "Pattern Pro", description: "Proficient in Pattern Recognition", icon: "🔷" },
  DECOMPOSER: { name: "Decomposer", description: "Proficient in Decomposition", icon: "🧱" },
  ALGORITHM_ACE: { name: "Algorithm Ace", description: "Proficient in Algorithmic Thinking", icon: "🪜" },
  BIG_PICTURE: { name: "Big Picture", description: "Proficient in Abstract Thinking", icon: "🔭" },
  AI_EXPLORER: { name: "AI Explorer", description: "Proficient in AI Concepts", icon: "🤖" },
  COMEBACK: { name: "Comeback", description: "Improved by 20+ points on a retake", icon: "📈" },
  STREAK_7: { name: "On a Roll", description: "7-day activity streak", icon: "🔥" },
  TEAM_PLAYER: { name: "Team Player", description: "Your project team's first milestone was approved", icon: "🤝" },
  SHOWCASE: { name: "Showcase Star", description: "Your team's project was chosen for the showcase", icon: "🌟" },
  HOMEWORK_HERO: { name: "Homework Hero", description: "Submitted 3 homework assignments", icon: "📝" },
  // Logic games
  GAME_ON: { name: "Game On", description: "Solved your first logic game", icon: "🎮" },
  GAME_MASTER: { name: "Game Master", description: "Solved 25 logic games", icon: "🕹️" },
  GAME_EXPLORER: { name: "Game Explorer", description: "Solved every kind of logic game", icon: "🧭" },
  CHALLENGER: { name: "Challenger", description: "Solved a logic game at Challenge level", icon: "⚔️" },
  TIDY_THINKER: { name: "Tidy Thinker", description: "Found the tidiest solution in 5 logic games", icon: "✨" },
  // Practice and consistency
  CENTURY: { name: "Century", description: "100 answers correct", icon: "💯" },
  MARATHON: { name: "Brain Marathon", description: "Answered 500 questions", icon: "🏃" },
  SHARP_SHOOTER: { name: "Sharp Shooter", description: "90% or more in a practice set of at least 10 questions", icon: "🎯" },
  CBSE_SCHOLAR: { name: "CBSE Scholar", description: "Completed a CBSE book-questions round", icon: "📗" },
  STAR_COLLECTOR: { name: "Star Collector", description: "Earned 3 stars on 5 islands of the adventure map", icon: "🌟" },
  PUZZLE_MASTER: { name: "Puzzle Master", description: "Solved 20 Puzzles of the Day", icon: "🧠" },
  HOMEWORK_CHAMPION: { name: "Homework Champion", description: "Submitted 10 homework assignments", icon: "📚" },
  STREAK_30: { name: "Unstoppable", description: "30-day activity streak", icon: "🌋" },
  // Friends and leaderboards
  SQUAD_UP: { name: "Squad Up", description: "Joined or created a friend group", icon: "👫" },
  PODIUM: { name: "Weekly Champion", description: "Top of your section's weekly leaderboard, with 150+ XP that week", icon: "🥇" },
  // More skills
  DATA_DETECTIVE: { name: "Data Detective", description: "Proficient in Data Literacy", icon: "📊" },
  ETHICS_GUARDIAN: { name: "Ethics Guardian", description: "Proficient in Ethics & Safety", icon: "🛡️" },
};

export const SKILL_BADGE: Record<string, string> = {
  PATTERN: "PATTERN_PRO",
  DECOMPOSITION: "DECOMPOSER",
  ALGORITHMIC: "ALGORITHM_ACE",
  ABSTRACT: "BIG_PICTURE",
  AI_CONCEPT: "AI_EXPLORER",
  DATA: "DATA_DETECTIVE",
  ETHICS: "ETHICS_GUARDIAN",
};
