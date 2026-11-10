// Test generator: blueprint-driven paper assembly (docs/SPEC.md §7). Pure and deterministic for a given seed.

export type PoolItem = {
  id: string;
  chapterId: string;
  skills: string[];
  type: string;
  difficulty: number;
  marks: number;
};

export type Blueprint = {
  chapterIds: string[];
  skills?: string[]; // empty = any
  types?: string[]; // empty = any
  count: number;
  difficultyMix: { 1: number; 2: number; 3: number }; // percentages, sum 100
  avoidIds?: string[]; // recently used for this section; used only if needed
  seed?: number;
};

export type GenerationResult = {
  items: PoolItem[];
  warnings: string[];
  byDifficulty: Record<number, number>;
  byChapter: Record<string, number>;
  totalMarks: number;
};

/** Mulberry32 PRNG — small, fast, deterministic. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Split `count` by percentages using largest-remainder rounding. */
export function allocate(count: number, mix: Record<number, number>): Record<number, number> {
  const keys = [1, 2, 3];
  const total = keys.reduce((s, k) => s + (mix[k] ?? 0), 0) || 1;
  const raw = keys.map((k) => ((mix[k] ?? 0) / total) * count);
  const base = raw.map(Math.floor);
  let left = count - base.reduce((s, v) => s + v, 0);
  const order = raw.map((v, i) => ({ i, r: v - Math.floor(v) })).sort((a, b) => b.r - a.r);
  for (const { i } of order) {
    if (left <= 0) break;
    base[i]++;
    left--;
  }
  return { 1: base[0], 2: base[1], 3: base[2] };
}

export function generatePaper(pool: PoolItem[], bp: Blueprint): GenerationResult {
  const rand = rng(bp.seed ?? 1);
  const warnings: string[] = [];
  const avoid = new Set(bp.avoidIds ?? []);
  const chapters = new Set(bp.chapterIds);
  const eligible = pool.filter(
    (q) =>
      chapters.has(q.chapterId) &&
      (!bp.skills?.length || q.skills.some((s) => bp.skills!.includes(s))) &&
      (!bp.types?.length || bp.types.includes(q.type)),
  );

  if (eligible.length < bp.count) {
    warnings.push(`Only ${eligible.length} questions match these filters; the paper has ${eligible.length} instead of ${bp.count}.`);
  }

  const target = allocate(Math.min(bp.count, eligible.length), bp.difficultyMix);
  const picked = new Map<string, PoolItem>();

  // Round-robin across chapters for coverage. Fresh items are exhausted before recently used ones.
  const roundRobin = (items: PoolItem[], n: number) => {
    const byCh = new Map<string, PoolItem[]>();
    for (const q of shuffle(items, rand)) {
      if (picked.has(q.id)) continue;
      if (!byCh.has(q.chapterId)) byCh.set(q.chapterId, []);
      byCh.get(q.chapterId)!.push(q);
    }
    const queues = shuffle([...byCh.values()], rand);
    let got = 0;
    while (got < n && queues.some((qq) => qq.length)) {
      for (const qq of queues) {
        if (got >= n) break;
        const q = qq.shift();
        if (q) {
          picked.set(q.id, q);
          got++;
        }
      }
    }
    return got;
  };
  const take = (items: PoolItem[], n: number) => {
    const got = roundRobin(items.filter((q) => !avoid.has(q.id)), n);
    return got + (got < n ? roundRobin(items.filter((q) => avoid.has(q.id)), n - got) : 0);
  };

  let shortfall = 0;
  for (const d of [1, 2, 3]) {
    const want = target[d];
    const got = take(eligible.filter((q) => q.difficulty === d), want);
    if (got < want) {
      shortfall += want - got;
      warnings.push(`Not enough ${["", "easy", "medium", "hard"][d]} questions (${got}/${want}); filled from other levels.`);
    }
  }
  if (shortfall) take(eligible, shortfall);

  const reusedCount = [...picked.values()].filter((q) => avoid.has(q.id)).length;
  if (reusedCount) warnings.push(`${reusedCount} question(s) were used recently with this section.`);

  // Final order: easy → hard, which suits children's tests.
  const items = [...picked.values()].sort((a, b) => a.difficulty - b.difficulty);
  const byDifficulty: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  const byChapter: Record<string, number> = {};
  for (const q of items) {
    byDifficulty[q.difficulty]++;
    byChapter[q.chapterId] = (byChapter[q.chapterId] ?? 0) + 1;
  }
  return { items, warnings, byDifficulty, byChapter, totalMarks: items.reduce((s, q) => s + q.marks, 0) };
}

/** Version B/C of a paper: same questions, shuffled order (within difficulty bands) and shuffled MCQ options. */
export function versionOrder(ids: string[], difficulties: number[], version: number): string[] {
  if (version === 0) return ids;
  const rand = rng(version * 7919);
  const bands = [1, 2, 3].map((d) => shuffle(ids.filter((_, i) => difficulties[i] === d), rand));
  return bands.flat();
}
