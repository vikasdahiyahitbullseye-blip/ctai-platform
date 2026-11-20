// Balanced top-up of the live question bank (see core.ts). For each chapter it looks at what the live bank already
// has and adds questions until:
//   • Easy, Medium and Hard have the same number of questions (at least 40 each, so 120+ per chapter);
//   • every skill of the chapter has its equal share (CT: the four CBSE skills; AI: AI concepts, data, ethics);
//   • True/False, Fill-in-the-blank and Numeric questions each reach a minimum (the rest are 4-option MCQs, as in
//     the CBSE handbooks);
//   • at least 45% of the chapter's questions have a picture (40% in AI chapters).
import type { SeedQuestion } from "../../types";
import { R } from "../util";
import { type D, type Engine, type QType, type Theme, render, supports } from "./core";
import { themes } from "./themes";
import { PATTERN_ENGINES } from "./pattern";
import { ABSTRACT_ENGINES } from "./abstract";
import { DECOMP_ENGINES } from "./decompose";
import { ALGO_ENGINES } from "./algorithm";
import { AI_ENGINES, aiShort } from "./ai";

export const ENGINES: Engine[] = [...PATTERN_ENGINES, ...ABSTRACT_ENGINES, ...DECOMP_ENGINES, ...ALGO_ENGINES, ...AI_ENGINES];
export const CT_SKILLS = ["ABSTRACT", "PATTERN", "DECOMPOSITION", "ALGORITHMIC"];
export const AI_SKILLS = ["AI_CONCEPT", "DATA", "ETHICS"];
export const MIN_PER_LEVEL = 40;
export const TYPE_MIN: Record<string, number> = { TRUE_FALSE: 16, FILL_BLANK: 16, NUMERIC: 14 };
export const PIC_SHARE: Record<"CT" | "AI", number> = { CT: 0.45, AI: 0.4 };
export const SHORT_MIN = 10;

export type ChapterStats = { d: Record<number, number>; skills: Record<string, number>; types: Record<string, number>; pics: number; short: number };

function hash(s: string) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

export const enginesFor = (t: Theme, skill?: string) =>
  ENGINES.filter((e) => (e.part ?? "CT") === t.part && (!skill || e.skill === skill) && (e.tags.includes("any") || e.tags.some((x) => t.tags.includes(x))) && (e.min ?? 0) <= t.cls && (e.max ?? 99) >= t.cls);

/** New questions for every chapter, given what each chapter already has (`have`, keyed "<class>-<part>-<chapter>"). */
export function generateBalanced(have: Record<string, ChapterStats>): Record<number, SeedQuestion[]> {
  const out: Record<number, SeedQuestion[]> = {};
  for (const t of themes()) {
    const st: ChapterStats = structuredClone(have[t.key] ?? { d: {}, skills: {}, types: {}, pics: 0, short: 0 });
    const skills = t.part === "AI" ? AI_SKILLS : CT_SKILLS;
    const level = Math.max(MIN_PER_LEVEL, ...[1, 2, 3].map((d) => st.d[d] ?? 0));
    const total = level * 3;
    const perSkill = Math.ceil(total / skills.length);
    const picTarget = Math.ceil(total * PIC_SHARE[t.part]);
    const r = R(hash(`v3:${t.key}`));
    const ctx = { cls: t.cls, theme: t, r };
    const seen = new Set<string>();
    const list: SeedQuestion[] = [];
    const turn: Record<string, number> = {};
    const used: Record<string, number> = {};
    const cap = Math.max(8, Math.ceil(total * 0.12));
    const count = (q: Omit<SeedQuestion, "ch" | "part">) => {
      st.d[q.d] = (st.d[q.d] ?? 0) + 1;
      for (const s of q.skills) st.skills[s] = (st.skills[s] ?? 0) + 1;
      st.types[q.type] = (st.types[q.type] ?? 0) + 1;
      if (q.figure || q.optionFigures) st.pics++;
    };
    const deficit = () => ({
      d: ([1, 2, 3] as D[]).map((d) => [d, level - (st.d[d] ?? 0)] as const).filter(([, n]) => n > 0),
      s: skills.map((s) => [s, perSkill - (st.skills[s] ?? 0)] as const).filter(([, n]) => n > 0),
      t: Object.entries(TYPE_MIN).map(([k, n]) => [k, n - (st.types[k] ?? 0)] as const).filter(([, n]) => n > 0),
      pic: picTarget - st.pics,
    });
    for (let guard = 0; guard < 2000; guard++) {
      const def = deficit();
      if (!def.d.length && !def.s.length && !def.t.length && def.pic <= 0) break;
      // Which difficulty, skill and type are furthest behind?
      const d = (def.d.length ? [...def.d].sort((a, b) => b[1] - a[1])[0][0] : ([1, 2, 3] as D[])[guard % 3]) as D;
      const skill = def.s.length ? [...def.s].sort((a, b) => b[1] - a[1] || (r() < 0.5 ? -1 : 1))[0][0] : skills[guard % skills.length];
      // Spread the type minimums over the questions still to be made.
      const slots = Math.max(1, def.d.reduce((a, [, n]) => a + n, 0), def.s.reduce((a, [, n]) => a + n, 0));
      const tNeed = def.t.reduce((a, [, n]) => a + n, 0);
      const want: QType = def.t.length && r() < tNeed / slots ? ([...def.t].sort((a, b) => b[1] - a[1])[0][0] as QType) : "MCQ";
      const wantPic = def.pic > 0;
      let engines = enginesFor(t, skill).filter((e) => (used[e.id] ?? 0) < cap);
      if (!engines.length) engines = enginesFor(t, skill);
      if (wantPic && engines.some((e) => e.pic !== "never")) engines = engines.filter((e) => e.pic !== "never");
      if (!engines.length) engines = enginesFor(t);
      let made = false;
      for (let a = 0; a < 60 && !made; a++) {
        const typeOrder: QType[] = want === "MCQ" || a < 40 ? [want] : [want, "MCQ"];
        const k = `${skill}`;
        turn[k] = (turn[k] ?? 0) + 1;
        const e = engines[(turn[k] + Math.floor(r() * engines.length)) % engines.length];
        const p = e.make(ctx, d, wantPic);
        if (!p || p.d !== d) continue;
        for (const ty of typeOrder) {
          if (!supports(p, ty)) continue;
          const q = render(p, ty);
          if (!q) continue;
          const key = `${q.type}|${q.stem}|${[...(q.options ?? [])].sort().join("|")}`;
          if (seen.has(key)) continue;
          seen.add(key);
          count(q);
          list.push({ ...q, ch: t.ch, part: t.part, family: e.id });
          used[e.id] = (used[e.id] ?? 0) + 1;
          made = true;
          break;
        }
      }
    }
    // Short answers (teacher-marked) for AI chapters, as in the CBSE exercises.
    if (t.part === "AI") {
      for (let i = 0, guard = 0; st.short + i < SHORT_MIN + 2 && guard < 200; guard++) {
        const s = aiShort(ctx);
        const stem = `${s.stem}`;
        if (seen.has(stem)) continue;
        seen.add(stem);
        list.push({ ch: t.ch, part: "AI", skills: s.skills, type: "SHORT", d: 2, stem, answer: [s.model], solution: `Model answer: ${s.model}`, family: "v3-ai-short" });
        i++;
      }
    }
    (out[t.cls] ??= []).push(...list);
  }
  return out;
}
