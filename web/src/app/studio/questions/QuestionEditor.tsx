"use client";
import { useActionState, useMemo, useState } from "react";
import { saveQuestion } from "@/app/actions/studio";
import { QUESTION_TYPES, SKILLS, DIFFICULTY } from "@/lib/constants";
import { QuestionInput } from "@/components/QuestionInput";
import { Markdown } from "@/components/Markdown";
import { btn } from "@/components/ui";
import type { AnswerValue } from "@/lib/scoring";

type Ch = { classLevel: number; part: string; number: number; title: string };
export type EditorInitial = {
  classLevel: number; part: string; chapterNumber: number; type: string; difficulty: number; skills: string[];
  stem: string; options: string[]; answer: string; solution: string; hint: string; marks: number; isPuzzle: boolean;
};

const ANSWER_HELP: Record<string, string> = {
  MCQ: "Letter of the correct option, e.g. b. Vary which letter is correct across questions",
  MULTI: "Letters of all correct options, e.g. a,c",
  TRUE_FALSE: "true or false",
  NUMERIC: "The number, e.g. 36",
  FILL_BLANK: "Accepted answers separated by |, e.g. pattern|patterns",
  ORDER: "Type the options above in the CORRECT order — students will see them shuffled",
  SHORT: "Model answer for the teacher (students see it after marking)",
};

export function QuestionEditor({ id, chapters, initial }: { id: string | null; chapters: Ch[]; initial: EditorInitial }) {
  const [state, action, pending] = useActionState(saveQuestion.bind(null, id), undefined);
  const [v, setV] = useState(initial);
  const [preview, setPreview] = useState<AnswerValue>(null);
  const set = <K extends keyof EditorInitial>(k: K, val: EditorInitial[K]) => setV((x) => ({ ...x, [k]: val }));
  const chapterOpts = chapters.filter((c) => c.classLevel === v.classLevel && c.part === v.part);
  const parts = [...new Set(chapters.filter((c) => c.classLevel === v.classLevel).map((c) => c.part))];
  const needsOptions = ["MCQ", "MULTI", "ORDER"].includes(v.type);
  const pq = useMemo(() => ({ id: "preview", type: v.type, stem: v.stem || "_Question text appears here_", options: (needsOptions ? v.options : []).map((text, i) => ({ i, text })), difficulty: v.difficulty, marks: v.marks, skills: v.skills }), [v, needsOptions]);
  const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
        <div className="grid grid-cols-3 gap-3">
          <label className="text-sm font-medium">Class<select name="classLevel" value={v.classLevel} onChange={(e) => { set("classLevel", Number(e.target.value)); set("chapterNumber", 1); }} className={input}>{[3, 4, 5, 6, 7, 8].map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="text-sm font-medium">Part<select name="part" value={v.part} onChange={(e) => { set("part", e.target.value); set("chapterNumber", 1); }} className={input}>{parts.map((p) => <option key={p}>{p}</option>)}</select></label>
          <label className="text-sm font-medium">Difficulty<select name="difficulty" value={v.difficulty} onChange={(e) => set("difficulty", Number(e.target.value))} className={input}>{Object.entries(DIFFICULTY).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        </div>
        <label className="block text-sm font-medium">Chapter<select name="chapterNumber" value={v.chapterNumber} onChange={(e) => set("chapterNumber", Number(e.target.value))} className={input}>{chapterOpts.map((c) => <option key={c.number} value={c.number}>{c.number}. {c.title}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">Type<select name="type" value={v.type} onChange={(e) => set("type", e.target.value)} className={input}>{Object.entries(QUESTION_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className="text-sm font-medium">Marks<input name="marks" type="number" min={1} max={10} value={v.marks} onChange={(e) => set("marks", Number(e.target.value))} className={input} /></label>
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Skills (CBSE CT strands and AI strands)</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {Object.entries(SKILLS).map(([k, l]) => (
              <label key={k} className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                <input type="checkbox" name="skills" value={k} checked={v.skills.includes(k)} onChange={(e) => set("skills", e.target.checked ? [...v.skills, k] : v.skills.filter((s) => s !== k))} />{l}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm font-medium">Question text <span className="font-normal text-muted">(**bold**, blank line = new paragraph, &quot;- &quot; for lists, | tables |)</span>
          <textarea name="stem" rows={5} value={v.stem} onChange={(e) => set("stem", e.target.value)} className={input} required />
        </label>
        {needsOptions && (
          <label className="block text-sm font-medium">Options <span className="font-normal text-muted">(one per line)</span>
            <textarea name="options" rows={4} value={v.options.join("\n")} onChange={(e) => set("options", e.target.value.split("\n"))} className={input} />
          </label>
        )}
        <label className="block text-sm font-medium">{v.type === "SHORT" ? "Model answer" : "Correct answer"} <span className="font-normal text-muted">— {ANSWER_HELP[v.type]}</span>
          {v.type === "ORDER" ? <input type="hidden" name="answer" value="in order" /> : <input name="answer" value={v.answer} onChange={(e) => set("answer", e.target.value)} className={input} />}
        </label>
        <label className="block text-sm font-medium">Worked solution <span className="font-normal text-muted">(shown to students after answering)</span>
          <textarea name="solution" rows={3} value={v.solution} onChange={(e) => set("solution", e.target.value)} className={input} required />
        </label>
        <label className="block text-sm font-medium">Hint <span className="font-normal text-muted">(optional, practice mode only)</span>
          <input name="hint" value={v.hint} onChange={(e) => set("hint", e.target.value)} className={input} />
        </label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPuzzle" checked={v.isPuzzle} onChange={(e) => set("isPuzzle", e.target.checked)} /> Use as a Puzzle of the Day</label>
        {state?.error && <p className="text-sm text-bad" role="alert">{state.error}</p>}
        <div className="flex flex-wrap gap-2">
          <button name="intent" value="draft" className={btn.secondary} disabled={pending}>Save draft</button>
          <button name="intent" value="submit" className={btn.primary} disabled={pending}>Save &amp; send for review</button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-24">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Student preview</div>
          <QuestionInput q={pq} value={preview} onChange={setPreview} big={v.classLevel <= 5} />
          <div className="mt-5 rounded-xl bg-surface-2 p-3 text-sm"><div className="mb-1 font-semibold">Solution</div><Markdown text={v.solution || "—"} /></div>
        </div>
      </div>
    </form>
  );
}
