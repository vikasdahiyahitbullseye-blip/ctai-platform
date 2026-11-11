// Yearly teaching plan: CBSE hours → 40-minute periods → chapter-wise allocation → period-by-period schedule.
// Pure functions (no database) so the plan is easy to test and to rebuild when a chapter's periods change.
//
// CBSE CT & AI Curriculum 2026-27 §3.4 and §10.2:
//   Classes 3–5: 50 hours a year, integrated into Mathematics and TWAU (EVS).
//   Classes 6–8: 100 hours a year = 40 h Advanced CT + 20 h AI (5 h per AI chapter) + 40 h projects (2 × 20 h).
// Projects in Classes 6–8 run outside the timetable here, so the in-class plan covers 60 hours.

export const PERIOD_MIN = 40;
export const RESERVED_PERIODS = 5; // orientation + (revision + term exam) × 2

export type Part = "CT" | "AI" | "EVS";
export type PlanChapter = { key: string; part: Part; number: number; title: string };
export type LessonKind = "ORIENTATION" | "INTRODUCE" | "EXPLORE" | "PRACTISE" | "ACTIVITY" | "CHECK" | "REVISION" | "TERM_EXAM";

export function budget(classLevel: number) {
  if (classLevel <= 5) return { hours: 50, periods: periodsFor(50), ctHours: 50, aiHours: 0, projectHours: 0 };
  return { hours: 60, periods: periodsFor(60), ctHours: 40, aiHours: 20, projectHours: 40 };
}
export const periodsFor = (hours: number) => Math.round((hours * 60) / PERIOD_MIN);
export function formatHours(periods: number) {
  const mins = periods * PERIOD_MIN;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Split `total` across weights with largest-remainder rounding; every share is at least `min`. */
export function apportion(total: number, weights: number[], min = 1): number[] {
  if (!weights.length) return [];
  const free = total - min * weights.length;
  if (free < 0) throw new Error(`Cannot give ${weights.length} chapters at least ${min} period(s) each from ${total}.`);
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (w / sum) * free);
  const out = raw.map((r) => Math.floor(r) + min);
  let left = total - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, f: r - Math.floor(r) })).sort((a, b) => b.f - a.f || a.i - b.i);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) out[order[k].i]++;
  return out;
}

/**
 * Default periods per chapter. CBSE does not set per-chapter hours for CT, so CT chapters share the CT periods
 * equally and EVS (TWAU) themes get 60% of a CT chapter. AI chapters get CBSE's 5 hours each (7–8 periods).
 */
export function defaultPeriods(classLevel: number, chapters: PlanChapter[]): Record<string, number> {
  const b = budget(classLevel);
  const out: Record<string, number> = {};
  if (classLevel <= 5) {
    const list = chapters.filter((c) => c.part !== "AI");
    apportion(b.periods - RESERVED_PERIODS, list.map((c) => (c.part === "EVS" ? 0.6 : 1))).forEach((p, i) => (out[list[i].key] = p));
  } else {
    const ai = chapters.filter((c) => c.part === "AI");
    const ct = chapters.filter((c) => c.part === "CT");
    apportion(periodsFor(b.aiHours), ai.map(() => 1)).forEach((p, i) => (out[ai[i].key] = p));
    apportion(periodsFor(b.ctHours) - RESERVED_PERIODS, ct.map(() => 1)).forEach((p, i) => (out[ct[i].key] = p));
  }
  return out;
}

/** The academic year (April–February). Weeks with CT/AI teaching in each month; June is the summer break. */
export const CALENDAR: { month: string; weeks: number }[] = [
  { month: "April", weeks: 4 }, { month: "May", weeks: 2 }, { month: "July", weeks: 4 }, { month: "August", weeks: 4 },
  { month: "September", weeks: 3 }, { month: "October", weeks: 3 }, { month: "November", weeks: 4 }, { month: "December", weeks: 3 },
  { month: "January", weeks: 4 }, { month: "February", weeks: 3 },
];
export const TERM1_MONTHS = ["April", "May", "July", "August", "September"];
/** Months with a monthly assessment: every teaching month except the two term-exam months. */
export const MONTHLY_MONTHS = ["April", "May", "July", "August", "October", "November", "December", "January"];

const weeksIn = (months: string[]) => CALENDAR.filter((c) => months.includes(c.month)).reduce((a, c) => a + c.weeks, 0);
function monthOfWeek(week: number) {
  let w = week;
  for (const c of CALENDAR) {
    if (w <= c.weeks) return c.month;
    w -= c.weeks;
  }
  return CALENDAR[CALENDAR.length - 1].month;
}

/** Teaching order split into two terms. EVS themes are spread between CT chapters; AI chapters 1–2 go in term 1, 3–4 in term 2. */
export function termOrder(classLevel: number, chapters: PlanChapter[], periods: Record<string, number>) {
  const ct = chapters.filter((c) => c.part === "CT").sort((a, b) => a.number - b.number);
  const half = (list: PlanChapter[]) => {
    const total = list.reduce((a, c) => a + periods[c.key], 0);
    let acc = 0, cut = 0;
    for (const [i, c] of list.entries()) { acc += periods[c.key]; if (acc * 2 >= total) { cut = i + 1; break; } }
    return [list.slice(0, cut), list.slice(cut)];
  };
  if (classLevel <= 5) {
    const evs = chapters.filter((c) => c.part === "EVS").sort((a, b) => a.number - b.number);
    const merged: PlanChapter[] = [];
    let e = 0;
    ct.forEach((c, i) => {
      merged.push(c);
      while (e < evs.length && Math.round(((e + 1) * ct.length) / (evs.length + 1)) === i + 1) merged.push(evs[e++]);
    });
    while (e < evs.length) merged.push(evs[e++]);
    return half(merged);
  }
  const ai = chapters.filter((c) => c.part === "AI").sort((a, b) => a.number - b.number);
  const [c1, c2] = half(ct);
  const aiCut = Math.ceil(ai.length / 2);
  return [[...c1, ...ai.slice(0, aiCut)], [...c2, ...ai.slice(aiCut)]];
}

/** What each period of a chapter is for, given how many periods the chapter has. */
export function chapterKinds(n: number, part: Part): LessonKind[] {
  if (n <= 0) return [];
  if (n === 1) return ["INTRODUCE"];
  if (n === 2) return ["INTRODUCE", "PRACTISE"];
  if (n === 3) return ["INTRODUCE", "ACTIVITY", "CHECK"];
  if (n === 4) return ["INTRODUCE", "ACTIVITY", "PRACTISE", "CHECK"];
  const first: LessonKind[] = part === "AI" ? ["INTRODUCE", "EXPLORE", "ACTIVITY"] : ["INTRODUCE", "EXPLORE", "PRACTISE"];
  const middle: LessonKind[] = [];
  const cycle: LessonKind[] = part === "AI" ? ["PRACTISE", "EXPLORE", "ACTIVITY"] : ["ACTIVITY", "PRACTISE", "EXPLORE"];
  for (let i = 0; first.length + middle.length + 1 < n; i++) middle.push(cycle[i % cycle.length]);
  return ([...first, ...middle, "CHECK"] as LessonKind[]).slice(0, n);
}

export type Slot = { number: number; kind: LessonKind; chapterKey?: string; seq?: number; of?: number; term: 1 | 2; week: number; month: string };

/** The full period-by-period schedule for a class. */
export function schedule(classLevel: number, chapters: PlanChapter[], periods: Record<string, number>): Slot[] {
  const [t1, t2] = termOrder(classLevel, chapters, periods);
  const seq = (list: PlanChapter[]) => list.flatMap((c) => chapterKinds(periods[c.key], c.part).map((kind, i) => ({ kind, chapterKey: c.key, seq: i + 1, of: periods[c.key] })));
  const term1: Omit<Slot, "number" | "week" | "month" | "term">[] = [{ kind: "ORIENTATION" }, ...seq(t1), { kind: "REVISION" }, { kind: "TERM_EXAM" }];
  const term2: Omit<Slot, "number" | "week" | "month" | "term">[] = [...seq(t2), { kind: "REVISION" }, { kind: "TERM_EXAM" }];
  const w1 = weeksIn(TERM1_MONTHS), w2 = weeksIn(CALENDAR.map((c) => c.month)) - w1;
  const place = (list: typeof term1, term: 1 | 2, startWeek: number, weeks: number, offset: number): Slot[] =>
    list.map((s, i) => {
      const week = startWeek + Math.min(weeks - 1, Math.floor((i * weeks) / list.length));
      return { ...s, number: offset + i + 1, term, week, month: monthOfWeek(week) };
    });
  const a = place(term1, 1, 1, w1, 0);
  return [...a, ...place(term2, 2, w1 + 1, w2, a.length)];
}

export const KIND_LABEL: Record<LessonKind, string> = {
  ORIENTATION: "Getting started", INTRODUCE: "Introduce", EXPLORE: "Explore", PRACTISE: "Practise", ACTIVITY: "Hands-on activity",
  CHECK: "Chapter check", REVISION: "Revision", TERM_EXAM: "Term exam",
};
