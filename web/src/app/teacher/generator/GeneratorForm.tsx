"use client";
import { useActionState, useMemo, useState } from "react";
import { generateTest } from "@/app/actions/teacher";
import { SKILLS, QUESTION_TYPES, dashboardSkills } from "@/lib/constants";
import { btn } from "@/components/ui";

type Ch = { id: string; classLevel: number; part: string; number: number; title: string; counts: number[] };

const PRESETS = [
  { name: "Balanced", mix: [40, 40, 20] },
  { name: "Confidence builder", mix: [60, 30, 10] },
  { name: "Challenge", mix: [20, 40, 40] },
];

export function GeneratorForm({ sections, chapters, defaultSection }: { sections: { id: string; label: string; classLevel: number }[]; chapters: Ch[]; defaultSection?: string }) {
  const [state, action, pending] = useActionState(generateTest, undefined);
  const initialSection = sections.find((s) => s.id === defaultSection) ?? sections[0];
  const [sectionId, setSectionId] = useState(initialSection?.id ?? "");
  const classLevel = sections.find((s) => s.id === sectionId)?.classLevel ?? 3;
  const classChapters = chapters.filter((c) => c.classLevel === classLevel);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [mix, setMix] = useState([40, 40, 20]);
  const [count, setCount] = useState(10);

  const available = useMemo(() => {
    const sel = classChapters.filter((c) => picked.has(c.id));
    return [0, 1, 2].map((d) => sel.reduce((s, c) => s + c.counts[d], 0));
  }, [classChapters, picked]);
  const totalAvail = available.reduce((a, b) => a + b, 0);
  const mixSum = mix[0] + mix[1] + mix[2];

  const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 outline-none focus:border-brand";
  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <input type="hidden" name="classLevel" value={classLevel} />
      <div className="space-y-6">
        <fieldset className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <legend className="px-1 font-semibold">1. Basics</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Test title</span>
              <input name="title" required minLength={3} defaultValue="Chapter Test" className={input} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Class</span>
              <select name="sectionId" value={sectionId} onChange={(e) => { setSectionId(e.target.value); setPicked(new Set()); }} className={input}>
                {sections.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Duration (minutes, 0 = untimed)</span>
              <input name="durationMin" type="number" min={0} max={240} defaultValue={30} className={input} />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Instructions</span>
              <textarea name="instructions" rows={2} defaultValue="Read each question carefully. Use rough paper to show your thinking." className={input} />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <legend className="px-1 font-semibold">2. Chapters</legend>
          <div className="mb-3 flex gap-2 text-sm">
            <button type="button" className="text-brand" onClick={() => setPicked(new Set(classChapters.filter((c) => c.counts.some(Boolean)).map((c) => c.id)))}>Select all with questions</button>
            <span className="text-muted">·</span>
            <button type="button" className="text-brand" onClick={() => setPicked(new Set())}>Clear</button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {classChapters.map((c) => {
              const n = c.counts.reduce((a, b) => a + b, 0);
              return (
                <label key={c.id} className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${picked.has(c.id) ? "border-brand bg-brand-soft" : "border-line"} ${n ? "cursor-pointer" : "opacity-50"}`}>
                  <input type="checkbox" name="chapterIds" value={c.id} checked={picked.has(c.id)} disabled={!n} onChange={() => toggle(c.id)} className="mt-0.5" />
                  <span>
                    <span className="font-medium">{c.part === "AI" ? "AI " : ""}Ch {c.number}: {c.title}</span>
                    <span className="block text-xs text-muted">{n ? `${n} questions` : "No questions yet"}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <legend className="px-1 font-semibold">3. Focus (optional)</legend>
          <p className="mb-3 text-sm text-muted">Leave empty to include all skills and question types.</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {[...dashboardSkills(classLevel), "GENERALISATION", "EVALUATION"].map((s) => (
              <label key={s} className="flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                <input type="checkbox" name="skills" value={s} /> {SKILLS[s as keyof typeof SKILLS]}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(QUESTION_TYPES).map(([k, v]) => (
              <label key={k} className="flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                <input type="checkbox" name="types" value={k} /> {v}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="space-y-6">
        <fieldset className="rounded-2xl border border-line bg-surface p-5 shadow-sm lg:sticky lg:top-24">
          <legend className="px-1 font-semibold">4. Size &amp; difficulty</legend>
          <label className="block">
            <span className="text-sm font-medium">Number of questions</span>
            <input name="count" type="number" min={1} max={60} value={count} onChange={(e) => setCount(Number(e.target.value))} className={input} />
          </label>
          <div className="mt-4 text-sm font-medium">Difficulty mix</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.name} type="button" onClick={() => setMix(p.mix)} className={`rounded-full border px-3 py-1 text-xs font-medium ${mix.join() === p.mix.join() ? "border-brand bg-brand-soft" : "border-line"}`}>{p.name}</button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as const).map((k, i) => (
              <label key={k} className="block text-xs">
                <span className="capitalize text-muted">{k} %</span>
                <input name={k} type="number" min={0} max={100} value={mix[i]} onChange={(e) => setMix((m) => m.map((v, j) => (j === i ? Number(e.target.value) : v)))} className={input} />
                <span className="mt-1 block text-muted">{available[i]} available</span>
              </label>
            ))}
          </div>
          {mixSum !== 100 && <p className="mt-2 text-xs text-warn">Mix adds up to {mixSum}% — it will be scaled to 100%.</p>}
          {picked.size > 0 && totalAvail < count && <p className="mt-2 text-xs text-warn">Only {totalAvail} questions available in the chosen chapters.</p>}
          {state?.error && <p className="mt-3 text-sm text-bad" role="alert">{state.error}</p>}
          <button className={`${btn.primary} mt-5 w-full`} disabled={pending || picked.size === 0}>{pending ? "Generating…" : "Generate paper"}</button>
          <p className="mt-2 text-xs text-muted">Questions this class saw in the last 60 days are used only if needed.</p>
        </fieldset>
      </div>
    </form>
  );
}
