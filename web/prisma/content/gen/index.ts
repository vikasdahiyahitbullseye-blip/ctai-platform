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
