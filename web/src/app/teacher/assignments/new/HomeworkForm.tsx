"use client";
import { useActionState, useState } from "react";
import { createHomework } from "@/app/actions/homework";
import { btn } from "@/components/ui";

const IDEAS = [
  { title: "Pattern hunt at home", prompt: "Find **3 patterns** at home (tiles, clothes, a calendar, a song). Draw or photograph them and write the rule for each pattern." },
  { title: "Algorithm for a chore", prompt: "Write step-by-step instructions for a chore at home (e.g. making lemonade). Ask a family member to follow them exactly. Did anything go wrong? Fix it." },
  { title: "AI spotter", prompt: "Find **three** things at home or on a family phone that use AI. For each, write what it does and whether it uses Computer Vision, NLP or Data Science." },
  { title: "Data detective", prompt: "Collect data at home for 3 days (e.g. hours of screen time, glasses of water). Make a table and a bar graph. What pattern do you see?" },
];

export function HomeworkForm({ sections, chapters, preselect }: { sections: { id: string; label: string; classLevel: number }[]; chapters: { id: string; classLevel: number; label: string; n: number }[]; preselect?: string }) {
  const [state, action, pending] = useActionState(createHomework, undefined);
  const pre = chapters.find((c) => c.id === preselect);
  const [sectionId, setSectionId] = useState((pre && sections.find((s) => s.classLevel === pre.classLevel)?.id) ?? sections[0]?.id);
  const cls = sections.find((s) => s.id === sectionId)?.classLevel;
  const [tasks, setTasks] = useState([{ title: "", prompt: "" }]);
  const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <div className="space-y-5">
        <div className="space-y-3 rounded-2xl border border-line bg-surface p-5">
          <label className="block text-sm font-medium">Title<input name="title" required defaultValue="Homework" className={input} /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Class<select name="sectionId" value={sectionId} onChange={(e) => setSectionId(e.target.value)} className={input}>{sections.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
            <label className="text-sm font-medium">Due date<input type="date" name="dueAt" className={input} /></label>
          </div>
          <label className="block text-sm font-medium">Instructions<input name="instructions" defaultValue="Answer the questions, then do the activity and describe what you found." className={input} /></label>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="font-semibold">Questions (auto-marked)</div>
          <label className="mt-2 block text-sm font-medium">How many<input type="number" name="count" min={0} max={20} defaultValue={5} className={`${input} w-28`} /></label>
          <div className="mt-3 grid max-h-64 gap-1.5 overflow-auto sm:grid-cols-2">
            {chapters.filter((c) => c.classLevel === cls).map((c) => (
              <label key={c.id} className={`flex items-center gap-2 rounded-lg border border-line px-2 py-1.5 text-xs ${c.n ? "" : "opacity-50"}`}>
                <input type="checkbox" name="chapterIds" value={c.id} disabled={!c.n} defaultChecked={c.id === preselect} />{c.label} <span className="text-muted">({c.n})</span>
              </label>
            ))}
          </div>
        </div>
        {tasks.map((t, i) => (
          <div key={i} className="space-y-3 rounded-2xl border-2 border-accent/50 bg-accent-soft p-5">
            <div className="font-semibold">🛠️ Activity {i + 1} (teacher-marked)</div>
            <label className="block text-sm font-medium">Title<input name={`task${i + 1}_title`} value={t.title} onChange={(e) => setTasks((ts) => ts.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} className={input} /></label>
            <label className="block text-sm font-medium">What should students do?<textarea name={`task${i + 1}_prompt`} rows={3} value={t.prompt} onChange={(e) => setTasks((ts) => ts.map((x, j) => (j === i ? { ...x, prompt: e.target.value } : x)))} className={input} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium">Students hand in<select name={`task${i + 1}_type`} className={input}><option value="ANY">Writing and/or photo</option><option value="TEXT">Writing only</option><option value="FILE">Photo/file only</option></select></label>
              <label className="text-sm font-medium">Marks<input type="number" name={`task${i + 1}_marks`} min={1} max={10} defaultValue={4} className={input} /></label>
            </div>
          </div>
        ))}
        {tasks.length < 3 && <button type="button" className={btn.secondary} onClick={() => setTasks((t) => [...t, { title: "", prompt: "" }])}>+ Add another activity</button>}
        {state?.error && <p className="text-sm text-bad">{state.error}</p>}
        <div><button className={btn.primary} disabled={pending}>Create &amp; assign homework</button></div>
      </div>
      <aside className="space-y-3">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="mb-2 font-semibold">💡 Activity ideas</div>
          <p className="mb-3 text-xs text-muted">Click to use. Activities link CT to daily life, EVS, Science and other subjects.</p>
          <ul className="space-y-2">
            {IDEAS.map((idea) => (
              <li key={idea.title}><button type="button" onClick={() => setTasks((ts) => { const n = [...ts]; const empty = n.findIndex((x) => !x.title); if (empty >= 0) n[empty] = idea; else if (n.length < 3) n.push(idea); return n; })} className="w-full rounded-xl border border-line p-3 text-left text-sm hover:border-brand"><strong>{idea.title}</strong><div className="text-xs text-muted">{idea.prompt.replace(/\*\*/g, "").slice(0, 90)}…</div></button></li>
            ))}
          </ul>
        </div>
      </aside>
    </form>
  );
}
