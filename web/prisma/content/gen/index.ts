// Fills every chapter to TARGET practice items using question families.
// Deterministic: the same seed always gives the same bank, so re-seeding is stable.
import { CURRICULUM } from "../../../src/lib/constants";
import type { SeedQuestion } from "../types";
import { ALL_CT } from "./ct";
import { BANK_FAMILIES, BANKS } from "./banks";
import { AI_EVS_FAMILIES } from "./ai_evs";
import { R, type D, type Family } from "./util";
import { PICTURE_FAMILIES as PF1, PICTURE_PLAN as PP1, PICTURES_PER_CHAPTER } from "./pictures";
import { MORE_PICTURE_FAMILIES, MORE_PICTURE_PLAN } from "./pictures2";

export const PICTURE_FAMILIES: Record<string, Family> = { ...PF1, ...Object.fromEntries(MORE_PICTURE_FAMILIES.map((f) => [f.id, f])) };
export const PICTURE_PLAN: Record<string, string[]> = { ...PP1, ...MORE_PICTURE_PLAN };

export const TARGET = 40;
/** Classes 7 and 8 have fewer chapters, so they get more practice items per chapter to reach 600+ per class. */
export const TARGET_BY_CLASS: Record<number, number> = { 7: 43, 8: 48 };
export const targetFor = (cls: number) => TARGET_BY_CLASS[cls] ?? TARGET;
const mixFor = (t: number): Record<D, number> => { const e = Math.round(t * 0.35), m = Math.round(t * 0.4); return { 1: e, 2: m, 3: t - e - m }; };

const FAM: Record<string, Family> = { ...ALL_CT, ...BANK_FAMILIES, ...AI_EVS_FAMILIES };
const bankIds = new Set(BANKS.map((b) => b.id));
const expand = (ids: string[]) => ids.flatMap((id) => (bankIds.has(id) ? Object.keys(BANK_FAMILIES).filter((k) => k.startsWith(`${id}:`)) : [id]));

/** Which families suit each chapter. Keys: "<class>-<part>-<chapter>". */
export const PLAN: Record<string, string[]> = {
  // Class 3
  "3-CT-1": ["letter-pattern", "caesar", "seq-next", "emoji-pattern", "order-numbers", "who-am-i"],
  "3-CT-2": ["emoji-pattern", "groups-total", "symmetry-lines", "count-squares", "combos"],
  "3-CT-3": ["seq-next", "seq-missing", "place-compose", "order-numbers", "compare-sign", "digits-make"],
  "3-CT-4": ["two-step", "money-change", "day-after", "queue-pos", "ordering", "time-after"],
  "3-CT-5": ["symmetry-lines", "emoji-pattern", "count-squares", "mirror-letter"],
  "3-CT-6": ["place-compose", "digit-value", "digits-make", "compare-sign", "order-numbers"],
  "3-CT-7": ["groups-total", "emoji-pattern", "money-change", "share-left", "combos"],
  "3-CT-8": ["share-left", "fraction-of", "balance", "groups-total"],
  "3-CT-9": ["seq-next", "missing-number", "compare-sign", "order-numbers", "who-am-i", "seq-missing"],
  "3-CT-10": ["emoji-pattern", "combos", "groups-total", "queue-pos", "handshakes"],
  "3-CT-11": ["balance", "unit-convert", "ordering", "groups-total"],
  "3-CT-12": ["two-step", "money-change", "missing-number"],
  "3-CT-13": ["day-after", "time-after", "calendar-date", "seq-next"],
  "3-CT-14": ["turns", "grid-walk", "money-change", "queue-pos", "ordering"],
  "3-EVS-1": ["ordering", "queue-pos", "handshakes", "healthy-habit"],
  "3-EVS-2": ["plant-part", "evs-plant-growth", "food-source"],
  "3-EVS-3": ["animal-home", "evs-legs", "heads-legs"],
  "3-EVS-4": ["food-source", "healthy-habit", "groups-total"],
  "3-EVS-5": ["water-source", "evs-water", "evs-rainfall"],
  "3-EVS-6": ["grid-walk", "turns", "transport-mode", "evs-map-scale"],
  // Class 4
  "4-CT-1": ["symmetry-lines", "count-squares", "emoji-pattern", "groups-total"],
  "4-CT-2": ["queue-pos", "grid-walk", "turns", "seq-next"],
  "4-CT-3": ["seq-next", "seq-growing", "seq-geometric", "emoji-pattern", "letter-pattern", "seq-interleaved", "nth-term"],
  "4-CT-4": ["place-compose", "digit-value", "digits-make", "order-numbers", "compare-sign", "seq-missing"],
  "4-CT-5": ["fraction-of", "share-left", "compare-fractions"],
  "4-CT-6": ["unit-convert", "order-measures", "fence-posts", "ordering"],
  "4-CT-7": ["two-step", "missing-number", "data-table", "groups-total"],
  "4-CT-8": ["unit-convert", "order-measures", "balance"],
  "4-CT-9": ["groups-total", "combos", "heads-legs", "seq-next"],
  "4-CT-10": ["data-table", "two-step", "ordering"],
  "4-CT-11": ["symmetry-lines", "mirror-letter", "emoji-pattern"],
  "4-CT-12": ["day-after", "time-after", "calendar-date"],
  "4-CT-13": ["money-change", "time-after", "groups-total", "combos"],
  "4-CT-14": ["data-table", "two-step"],
  "4-EVS-1": ["body-part", "healthy-habit", "evs-water"],
  "4-EVS-2": ["plant-part", "evs-plant-growth", "crop-season"],
  "4-EVS-3": ["animal-home", "evs-legs"],
  "4-EVS-4": ["water-source", "evs-water", "evs-rainfall", "two-step"],
  "4-EVS-5": ["transport-mode", "time-after", "evs-map-scale"],
  "4-EVS-6": ["waste-type", "evs-trees", "data-table"],
  // Class 5
  "5-CT-1": ["digit-value", "place-compose", "order-numbers", "digits-make", "compare-sign"],
  "5-CT-2": ["fraction-of", "compare-fractions"],
  "5-CT-3": ["turns", "clock-angle", "angle-facts"],
  "5-CT-4": ["money-change", "time-after", "ratio", "two-step"],
  "5-CT-5": ["unit-convert", "order-measures", "grid-walk", "fence-posts"],
  "5-CT-6": ["groups-total", "share-left", "data-table", "money-change"],
  "5-CT-7": ["emoji-pattern", "nth-term", "seq-growing", "count-squares"],
  "5-CT-8": ["unit-convert", "order-measures", "balance"],
  "5-CT-9": ["groups-total", "share-left", "missing-number", "money-change"],
  "5-CT-10": ["symmetry-lines", "mirror-letter", "fold-holes", "mirror-clock", "palindrome"],
  "5-CT-11": ["perim-area", "emoji-pattern", "count-squares"],
  "5-CT-12": ["time-after", "ordering", "data-table"],
  "5-CT-13": ["seq-next", "hcf-lcm", "nth-term", "divisibility"],
  "5-CT-14": ["grid-walk", "turns", "queue-pos"],
  "5-CT-15": ["data-table"],
  "5-EVS-1": ["crop-season", "food-source", "money-change"],
  "5-EVS-2": ["water-source", "evs-rainfall", "evs-water"],
  "5-EVS-3": ["evs-map-scale", "grid-walk", "turns"],
  "5-EVS-4": ["energy", "evs-energy"],
  "5-EVS-5": ["evs-rainfall", "data-mean-range", "ai-predict-next"],
  "5-EVS-6": ["waste-type", "energy", "evs-trees"],
  // Class 6
  "6-CT-1": ["seq-next", "seq-growing", "seq-geometric", "nth-term", "seq-interleaved", "letter-pattern"],
  "6-CT-2": ["angle-facts", "clock-angle", "handshakes"],
  "6-CT-3": ["digits-make", "who-am-i", "divisibility", "missing-number"],
  "6-CT-4": ["data-table", "data-mean-range"],
  "6-CT-5": ["prime-choice", "hcf-lcm", "factor-count", "divisibility", "remainder", "prime-count", "prime-factorise"],
  "6-CT-6": ["perim-area", "count-squares"],
  "6-CT-7": ["fraction-of", "compare-fractions"],
  "6-CT-8": ["angle-facts", "turns"],
  "6-CT-9": ["symmetry-lines", "mirror-letter", "fold-holes", "mirror-clock", "palindrome"],
  "6-CT-10": ["integers"],
  "6-AI-1": ["ai-domain", "ai-vs-automation", "learning-type"],
  "6-AI-2": ["data-type", "data-table-cells", "chart-choice", "data-table"],
  "6-AI-3": ["ai-predict-next", "ai-if-else", "data-table"],
  "6-AI-4": ["online-safety", "footprint", "ethics-principle"],
  // Class 7
  "7-CT-1": ["digit-value", "order-numbers", "compare-sign", "place-compose"],
  "7-CT-2": ["missing-number", "algebra", "two-step"],
  "7-CT-3": ["decimal-ops"],
  "7-CT-4": ["algebra", "nth-term"],
  "7-CT-5": ["angle-facts", "handshakes"],
  "7-CT-6": ["divisibility", "remainder", "who-am-i", "factor-count", "parity", "digit-sum-count", "palindrome"],
  "7-CT-7": ["angle-facts", "count-squares"],
  "7-CT-8": ["fraction-of", "compare-fractions", "percent"],
  "7-AI-1": ["task-type", "ai-domain", "ai-predict-next", "learning-type"],
  "7-AI-2": ["industry", "ai-vs-automation"],
  "7-AI-3": ["chart-choice", "data-mean-range", "data-pie-angle", "percent"],
  "7-AI-4": ["ethics-principle", "online-safety", "ai-dataset-balance", "responsible-use"],
  // Class 8
  "8-CT-1": ["powers", "painted-cube", "count-squares"],
  "8-CT-2": ["powers", "seq-geometric", "power-compare", "exponent-law", "fold-holes"],
  "8-CT-3": ["binary", "caesar"],
  "8-CT-4": ["angle-facts", "perim-area", "handshakes"],
  "8-CT-5": ["divisibility", "remainder", "factor-count", "hcf-lcm", "prime-count", "digit-sum-count", "parity"],
  "8-CT-6": ["algebra", "missing-number"],
  "8-CT-7": ["ratio", "percent"],
  "8-AI-1": ["project-stage", "ai-accuracy"],
  "8-AI-2": ["industry", "task-type", "ai-domain"],
  "8-AI-3": ["ai-dataset-balance", "ai-group-errors", "ethics-principle", "ai-accuracy"],
  "8-AI-4": ["responsible-use", "ethics-principle", "online-safety", "footprint"],
};

function hash(s: string) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/**
 * Returns generated items that top every chapter up to TARGET practice items.
 * `existing` = the authored items (puzzles and short answers don't count towards the target).
 */
export function generateBank(existing: Record<number, SeedQuestion[]>): Record<number, SeedQuestion[]> {
  const out: Record<number, SeedQuestion[]> = {};
  for (const [clsS, parts] of Object.entries(CURRICULUM)) {
    const cls = Number(clsS);
    const have = existing[cls] ?? [];
    const keyOf = (q: { stem: string; options?: string[]; figure?: unknown; optionFigures?: unknown }) => `${q.stem.trim()}|${[...(q.options ?? [])].sort().join("|")}|${q.figure ? JSON.stringify(q.figure) : ""}|${q.optionFigures ? JSON.stringify(q.optionFigures) : ""}`;
    const stems = new Set(have.map(keyOf));
    out[cls] = [];
    for (const [part, titles] of Object.entries(parts) as [("CT" | "AI" | "EVS"), string[]][]) {
      titles.forEach((title, i) => {
        const ch = i + 1;
        const key = `${cls}-${part}-${ch}`;
        const fams = expand(PLAN[key] ?? []).map((id) => FAM[id]).filter(Boolean);
        if (!fams.length) return;
        const mine = have.filter((q) => (q.part ?? "CT") === part && q.ch === ch && !q.puzzle && q.type !== "SHORT");
        const MIX = mixFor(targetFor(cls));
        let need = targetFor(cls) - mine.length;
        if (need <= 0) return;
        const want: Record<D, number> = { 1: 0, 2: 0, 3: 0 };
        for (const d of [1, 2, 3] as D[]) want[d] = Math.max(0, MIX[d] - mine.filter((q) => q.d === d).length);
        let sum = want[1] + want[2] + want[3];
        while (sum > need) { const d = want[3] > want[1] ? 3 : want[2] > 0 ? 2 : 1; want[d as D]--; sum--; }
        while (sum < need) { want[2]++; sum++; }
        const r = R(hash(key));
        const ctx = { cls, part, ch, title, r };
        let turn = 0;
        for (const d of [1, 2, 3] as D[]) {
          let made = 0, tries = 0;
          const usable = fams.filter((f) => f.ds.includes(d));
          const pool = usable.length ? usable : fams;
          while (made < want[d] && tries < want[d] * 60 + 60) {
            tries++;
            const f = pool[turn++ % pool.length];
            const dd = f.ds.includes(d) ? d : f.ds[0];
            const item = f.make(ctx, dd);
            if (!item) continue;
            const stem = keyOf(item);
            if (stems.has(stem)) continue;
            if ((item.type === "MCQ" || item.type === "MULTI") && (item.options?.length ?? 0) < 3) continue;
            if (item.type === "ORDER" && new Set(item.options).size !== item.options!.length) continue;
            stems.add(stem);
            out[cls].push({ ...item, ch, part, family: f.id });
            made++;
            need--;
          }
        }
      });
    }
    // Picture questions (grids, mirror images, charts…) on top of the 40 in chapters where they fit.
    for (const [key, ids] of Object.entries(PICTURE_PLAN)) {
      const [c0, part, chS] = key.split("-");
      if (Number(c0) !== cls) continue;
      const ch = Number(chS);
      const title = (parts as Record<string, string[]>)[part]?.[ch - 1];
      if (!title) continue;
      const fams = ids.map((id) => PICTURE_FAMILIES[id]).filter(Boolean);
      const r = R(hash(`pic:${key}`));
      const ctx = { cls, part: part as "CT" | "AI" | "EVS", ch, title, r };
      const levels: D[] = cls <= 4 ? [1, 1, 2, 2, 2, 3, 1, 2] : cls <= 6 ? [1, 2, 2, 3, 2, 3, 2, 3] : [2, 2, 3, 3, 2, 3, 3, 2];
      let made = 0, tries = 0, turn = 0;
      while (made < PICTURES_PER_CHAPTER && tries++ < 400) {
        const f = fams[turn++ % fams.length];
        const want = levels[made % levels.length];
        const d = f.ds.includes(want) ? want : f.ds.reduce((a, b) => (Math.abs(b - want) < Math.abs(a - want) ? b : a));
        const item = f.make(ctx, d);
        if (!item) continue;
        const k = keyOf(item);
        if (stems.has(k)) continue;
        if (item.type === "MCQ" && (item.options?.length ?? 0) < 3) continue;
        stems.add(k);
        out[cls].push({ ...item, ch, part: part as "CT" | "AI" | "EVS", family: f.id });
        made++;
      }
    }
  }
  return out;
}

// ---------------- CBSE-level families (multi-clue, CBSE-length questions) ----------------
import { CBSE_A } from "./cbse_level";
import { CBSE_B } from "./cbse_level2";
import { CBSE_C } from "./cbse_level3";
const CFAM: Record<string, Family> = Object.fromEntries([...CBSE_A, ...CBSE_B, ...CBSE_C].map((f) => [f.id, f]));

/** CBSE-level families for each CT chapter (topic-matched). */
export const CBSE_PLAN: Record<string, string[]> = {
  "3-CT-1": ["c-name-clues", "c-caesar", "c-digit-clues"], "3-CT-2": ["c-match-grid", "c-order-clues", "c-name-clues"], "3-CT-3": ["c-digit-clues", "c-pick-sums", "c-repeat-count"],
  "3-CT-4": ["c-money-plan", "c-time-plan", "c-days-later"], "3-CT-5": ["c-match-grid", "c-fold-perimeter", "c-order-clues"], "3-CT-6": ["c-digit-clues", "c-pick-sums", "c-wrong-term"],
  "3-CT-7": ["c-groups-left", "c-money-plan", "c-pick-sums"], "3-CT-8": ["c-fraction-share", "c-groups-left", "c-money-plan"], "3-CT-9": ["c-digit-clues", "c-wrong-term", "c-repeat-count"],
  "3-CT-10": ["c-order-clues", "c-money-plan", "c-time-plan"], "3-CT-11": ["c-ribbon", "c-order-clues", "c-tank"], "3-CT-12": ["c-money-plan", "c-digit-clues", "c-token-box"],
  "3-CT-13": ["c-time-plan", "c-days-later", "c-order-clues"], "3-CT-14": ["c-money-plan", "c-time-plan", "c-order-clues"],
  "4-CT-1": ["c-match-grid", "c-fold-perimeter", "c-order-clues"], "4-CT-2": ["c-circle-seats", "c-order-clues", "c-match-grid"], "4-CT-3": ["c-wrong-term", "c-repeat-count", "c-block-first"],
  "4-CT-4": ["c-digit-clues", "c-meter-steps", "c-pick-sums"], "4-CT-5": ["c-fraction-share", "c-ribbon", "c-tank"], "4-CT-6": ["c-ribbon", "c-fold-perimeter", "c-order-clues"],
  "4-CT-7": ["c-money-plan", "c-pick-sums", "c-digit-clues"], "4-CT-8": ["c-order-clues", "c-tank", "c-ribbon"], "4-CT-9": ["c-groups-left", "c-token-box", "c-money-plan"],
  "4-CT-10": ["c-digit-clues", "c-order-clues", "c-meter-steps"], "4-CT-11": ["c-fold-perimeter", "c-match-grid", "c-circle-seats"], "4-CT-12": ["c-time-plan", "c-days-later", "c-clock-arrival"],
  "4-CT-13": ["c-time-plan", "c-money-plan", "c-order-clues"], "4-CT-14": ["c-order-clues", "c-pick-sums", "c-digit-clues"],
  "5-CT-1": ["c-digit-clues", "c-meter-steps", "c-pick-sums", "c-palindrome"], "5-CT-2": ["c-fraction-share", "c-tank", "c-exam-wrong"], "5-CT-3": ["c-circle-seats", "c-clock-arrival", "c-clock-right"],
  "5-CT-4": ["c-money-plan", "c-time-plan", "c-meter-steps"], "5-CT-5": ["c-ribbon", "c-fold-perimeter", "c-order-clues"], "5-CT-6": ["c-groups-left", "c-fraction-share", "c-money-plan"],
  "5-CT-7": ["c-block-first", "c-wrong-term", "c-match-grid"], "5-CT-8": ["c-tank", "c-order-clues", "c-ribbon"], "5-CT-9": ["c-groups-left", "c-token-box", "c-pick-sums"],
  "5-CT-10": ["c-fold-perimeter", "c-match-grid", "c-circle-seats"], "5-CT-11": ["c-match-grid", "c-fold-perimeter", "c-block-first"], "5-CT-12": ["c-time-plan", "c-clock-right", "c-days-later"],
  "5-CT-13": ["c-circle-steps", "c-groups-left", "c-repeat-count"], "5-CT-14": ["c-circle-seats", "c-order-clues", "c-lift-moves"], "5-CT-15": ["c-order-clues", "c-pick-sums", "c-digit-clues"],
  "6-CT-1": ["c-wrong-term", "c-repeat-count", "c-block-first", "c-circle-steps"], "6-CT-2": ["c-circle-seats", "c-clock-arrival", "c-clock-right", "c-angle-ratio"], "6-CT-3": ["c-pick-sums", "c-palindrome", "c-digit-clues", "c-consecutive"],
  "6-CT-4": ["c-order-clues", "c-match-jobs", "c-pick-sums"], "6-CT-5": ["c-circle-steps", "c-consecutive", "c-prime-dates", "c-zeros-end", "c-multiples"], "6-CT-6": ["c-fold-perimeter", "c-match-grid", "c-rect-count"],
  "6-CT-7": ["c-fraction-share", "c-exam-wrong", "c-tank"], "6-CT-8": ["c-match-grid", "c-fold-perimeter", "c-block-first", "c-rect-count"], "6-CT-9": ["c-circle-seats", "c-match-grid", "c-fold-perimeter"],
  "6-CT-10": ["c-lift-moves", "c-token-box", "c-number-machine"],
  "7-CT-1": ["c-digit-clues", "c-meter-steps", "c-zeros-end", "c-match-jobs"], "7-CT-2": ["c-operator-swap", "c-work-backwards", "c-number-machine", "c-token-box"], "7-CT-3": ["c-decimal-shift", "c-decimal-series", "c-base"],
  "7-CT-4": ["c-ages", "c-days-later", "c-exam-wrong", "c-work-backwards"], "7-CT-5": ["c-intersections", "c-clock-right", "c-circle-seats", "c-angle-ratio"], "7-CT-6": ["c-palindrome", "c-consecutive", "c-digit-clues", "c-pick-sums"],
  "7-CT-7": ["c-triangle-count", "c-angle-ratio", "c-clock-arrival"], "7-CT-8": ["c-fraction-share", "c-exam-wrong", "c-tank"],
  "8-CT-1": ["c-painted-cube", "c-make-cube", "c-zeros-end"], "8-CT-2": ["c-last-digit", "c-power-order", "c-wrong-term", "c-repeat-count"], "8-CT-3": ["c-base", "c-roman", "c-caesar"],
  "8-CT-4": ["c-rect-count", "c-quad-angles", "c-match-grid"], "8-CT-5": ["c-groups-left", "c-consecutive", "c-multiples", "c-prime-dates"], "8-CT-6": ["c-quick-product", "c-token-box", "c-ages"],
  "8-CT-7": ["c-ratio", "c-tank", "c-fraction-share"],
};

/**
 * CBSE-level generated items for CT chapters: tops each chapter up so that, with the help-book and CBSE handbook
 * questions already there (`have[key]`), it has at least `target` practice items, and never fewer than `min` new ones.
 */
export function generateCbseLevel(have: Record<string, number>, target = 40, min = 12): Record<number, SeedQuestion[]> {
  const out: Record<number, SeedQuestion[]> = {};
  for (const [key, ids] of Object.entries(CBSE_PLAN)) {
    const [c0, , chS] = key.split("-");
    const cls = Number(c0), ch = Number(chS);
    const title = CURRICULUM[cls]?.CT?.[ch - 1]; if (!title) continue;
    const fams = ids.map((id) => CFAM[id]).filter(Boolean);
    const need = Math.max(min, target - (have[key] ?? 0));
    const r = R(hash(`cbse:${key}`));
    const ctx = { cls, part: "CT" as const, ch, title, r };
    const seen = new Set<string>();
    const list: SeedQuestion[] = [];
    let turn = 0, tries = 0;
    while (list.length < need && tries < need * 80) {
      tries++;
      const f = fams[turn++ % fams.length];
      const d = f.ds[(list.length + turn) % f.ds.length];
      const it = f.make(ctx, d);
      if (!it || seen.has(it.stem)) continue;
      seen.add(it.stem);
      list.push({ ...it, ch, part: "CT", family: f.id });
    }
    (out[cls] ??= []).push(...list);
  }
  return out;
}

// ---------------- Scenario-level families for the AI chapters and EVS themes ----------------
import { SCENARIO_FAMILIES } from "./scenario";
const SFAM: Record<string, Family> = Object.fromEntries(SCENARIO_FAMILIES.map((f) => [f.id, f]));
export const SCENARIO_PLAN: Record<string, string[]> = {
  "3-EVS-1": ["s-evs-family", "s-evs-queue", "s-evs-travel"], "3-EVS-2": ["s-evs-plant", "s-evs-food-chain", "s-evs-water"], "3-EVS-3": ["s-evs-animal-clues", "s-evs-food-chain", "s-evs-queue"],
  "3-EVS-4": ["s-evs-food-chain", "s-evs-waste", "s-evs-plant"], "3-EVS-5": ["s-evs-water", "s-evs-rain", "s-evs-plant"], "3-EVS-6": ["s-evs-map-route", "s-evs-travel", "s-evs-queue"],
  "4-EVS-1": ["s-evs-water", "s-evs-queue", "s-evs-family"], "4-EVS-2": ["s-evs-plant", "s-evs-food-chain", "s-evs-rain"], "4-EVS-3": ["s-evs-animal-clues", "s-evs-food-chain", "s-evs-queue"],
  "4-EVS-4": ["s-evs-water", "s-evs-rain", "s-evs-plant"], "4-EVS-5": ["s-evs-travel", "s-evs-map-route", "s-evs-queue"], "4-EVS-6": ["s-evs-waste", "s-evs-energy", "s-evs-water"],
  "5-EVS-1": ["s-evs-plant", "s-evs-rain", "s-evs-food-chain"], "5-EVS-2": ["s-evs-rain", "s-evs-water", "s-evs-plant"], "5-EVS-3": ["s-evs-map-route", "s-evs-travel", "s-evs-queue"],
  "5-EVS-4": ["s-evs-energy", "s-evs-travel", "s-evs-water"], "5-EVS-5": ["s-evs-rain", "s-evs-plant", "s-evs-water"], "5-EVS-6": ["s-evs-waste", "s-evs-energy", "s-evs-water"],
  "6-AI-1": ["s-ai-domain-learning", "s-ai-rules", "s-ai-split"], "6-AI-2": ["s-data-mean", "s-ai-chart", "s-ai-split"], "6-AI-3": ["s-ai-rules", "s-data-mean", "s-ai-accuracy"], "6-AI-4": ["s-online-safety", "s-ai-ethics", "s-ai-bias"],
  "7-AI-1": ["s-ai-domain-learning", "s-ai-accuracy", "s-ai-split"], "7-AI-2": ["s-ai-domain-learning", "s-ai-rules", "s-ai-accuracy"], "7-AI-3": ["s-ai-chart", "s-data-mean", "s-ai-split"], "7-AI-4": ["s-ai-bias", "s-ai-ethics", "s-online-safety"],
  "8-AI-1": ["s-ai-lifecycle", "s-ai-accuracy", "s-ai-split"], "8-AI-2": ["s-ai-domain-learning", "s-ai-rules", "s-ai-accuracy"], "8-AI-3": ["s-ai-bias", "s-ai-split", "s-data-mean"], "8-AI-4": ["s-ai-ethics", "s-online-safety", "s-ai-bias"],
};
/** Scenario-level items for AI chapters and EVS themes, topping each up to `target` (with the CBSE items in `have`). */
export function generateScenario(have: Record<string, number>, target = 40, min = 20): Record<number, SeedQuestion[]> {
  const out: Record<number, SeedQuestion[]> = {};
  for (const [key, ids] of Object.entries(SCENARIO_PLAN)) {
    const [c0, part, chS] = key.split("-");
    const cls = Number(c0), ch = Number(chS);
    const title = (CURRICULUM[cls] as Record<string, string[]>)?.[part]?.[ch - 1]; if (!title) continue;
    const fams = ids.map((id) => SFAM[id]).filter(Boolean);
    const need = Math.max(min, target - (have[key] ?? 0));
    const r = R(hash(`scn:${key}`));
    const ctx = { cls, part: part as "AI" | "EVS", ch, title, r };
    const seen = new Set<string>(); const list: SeedQuestion[] = [];
    let turn = 0, tries = 0;
    while (list.length < need && tries < need * 100) {
      tries++;
      const f = fams[turn++ % fams.length];
      const d = f.ds[(list.length + turn) % f.ds.length];
      const it = f.make(ctx, d);
      if (!it || seen.has(it.stem)) continue;
      seen.add(it.stem); list.push({ ...it, ch, part: part as "AI" | "EVS", family: f.id });
    }
    (out[cls] ??= []).push(...list);
  }
  return out;
}
