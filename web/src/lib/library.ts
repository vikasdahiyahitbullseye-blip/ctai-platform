// Builds the Hitbullseye content library and yearly plan for one class from the question bank and the
// learning-module content: modules, video scripts, chapter tests, worksheets, assignments, monthly
// assessments, term papers, full-length practice papers, activity kits and the period-by-period plan.
// Idempotent: items are upserted by code, so uploaded videos and teachers' progress are kept on a rebuild.
import type { PrismaClient } from "@prisma/client";
import { MODULES, type ModuleData } from "../../prisma/content/library";
import { generatePaper, type PoolItem } from "./generator";
import { apportion, budget, defaultPeriods, schedule, MONTHLY_MONTHS, KIND_LABEL, type PlanChapter, type Slot, type Part } from "./plan";

export const LIBRARY_TARGETS = { WORKSHEET: 40, ASSIGNMENT: 24, MONTHLY: 8, TERM: 2, MOCK: 4, VIDEO: 20, KITS: 12, PRACTICE: 600 } as const;

export const LIB_LABEL: Record<string, string> = {
  CHAPTER_TEST: "Chapter test", WORKSHEET: "Worksheet", ASSIGNMENT: "Assignment", MONTHLY: "Monthly assessment", TERM: "Term examination paper", MOCK: "Full-length practice paper",
};

type Ref = { type: "MODULE" | "VIDEO" | "TEST" | "WORKSHEET" | "ASSIGNMENT" | "MONTHLY" | "TERM" | "MOCK" | "KIT"; id: string; label: string };
type Chap = PlanChapter & { id: string; periods: number; mod: ModuleData };

const pad = (n: number) => String(n).padStart(2, "0");
const chCode = (c: { part: string; number: number }) => `${c.part}-${pad(c.number)}`;
function hash(s: string) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}
// Order matters: a chapter with n worksheets gets the first n kinds.
const WORKSHEET_KINDS = [
  { name: "Practice", mix: { 1: 30, 2: 50, 3: 20 }, picture: false },
  { name: "Picture puzzles", mix: { 1: 30, 2: 40, 3: 30 }, picture: true },
  { name: "Challenge", mix: { 1: 0, 2: 40, 3: 60 }, picture: false },
  { name: "Warm-up", mix: { 1: 70, 2: 30, 3: 0 }, picture: false },
  { name: "Mixed practice", mix: { 1: 30, 2: 50, 3: 20 }, picture: false },
];
const TASKS = (c: Chap) => [
  { title: "At-home task", prompt: c.mod.home, responseType: "ANY", marks: 4 },
  { title: "Reflection journal", prompt: `Write 3–4 sentences about "${c.title}": What did you learn? What was hard at first? Where could you use this outside school?`, responseType: "TEXT", marks: 3 },
  { title: "Teach it back", prompt: `Explain one idea from "${c.title}" to someone at home using your own example. Write (or record) what you said and one question they asked.`, responseType: "ANY", marks: 3 },
];

/** Markdown body of a learning module. Worked example and Try-it questions are added by the module page from `meta`. */
export function moduleMarkdown(m: ModuleData) {
  return [
    `## What you will learn`, m.o.map((x) => `- ${x}`).join("\n"),
    `## Think about it`, m.hook,
    `## Key ideas`, m.ideas.map((x) => `- ${x}`).join("\n"),
    `## Key words`, ["| Word | Meaning |", "|---|---|", ...m.terms.map(([t, d]) => `| **${t}** | ${d} |`)].join("\n"),
    `## Watch out!`, m.mistake,
    `## Activity: ${m.kit.t}`, `${m.kit.steps.map(([t, s], i) => `${i + 1}. **${t}:** ${s}`).join("\n")}`, `**You will make:** ${m.kit.out}`,
    `## At home`, m.home,
    `## Check yourself`, m.o.map((x) => `- ${x}`).join("\n"),
  ].join("\n\n");
}

type Scene = { title: string; seconds: number; onScreen: string; narration: string };
/** A 3–4 minute concept video storyboard built from the module and two bank questions. */
export function videoScenes(kind: "concept" | "examples", c: { title: string; mod: ModuleData }, ex: { stem: string; solution: string }[]): Scene[] {
  const m = c.mod;
  if (kind === "concept") {
    return [
      { title: "Hook", seconds: 30, onScreen: `Title card: "${c.title}". Then show the hook as a short animated question.`, narration: m.hook },
      { title: "Big idea", seconds: 60, onScreen: "Animate each key idea as a card with a simple picture.", narration: m.ideas.join(" ") },
      { title: "Worked example", seconds: 60, onScreen: `Show the question: ${ex[0]?.stem.replace(/\*\*/g, "") ?? "a chapter example"}. Reveal each step.`, narration: ex[0]?.solution ?? "Solve a chapter example step by step." },
      { title: "Your turn", seconds: 25, onScreen: `Pause card: "Pause the video and try this!" ${ex[1]?.stem.replace(/\*\*/g, "") ?? ""}`, narration: "Pause the video and try this one yourself. Then press play to check." },
      { title: "Check", seconds: 25, onScreen: "Show the answer with one highlighted step.", narration: ex[1]?.solution ?? "Check your answer step by step." },
      { title: "Recap", seconds: 20, onScreen: `Key words: ${m.terms.map(([t]) => t).join(", ")}. Watch out: ${m.mistake}`, narration: `Remember the key words: ${m.terms.map(([t, d]) => `${t}, ${d.toLowerCase()}`).join("; ")}.` },
    ];
  }
  return [
    { title: "Introduction", seconds: 20, onScreen: `Title card: "${c.title}: worked examples".`, narration: `In this video we solve problems from ${c.title} step by step.` },
    ...ex.slice(0, 2).flatMap((q, i) => [
      { title: `Example ${i + 1}`, seconds: 50, onScreen: `Show: ${q.stem.replace(/\*\*/g, "")}`, narration: "Read the question carefully. What do we know? What do we need to find?" },
      { title: `Solution ${i + 1}`, seconds: 50, onScreen: "Reveal the working one step at a time.", narration: q.solution },
    ]),
    { title: "Common mistake", seconds: 30, onScreen: "Show a wrong answer with a red cross, then the fix.", narration: m.mistake },
    { title: "Recap", seconds: 20, onScreen: `Checklist: ${m.o.join(" / ")}`, narration: "Practise with the worksheet to make these steps automatic." },
  ];
}
export function scenesMarkdown(scenes: Scene[]) {
  const total = scenes.reduce((a, s) => a + s.seconds, 0);
  return [`**Length:** about ${Math.round(total / 60)} min (${total} s) · **Format:** narrated animation or teacher-recorded screen`,
    ...scenes.map((s, i) => `### Scene ${i + 1}: ${s.title} (${s.seconds} s)\n\n**On screen:** ${s.onScreen}\n\n**Narration:** ${s.narration}`)].join("\n\n");
}

/** Builds (or rebuilds) everything for one class. Returns counts per item type. */
export async function buildClassLibrary(db: PrismaClient, cls: number) {
  const chapterRows = await db.chapter.findMany({ where: { classLevel: cls }, orderBy: [{ part: "asc" }, { number: "asc" }] });
  const plain: PlanChapter[] = chapterRows.map((c) => ({ key: `${cls}-${c.part}-${c.number}`, part: c.part as Part, number: c.number, title: c.title }));
  const defaults = defaultPeriods(cls, plain);
  for (const c of chapterRows) {
    if (c.periods == null) await db.chapter.update({ where: { id: c.id }, data: { periods: defaults[`${cls}-${c.part}-${c.number}`] } });
  }
  const chapters: Chap[] = chapterRows.map((c) => {
    const key = `${cls}-${c.part}-${c.number}`;
    return { key, id: c.id, part: c.part as Part, number: c.number, title: c.title, periods: c.periods ?? defaults[key], mod: MODULES[key] };
  });
  const byKey = new Map(chapters.map((c) => [c.key, c]));
  const periods = Object.fromEntries(chapters.map((c) => [c.key, c.periods]));
  const slots = schedule(cls, chapters, periods);

  const qs = await db.question.findMany({ where: { classLevel: cls, status: "PUBLISHED", isPuzzle: false, type: { not: "SHORT" }, source: { not: "CBSE" } }, select: { id: true, chapterId: true, skills: true, type: true, difficulty: true, marks: true, stem: true, solution: true, figure: true, optionFigures: true, source: true } });
  const pool: (PoolItem & { stem: string; solution: string; pic: boolean; authored: boolean })[] = qs.map((q) => ({ id: q.id, chapterId: q.chapterId, skills: q.skills.split(","), type: q.type, difficulty: q.difficulty, marks: q.marks, stem: q.stem, solution: q.solution, pic: !!(q.figure || q.optionFigures), authored: q.source !== "GENERATED" }));
  const inCh = (id: string) => pool.filter((q) => q.chapterId === id);
  const small = cls <= 5;

  // ---------- Assessments (rebuilt from scratch: they hold no user data) ----------
  await db.assessment.deleteMany({ where: { classLevel: cls, libType: { not: null } } });
  const makeSet = async (data: { libType: string; code: string; title: string; chapterId?: string; coverage: string[]; count: number; mix: { 1: number; 2: number; 3: number }; durationMin: number; instructions: string; avoid?: string[]; picture?: boolean; order: number; tasks?: { title: string; prompt: string; responseType: string; marks: number }[]; sections?: boolean }) => {
    let source = pool.filter((q) => data.coverage.includes(q.chapterId));
    if (data.picture) { const pics = source.filter((q) => q.pic); if (pics.length >= Math.min(6, data.count)) source = pics; }
    const gen = generatePaper(source, { chapterIds: data.coverage, count: data.count, difficultyMix: data.mix, avoidIds: data.avoid, seed: hash(data.code) });
    const a = await db.assessment.create({
      data: {
        kind: "LIBRARY", libType: data.libType, code: data.code, title: data.title, classLevel: cls, chapterId: data.chapterId, libOrder: data.order,
        coverage: JSON.stringify(data.coverage), durationMin: data.durationMin, instructions: data.instructions,
        items: { create: gen.items.map((q, i) => ({ questionId: q.id, position: i + 1, marks: q.marks, section: data.sections && q.difficulty === 3 ? "B" : "A" })) },
        ...(data.tasks ? { tasks: { create: data.tasks.map((t, i) => ({ ...t, position: i + 1 })) } } : {}),
      },
    });
    return { id: a.id, items: gen.items.map((q) => q.id) };
  };

  const tests = new Map<string, Ref>();
  const worksheets = new Map<string, Ref[]>();
  const assignments = new Map<string, Ref[]>();
  let order = 0;
  for (const c of chapters) {
    const t = await makeSet({ libType: "CHAPTER_TEST", code: `C${cls}-${chCode(c)}-TEST`, title: `Chapter test: ${c.title}`, chapterId: c.id, coverage: [c.id], count: small ? 10 : 12, mix: { 1: 40, 2: 40, 3: 20 }, durationMin: small ? 25 : 30, instructions: "Answer all questions. Show your working where you can.", order: order++ });
    tests.set(c.key, { type: "TEST", id: t.id, label: `Chapter test: ${c.title}` });
  }
  const wsCount = apportion(LIBRARY_TARGETS.WORKSHEET, chapters.map((c) => c.periods), 1);
  for (const [i, c] of chapters.entries()) {
    const used: string[] = [];
    const list: Ref[] = [];
    for (let k = 0; k < wsCount[i]; k++) {
      const kind = WORKSHEET_KINDS[k % WORKSHEET_KINDS.length];
      const w = await makeSet({ libType: "WORKSHEET", code: `C${cls}-${chCode(c)}-WS${k + 1}`, title: `Worksheet ${k + 1} · ${kind.name}: ${c.title}`, chapterId: c.id, coverage: [c.id], count: small || kind.picture ? 8 : 10, mix: kind.mix, picture: kind.picture, durationMin: small ? 20 : 25, instructions: `${kind.name} worksheet. Work on your own, then check with a partner.`, avoid: used, order: order++ });
      used.push(...w.items);
      list.push({ type: "WORKSHEET", id: w.id, label: `Worksheet ${k + 1} · ${kind.name}` });
    }
    worksheets.set(c.key, list);
  }
  const hwCount = apportion(LIBRARY_TARGETS.ASSIGNMENT, chapters.map((c) => c.periods), 1);
  for (const [i, c] of chapters.entries()) {
    const list: Ref[] = [];
    for (let k = 0; k < hwCount[i]; k++) {
      const task = TASKS(c)[k % 3];
      const a = await makeSet({ libType: "ASSIGNMENT", code: `C${cls}-${chCode(c)}-HW${k + 1}`, title: `Assignment ${k + 1}: ${c.title}`, chapterId: c.id, coverage: [c.id], count: 6, mix: { 1: 30, 2: 50, 3: 20 }, durationMin: 30, instructions: "Do the questions online or on paper, and complete the task.", order: order++, tasks: [task] });
      list.push({ type: "ASSIGNMENT", id: a.id, label: `Assignment ${k + 1}: ${c.title}` });
    }
    assignments.set(c.key, list);
  }
  const monthly = new Map<string, Ref>();
  for (const [i, month] of MONTHLY_MONTHS.entries()) {
    const keys = [...new Set(slots.filter((s) => s.month === month && s.chapterKey).map((s) => s.chapterKey!))];
    if (!keys.length) continue;
    const m = await makeSet({ libType: "MONTHLY", code: `C${cls}-MONTHLY-${pad(i + 1)}`, title: `Monthly assessment ${i + 1} (${month})`, coverage: keys.map((k) => byKey.get(k)!.id), count: small ? 12 : 15, mix: { 1: 35, 2: 45, 3: 20 }, durationMin: small ? 35 : 40, instructions: `Covers: ${keys.map((k) => byKey.get(k)!.title).join(", ")}.`, order: order++ });
    monthly.set(month, { type: "MONTHLY", id: m.id, label: `Monthly assessment ${i + 1} (${month})` });
  }
  const termKeys = [1, 2].map((t) => [...new Set(slots.filter((s) => s.term === t && s.chapterKey).map((s) => s.chapterKey!))]);
  const term: Ref[] = [];
  const mocks: Ref[][] = [[], []];
  for (const t of [1, 2]) {
    const coverage = termKeys[t - 1].map((k) => byKey.get(k)!.id);
    const covered = `Covers: ${termKeys[t - 1].map((k) => byKey.get(k)!.title).join(", ")}.`;
    const p = await makeSet({ libType: "TERM", code: `C${cls}-TERM-${t}`, title: `Term ${t} examination`, coverage, count: small ? 25 : 30, mix: { 1: 35, 2: 45, 3: 20 }, durationMin: small ? 50 : 60, instructions: `Section A: answer all questions. Section B: challenge questions. ${covered}`, order: order++, sections: true });
    term.push({ type: "TERM", id: p.id, label: `Term ${t} examination` });
    let avoid = [...p.items];
    for (const k of [1, 2]) {
      const n = (t - 1) * 2 + k;
      const mock = await makeSet({ libType: "MOCK", code: `C${cls}-MOCK-${n}`, title: `Full-length practice paper ${n} (Term ${t})`, coverage, count: small ? 25 : 30, mix: { 1: 35, 2: 45, 3: 20 }, durationMin: small ? 50 : 60, instructions: `Practise under exam conditions. ${covered}`, avoid, order: order++, sections: true });
      avoid = [...avoid, ...mock.items];
      mocks[t - 1].push({ type: "MOCK", id: mock.id, label: `Full-length practice paper ${n}` });
    }
  }

  // ---------- Modules, videos and activity kits (upserted: keep uploads and edits to media) ----------
  const modules = new Map<string, Ref>();
  const videos = new Map<string, Ref[]>();
  const kits = new Map<string, Ref>();
  const vidCount = apportion(LIBRARY_TARGETS.VIDEO, chapters.map((c) => c.periods), chapters.length <= LIBRARY_TARGETS.VIDEO ? 1 : 0);
  for (const [i, c] of chapters.entries()) {
    const qsCh = inCh(c.id);
    const pickBy = (d: number, n: number, salt: string) => qsCh.filter((q) => q.difficulty === d && !q.pic).sort((a, b) => hash(a.id + salt) - hash(b.id + salt)).slice(0, n);
    const example = [...pickBy(2, 1, "ex"), ...pickBy(1, 1, "ex")][0] ?? qsCh[0];
    const tryIds = [pickBy(1, 1, "try")[0], pickBy(2, 1, "try2")[0], qsCh.filter((q) => q.pic).sort((a, b) => hash(a.id) - hash(b.id))[0] ?? pickBy(3, 1, "try")[0]].filter(Boolean).map((q) => q!.id);
    const code = `C${cls}-${chCode(c)}-MOD`;
    const modData = { kind: "MODULE", audience: "BOTH", classLevel: cls, chapterId: c.id, title: `Learning module: ${c.title}`, description: c.mod.hook, body: moduleMarkdown(c.mod), position: i, meta: JSON.stringify({ exampleId: example?.id, tryIds }) };
    const mod = await db.resource.upsert({ where: { code }, create: { code, ...modData }, update: modData });
    modules.set(c.key, { type: "MODULE", id: mod.id, label: `Learning module: ${c.title}` });

    const vlist: Ref[] = [];
    for (let k = 0; k < vidCount[i]; k++) {
      const kind = k === 0 ? "concept" : "examples";
      const ex = (k === 0 ? [example, pickBy(1, 2, "v")[1] ?? pickBy(2, 2, "v")[1]] : [...pickBy(2, 1, `v${k}`), ...pickBy(3, 1, `v${k}`)]).filter(Boolean) as { stem: string; solution: string }[];
      const scenes = videoScenes(kind, c, ex);
      const vcode = `C${cls}-${chCode(c)}-VID${k + 1}`;
      const title = kind === "concept" ? `Concept video: ${c.title}` : `Worked examples ${k}: ${c.title}`;
      const vData = { kind: "VIDEO", audience: "BOTH", classLevel: cls, chapterId: c.id, title, description: `${Math.round(scenes.reduce((a, s) => a + s.seconds, 0) / 60)}-minute video. Script and storyboard ready; add the recording.`, body: scenesMarkdown(scenes), position: k, meta: JSON.stringify({ scenes }) };
      const v = await db.resource.upsert({ where: { code: vcode }, create: { code: vcode, ...vData }, update: { title: vData.title, body: vData.body, meta: vData.meta, chapterId: c.id, position: k } });
      vlist.push({ type: "VIDEO", id: v.id, label: title });
    }
    videos.set(c.key, vlist);

    const kcode = `A${cls}-${chCode(c)}`;
    const k = c.mod.kit;
    const phases = ["EXPLORE", "CREATE", "PRESENT", "REFLECT"];
    const kitData = {
      classLevel: cls, kind: "ACTIVITY", chapterKey: c.key, title: k.t, emoji: k.e, tagline: `A one-period activity for "${c.title}".`, drivingQuestion: c.mod.hook,
      overview: `${c.mod.o[1]} Materials: ${k.mat}.`, subjects: c.part === "AI" ? "COMPUTER,SCIENCE" : "MATHS", skills: "DECOMPOSITION,ALGORITHMIC", hours: 1, finalProduct: k.out, published: true,
    };
    const existing = await db.projectKit.findUnique({ where: { code: kcode } });
    const kit = existing ? await db.projectKit.update({ where: { code: kcode }, data: kitData }) : await db.projectKit.create({ data: { code: kcode, ...kitData } });
    if (!existing) {
      await db.projectMilestone.createMany({ data: k.steps.map(([title, studentTask, teacherGuide], j) => ({ kitId: kit.id, position: j + 1, phase: phases[Math.min(j, 3)], title, sessions: 1, studentTask, teacherGuide, deliverable: j === k.steps.length - 1 ? k.out : "Notes or a photo of your work", evidence: "ANY" })) });
      await db.rubricCriterion.createMany({ data: ACTIVITY_RUBRIC.map((r, j) => ({ kitId: kit.id, position: j + 1, name: r.name, levels: JSON.stringify(r.levels) })) });
    }
    kits.set(c.key, { type: "KIT", id: kit.id, label: `Activity: ${k.t}` });
  }

  // ---------- The period-by-period plan ----------
  const nextWs = new Map<string, number>();
  const takeWs = (key: string) => { const list = worksheets.get(key)!; const i = nextWs.get(key) ?? 0; nextWs.set(key, i + 1); return list[i]; };
  const lessons = slots.map((s) => ({ slot: s, refs: [] as Ref[], homework: [] as Ref[] }));
  const lastIndexWhere = (pred: (s: Slot) => boolean) => { for (let i = slots.length - 1; i >= 0; i--) if (pred(slots[i])) return i; return -1; };
  for (const L of lessons) {
    const s = L.slot;
    if (!s.chapterKey) continue;
    const c = byKey.get(s.chapterKey)!;
    const vids = videos.get(c.key)!;
    if (s.kind === "INTRODUCE") { L.refs.push(modules.get(c.key)!); if (vids[0]) L.refs.push(vids[0]); }
    if (s.kind === "EXPLORE") { if (vids[1]) L.refs.push(vids[1]); const w = takeWs(c.key); if (w) L.refs.push(w); }
    if (s.kind === "PRACTISE") { const w = takeWs(c.key); if (w) L.refs.push(w); }
    if (s.kind === "ACTIVITY") L.refs.push(kits.get(c.key)!);
    if (s.kind === "CHECK") L.refs.push(tests.get(c.key)!);
    if (s.of && s.of <= 2 && s.seq === s.of) { L.refs.push(kits.get(c.key)!); L.homework.push(tests.get(c.key)!); }
  }
  // Every chapter's remaining worksheets and its assignments go home after its periods (not after a chapter check).
  for (const c of chapters) {
    const idx = lessons.map((L, i) => ({ L, i })).filter(({ L }) => L.slot.chapterKey === c.key);
    if (!idx.length) continue;
    const homeSlots = idx.filter(({ L }) => L.slot.kind !== "CHECK");
    const target = homeSlots.length ? homeSlots : idx;
    // First assignment after the second period (or the only one), the rest after following periods.
    assignments.get(c.key)!.forEach((a, k) => target[Math.min(target.length - 1, target.length > 1 ? k + 1 : 0)].L.homework.push(a));
    for (let w = takeWs(c.key); w; w = takeWs(c.key)) idx[idx.length - 1].L.homework.push({ ...w, label: `${w.label} (extra practice)` });
  }
  for (const [month, ref] of monthly) {
    const i = lastIndexWhere((s) => s.month === month && s.kind !== "TERM_EXAM");
    if (i >= 0) lessons[i].homework.push(ref);
  }
  for (const t of [1, 2]) {
    const rev = lessons.findIndex((L) => L.slot.term === t && L.slot.kind === "REVISION");
    const exam = lessons.findIndex((L) => L.slot.term === t && L.slot.kind === "TERM_EXAM");
    if (rev > 0) lessons[rev - 1].homework.push(mocks[t - 1][0]);
    if (rev >= 0) { lessons[rev].refs.push(mocks[t - 1][1]); }
    if (exam >= 0) lessons[exam].refs.push(term[t - 1]);
  }

  const total = slots.length;
  for (const L of lessons) {
    const s = L.slot;
    const c = s.chapterKey ? byKey.get(s.chapterKey)! : undefined;
    const content = lessonContent(s, c, cls, L.refs);
    const data = { classLevel: cls, number: s.number, chapterId: c?.id ?? null, kind: s.kind, title: content.title, objective: content.objective, flow: content.flow, month: s.month, week: s.week, term: s.term, refs: JSON.stringify(L.refs), homework: JSON.stringify(L.homework) };
    await db.lesson.upsert({ where: { classLevel_number: { classLevel: cls, number: s.number } }, create: data, update: data });
  }
  await db.lesson.deleteMany({ where: { classLevel: cls, number: { gt: total } } });

  return {
    periods: total, budget: budget(cls), chapters: chapters.length, modules: modules.size, videos: [...videos.values()].flat().length, chapterTests: tests.size,
    worksheets: [...worksheets.values()].flat().length, assignments: [...assignments.values()].flat().length, monthly: monthly.size, term: term.length, mocks: mocks.flat().length, kits: kits.size,
  };
}

const ACTIVITY_RUBRIC = [
  { name: "Follows the steps", levels: ["Needed help with most steps", "Followed some steps", "Followed all steps", "Followed all steps and helped others"] },
  { name: "Explains thinking", levels: ["Could not explain", "Explained with help", "Explained clearly", "Explained clearly and gave an example"] },
  { name: "Works with others", levels: ["Worked alone", "Joined in sometimes", "Shared ideas and listened", "Led the group fairly"] },
];

function lessonContent(s: Slot, c: Chap | undefined, cls: number, refs: Ref[]) {
  const label = (t: Ref["type"]) => refs.find((r) => r.type === t)?.label;
  if (!c) {
    if (s.kind === "ORIENTATION") return {
      title: "Getting started: what is Computational Thinking?", objective: "I can describe how we think step by step to solve problems.",
      flow: `**Warm-up (10 min):** A quick puzzle on the board (e.g. "How do you make tea? Say each step."). Collect steps and spot missing ones.\n\n**Learn (15 min):** Introduce the four thinking skills: breaking problems down, finding patterns, focusing on what matters, and step-by-step plans.${cls >= 6 ? " Mention where AI fits in this year." : ""}\n\n**Platform (10 min):** Students sign in, set up their avatar and try the Puzzle of the Day.\n\n**Wrap-up (5 min):** Each student names one thing they do in steps every day.`,
    };
    if (s.kind === "REVISION") return {
      title: `Term ${s.term} revision`, objective: "I can find my weak topics and practise them before the exam.",
      flow: `**Warm-up (5 min):** Quick quiz of key words from this term.\n\n**Review (15 min):** Go through the chapters this term. Use class reports to pick the 2 weakest skills.\n\n**Practice (15 min):** Students work on ${label("MOCK") ?? "a practice paper"} (part) in exam conditions; finish at home.\n\n**Wrap-up (5 min):** Share exam tips: read carefully, show steps, check answers.`,
    };
    return {
      title: `Term ${s.term} examination`, objective: "I can show what I have learnt this term.",
      flow: `**Exam (40 min):** ${label("TERM") ?? "Term paper"}. Use the printable paper with sets A/B/C or the online version. Collect papers and mark with the answer key.`,
    };
  }
  const m = c.mod;
  const ws = label("WORKSHEET");
  switch (s.kind) {
    case "INTRODUCE": return {
      title: `${KIND_LABEL.INTRODUCE}: ${c.title}`, objective: m.o[0],
      flow: `**Warm-up (5 min):** ${m.hook}\n\n**Learn (20 min):** Go through the learning module together${label("VIDEO") ? ` and play the ${label("VIDEO")!.toLowerCase().startsWith("concept") ? "concept video" : "video"}` : ""}. Key ideas: ${m.ideas.slice(0, 2).join(" ")}\n\n**Try it (10 min):** Students do the module's Try-it questions in pairs.\n\n**Wrap-up (5 min):** Each student uses one key word in a sentence: ${m.terms.map(([t]) => t).join(", ")}.`,
    };
    case "EXPLORE": return {
      title: `${KIND_LABEL.EXPLORE}: ${c.title}`, objective: m.o[1],
      flow: `**Warm-up (5 min):** Recap the last period with one quick question.\n\n**Explore (20 min):** ${m.ideas.slice(2).join(" ") || m.ideas[0]} Work through an example from the module, asking students to predict each step.${label("VIDEO") ? ` Use the worked-examples video.` : ""}\n\n**Practise (10 min):** ${ws ? `Start ${ws}.` : "Practice questions from the chapter."}\n\n**Wrap-up (5 min):** Watch out: ${m.mistake}`,
    };
    case "PRACTISE": return {
      title: `${KIND_LABEL.PRACTISE}: ${c.title}${ws ? ` (${ws.split(" · ")[0]})` : ""}`, objective: m.o[2],
      flow: `**Warm-up (5 min):** One question on the board from the last period.\n\n**Practise (25 min):** ${ws ?? "Chapter practice"} individually, then compare answers with a partner. Students who finish early do the adaptive practice set online.\n\n**Discuss (10 min):** Go over the two questions most students found hard; use the answer key's solutions.`,
    };
    case "ACTIVITY": return {
      title: `${KIND_LABEL.ACTIVITY}: ${m.kit.t}`, objective: m.o[1],
      flow: `**Set-up (5 min):** Materials: ${m.kit.mat}. Form groups of 3–4.\n\n${m.kit.steps.map(([t, st, tip], i) => `**${i + 1}. ${t} (${i === 0 ? 10 : 8} min):** ${st} (Teacher tip: ${tip})`).join("\n\n")}\n\n**Share (5 min):** Groups show: ${m.kit.out}.`,
    };
    case "CHECK": return {
      title: `${KIND_LABEL.CHECK}: ${c.title}`, objective: `I can show what I have learnt in "${c.title}".`,
      flow: `**Quick review (10 min):** Key ideas and words: ${m.terms.map(([t]) => t).join(", ")}.\n\n**Chapter test (25 min):** ${label("TEST")}. Online (auto-marked) or printed with the answer key.\n\n**Next steps (5 min):** Note who needs support; early finishers try a challenge worksheet.`,
    };
    default: return { title: c.title, objective: m.o[0], flow: "" };
  }
}
