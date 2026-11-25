// "More practice" sets for the new help-book edition (Classes 3–8, CT chapters): 20 questions per chapter with
// exactly 7 Easy, 7 Medium and 6 Hard; 5 per CBSE skill; 12 multiple choice, 3 true/false, 3 fill-in, 2 numeric;
// at least 10 with a picture; at most 2 from one engine and no repeated problem. The same questions go into the
// platform bank (sourceRef "… · More practice Qn"), so the bank checks re-solve them too.
import type { SeedQuestion } from "../../types";
import { R, NAMES } from "../util";
import { type D, type QType, render } from "./core";
import { themes } from "./themes";
import { enginesFor } from "./index";

export const BOOK_PER_CHAPTER = 20;
const D_PLAN: D[] = [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3];
const SKILL_PLAN = ["ABSTRACT", "PATTERN", "DECOMPOSITION", "ALGORITHMIC"];
const TYPE_PLAN: QType[] = [...Array(12).fill("MCQ"), "TRUE_FALSE", "TRUE_FALSE", "TRUE_FALSE", "FILL_BLANK", "FILL_BLANK", "FILL_BLANK", "NUMERIC", "NUMERIC"];

function hash(s: string) { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }
const shuffle = <T,>(a: T[], r: () => number) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const NAME_RE = new RegExp(`\\b(${NAMES.join("|")})('s)?\\b`, "g");
/** A problem without its names and setting, to spot the same problem told twice. */
const core = (family: string, stem: string) => `${family}|${stem.replace(NAME_RE, "X").replace(/ (in|at|on) the [^.,:]+/g, "").slice(0, 160)}`;

export type BookQuestion = SeedQuestion & { ref: string };

export function generateBookSets(seenStems: Set<string> = new Set()): Record<number, BookQuestion[]> {
  const out: Record<number, BookQuestion[]> = {};
  for (const t of themes().filter((x) => x.part === "CT")) {
    const r = R(hash(`book:${t.key}`));
    const ctx = { cls: t.cls, theme: t, r };
    // 20 slots: difficulty × skill × type, each list spread evenly; at least 10 slots ask for a picture.
    const skills = shuffle(SKILL_PLAN.flatMap((s) => Array(5).fill(s) as string[]), r);
    const types = shuffle(TYPE_PLAN, r);
    const slots = D_PLAN.map((d, i) => ({ d, skill: skills[i], type: types[i], pic: i % 2 === 0 }));
    const fam: Record<string, number> = {}, seen = new Set<string>(), made: SeedQuestion[] = [];
    const tryFill = (slot: (typeof slots)[number]): SeedQuestion | null => {
      for (let a = 0; a < 300; a++) {
        const strict = a < 220;
        const capLoose = Math.max(3, Math.ceil(5 / Math.max(1, enginesFor(t, slot.skill).length)) + 1);
        let engines = enginesFor(t, slot.skill).filter((e) => (fam[e.id] ?? 0) < (strict ? 2 : capLoose));
        if (slot.pic && strict && engines.some((e) => e.pic !== "never")) engines = engines.filter((e) => e.pic !== "never");
        if (!engines.length) { if (strict) { a = 219; continue; } return null; }
        const e = engines[Math.floor(r() * engines.length)];
        const p = e.make(ctx, slot.d, slot.pic);
        if (!p || p.d !== slot.d) continue;
        const it = render(p, slot.type);
        if (!it) continue;
        const k = core(e.id, it.stem);
        if (seen.has(k) || seenStems.has(it.stem)) continue;
        seen.add(k); fam[e.id] = (fam[e.id] ?? 0) + 1;
        return { ...it, ch: t.ch, part: "CT", family: e.id };
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
    (out[t.cls] ??= []).push(...made.map((q, i) => ({ ...q, ref: `Think, Play & Solve Help Book (new edition), Class ${t.cls} · Chapter ${t.ch} · More practice Q${i + 1}` })));
  }
  return out;
}
