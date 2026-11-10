// Skill mastery model v1 (docs/SPEC.md §9). Transparent and explainable by design.

export type Evidence = { correct: boolean; difficulty: number; at: Date; attemptId: string };

export const MASTERY_LEVELS = ["NO_EVIDENCE", "BEGINNING", "DEVELOPING", "PROFICIENT", "ADVANCED"] as const;
export type MasteryLevel = (typeof MASTERY_LEVELS)[number];

export const MASTERY_LABEL: Record<MasteryLevel, string> = {
  NO_EVIDENCE: "Not enough evidence",
  BEGINNING: "Beginning",
  DEVELOPING: "Developing",
  PROFICIENT: "Proficient",
  ADVANCED: "Advanced",
};

const DIFF_WEIGHT: Record<number, number> = { 1: 1, 2: 1.5, 3: 2 };
const WINDOW = 20;
const DECAY = 0.95;
const MIN_EVIDENCE = 5;

export function computeMastery(evidence: Evidence[]): { score: number | null; level: MasteryLevel; count: number } {
  const recent = [...evidence].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, WINDOW);
  const sessions = new Set(recent.map((e) => e.attemptId)).size;
  if (recent.length < MIN_EVIDENCE || sessions < 2) {
    return { score: recent.length ? weighted(recent) : null, level: "NO_EVIDENCE", count: recent.length };
  }
  const score = weighted(recent);
  return { score, level: levelFor(score), count: recent.length };
}

function weighted(recent: Evidence[]): number {
  let num = 0;
  let den = 0;
  recent.forEach((e, i) => {
    const w = (DIFF_WEIGHT[e.difficulty] ?? 1) * Math.pow(DECAY, i);
    den += w;
    if (e.correct) num += w;
  });
  return den ? Math.round((num / den) * 100) : 0;
}

export function levelFor(score: number): MasteryLevel {
  if (score >= 85) return "ADVANCED";
  if (score >= 65) return "PROFICIENT";
  if (score >= 40) return "DEVELOPING";
  return "BEGINNING";
}
