"use client";
import { useActionState, useState } from "react";
import { saveResource } from "@/app/actions/studio";
import { Markdown } from "@/components/Markdown";
import { btn } from "@/components/ui";

type Init = { title: string; kind: string; audience: string; classLevel: number | null; chapterId: string | null; description: string; body: string; url: string; published: boolean; fileName?: string | null };
const KINDS: Record<string, string> = { MODULE: "Learning module", VIDEO: "Concept video", WORKSHEET: "Worksheet", LESSON_PLAN: "Lesson plan", ACTIVITY_CARD: "Activity card", SLIDES: "Slides", TEMPLATE: "Template", GUIDE: "Guide" };

export function ResourceForm({ id, init, chapters }: { id: string | null; init: Init; chapters: { id: string; classLevel: number; label: string }[] }) {
  const [state, action, pending] = useActionState(saveResource.bind(null, id), undefined);
  const [cls, setCls] = useState(init.classLevel ?? 0);
  const [body, setBody] = useState(init.body);
  const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3 rounded-2xl border border-line bg-surface p-5">
        <label className="block text-sm font-medium">Title<input name="title" defaultValue={init.title} required className={input} /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">Type<select name="kind" defaultValue={init.kind} className={input}>{Object.entries(KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className="text-sm font-medium">For<select name="audience" defaultValue={init.audience} className={input}><option value="TEACHER">Teachers</option><option value="STUDENT">Students</option><option value="BOTH">Both</option></select></label>
          <label className="text-sm font-medium">Class<select name="classLevel" value={cls} onChange={(e) => setCls(Number(e.target.value))} className={input}><option value={0}>All classes</option>{[3, 4, 5, 6, 7, 8].map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
          <label className="text-sm font-medium">Chapter<select name="chapterId" defaultValue={init.chapterId ?? ""} className={input}><option value="">Whole class</option>{chapters.filter((c) => c.classLevel === cls).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
        </div>
        <label className="block text-sm font-medium">Short description<input name="description" defaultValue={init.description} className={input} /></label>
        <label className="block text-sm font-medium">Content (printable; ## headings, - lists, | tables |)<textarea name="body" rows={10} value={body} onChange={(e) => setBody(e.target.value)} className={`${input} font-mono`} /></label>
        <label className="block text-sm font-medium">Link (https://…). For videos, paste a YouTube link (unlisted is fine) or a direct .mp4 link<input name="url" defaultValue={init.url} className={input} /></label>
        <label className="block text-sm font-medium">Attach a file (PDF, Word, PowerPoint, image — max 8 MB){init.fileName && <span className="ml-2 font-normal text-muted">Current: {init.fileName}</span>}<input type="file" name="file" className="mt-1 block text-sm" /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={init.published} /> Published (visible in schools)</label>
        {state?.error && <p className="text-sm text-bad">{state.error}</p>}
        <button className={btn.primary} disabled={pending}>Save resource</button>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-5"><div className="mb-3 text-xs font-semibold uppercase text-muted">Preview</div><Markdown text={body || "—"} /></div>
    </form>
  );
}
