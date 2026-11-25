// Question sets for the new help-book edition: 20 "More practice" questions per CT chapter (Classes 3–8) and 20
// "Practice" questions per AI chapter (Classes 6–8, the books' AI part). Each set has exactly 7 Easy, 7 Medium and
// 6 Hard; 12 multiple choice, 3 true/false, 3 fill-in, 2 numeric; CT: 5 per CBSE skill and at least 10 pictures;
// AI: 7 AI concepts, 7 data, 6 ethics and at least 8 pictures; at most 2 from one engine and no repeated problem. The same questions go into the
// platform bank (sourceRef "… · More practice Qn"), so the bank checks re-solve them too.
import type { SeedQuestion } from "../../types";
import { R, NAMES } from "../util";
import { type D, type QType, render } from "./core";
import { themes } from "./themes";
import { enginesFor } from "./index";

export const BOOK_PER_CHAPTER = 20;
const D_PLAN: D[] = [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3];
const SKILL_PLAN: Record<"CT" | "AI", string[][]> = {
  CT: [["ABSTRACT", 5], ["PATTERN", 5], ["DECOMPOSITION", 5], ["ALGORITHMIC", 5]].map(([s, n]) => Array(n).fill(s)),
  AI: [["AI_CONCEPT", 7], ["DATA", 7], ["ETHICS", 6]].map(([s, n]) => Array(n).fill(s)),
} as unknown as Record<"CT" | "AI", string[][]>;
const TYPE_PLAN: QType[] = [...Array(12).fill("MCQ"), "TRUE_FALSE", "TRUE_FALSE", "TRUE_FALSE", "FILL_BLANK", "FILL_BLANK", "FILL_BLANK", "NUMERIC", "NUMERIC"];

function hash(s: string) { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }
const shuffle = <T,>(a: T[], r: () => number) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const NAME_RE = new RegExp(`\\b(${NAMES.join("|")})('s)?\\b`, "g");
/** A problem without its names and setting, to spot the same problem told twice. */
const core = (family: string, stem: string) => `${family}|${stem.replace(NAME_RE, "X").replace(/ (in|at|on) the [^.,:]+/g, "").slice(0, 160)}`;

export type BookQuestion = SeedQuestion & { ref: string };

/** Engines that match each AI chapter's topic; they are chosen more often (and may give up to 3 questions). */
const AI_FAVOUR: Record<string, string[]> = {
  "6-AI-1": ["v3-ai-or-not", "v3-ai-domain"], "6-AI-2": ["v3-data-kind", "v3-data-bars", "v3-mean-data"], "6-AI-3": ["v3-ai-rules", "v3-nearest"], "6-AI-4": ["v3-safety", "v3-password", "v3-ethics-principle"],
  "7-AI-1": ["v3-ai-domain", "v3-learn-type"], "7-AI-2": ["v3-industry", "v3-ai-domain"], "7-AI-3": ["v3-chart-choice", "v3-data-bars", "v3-mean-data"], "7-AI-4": ["v3-bias-bars", "v3-fairness", "v3-ethics-principle"],
  "8-AI-1": ["v3-lifecycle", "v3-train-split", "v3-accuracy-ticks"], "8-AI-2": ["v3-learn-type", "v3-industry", "v3-ai-domain"], "8-AI-3": ["v3-bias-bars", "v3-fairness", "v3-train-split"], "8-AI-4": ["v3-ethics-principle", "v3-safety", "v3-fairness"],
};

export function generateBookSets(seenStems: Set<string> = new Set()): Record<number, BookQuestion[]> {
  const out: Record<number, BookQuestion[]> = {};
  for (const t of themes()) {
    const r = R(hash(`book:${t.key}`));
    const ctx = { cls: t.cls, theme: t, r };
    // 20 slots: difficulty × skill × type, each list spread evenly; at least 10 slots ask for a picture.
    const skills = shuffle(SKILL_PLAN[t.part].flat(), r);
    const types = shuffle(TYPE_PLAN, r);
    const slots = D_PLAN.map((d, i) => ({ d, skill: skills[i], type: types[i], pic: t.part === "CT" ? i % 2 === 0 : i % 5 < 2 }));
    const fam: Record<string, number> = {}, seen = new Set<string>(), made: SeedQuestion[] = [];
    const tryFill = (slot: (typeof slots)[number]): SeedQuestion | null => {
      for (let a = 0; a < 300; a++) {
        const strict = a < 220;
        const capLoose = Math.max(3, Math.ceil(5 / Math.max(1, enginesFor(t, slot.skill).length)) + 1);
        const fav = (id: string) => AI_FAVOUR[t.key]?.includes(id);
        let engines = enginesFor(t, slot.skill).filter((e) => (fam[e.id] ?? 0) < (strict ? (fav(e.id) ? 3 : 2) : capLoose));
        if (slot.pic && strict && engines.some((e) => e.pic !== "never")) engines = engines.filter((e) => e.pic !== "never");
        if (!engines.length) { if (strict) { a = 219; continue; } return null; }
        // Prefer engines on the chapter's own topic: AI favourites, and CT engines tagged for the chapter over "any".
        const weight = (id: string, tags: string[]) => (fav(id) ? 5 : t.part === "CT" && !tags.includes("any") ? 2 : 1);
        const total = engines.reduce((sum, x) => sum + weight(x.id, x.tags), 0);
        let pickAt = r() * total, e = engines[0];
        for (const x of engines) { pickAt -= weight(x.id, x.tags); if (pickAt <= 0) { e = x; break; } }
        const p = e.make(ctx, slot.d, slot.pic);
        if (!p || p.d !== slot.d) continue;
        const it = render(p, slot.type);
        if (!it) continue;
        const k = core(e.id, it.stem);
        if (seen.has(k) || seenStems.has(it.stem)) continue;
        seen.add(k); fam[e.id] = (fam[e.id] ?? 0) + 1;
        return { ...it, ch: t.ch, part: t.part, family: e.id };
      }
      return null;
    };
    for (let i = 0; i < slots.length; i++) {
      let q = tryFill(slots[i]);
      // If no engine of this chapter can make this kind of question, swap the type (then the skill) with a later
      // slot, so the totals stay exact.
      for (let j = i + 1; !q && j < slots.length; j++) {
        if (slots[j].type !== slots[i].type) { [slots[i].type, slots[j].type] = [slots[j].type, slots[i].type]; q = tryFill(slots[i]); if (!q) [slots[i].type, slots[j].type] = [slots[j].type, slots[i].type]; }
      }
      for (let j = i + 1; !q && j < slots.length; j++) {
        if (slots[j].skill !== slots[i].skill) { [slots[i].skill, slots[j].skill] = [slots[j].skill, slots[i].skill]; q = tryFill(slots[i]); if (!q) [slots[i].skill, slots[j].skill] = [slots[j].skill, slots[i].skill]; }
      }
      if (!q) throw new Error(`Help-book set ${t.key}: could not fill a ${slots[i].type} ${slots[i].skill} level-${slots[i].d} question`);
      made.push(q);
    }
    const order = ["MCQ", "TRUE_FALSE", "FILL_BLANK", "NUMERIC"];
    made.sort((a, b) => a.d - b.d || order.indexOf(a.type) - order.indexOf(b.type));
    (out[t.cls] ??= []).push(...made.map((q, i) => ({ ...q, ref: `Think, Play & Solve Help Book (new edition), Class ${t.cls} · ${t.part === "AI" ? "AI Chapter" : "Chapter"} ${t.ch} · ${t.part === "AI" ? "Practice" : "More practice"} Q${i + 1}` })));
  }
  return out;
}
