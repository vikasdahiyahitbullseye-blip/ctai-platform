import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { SUBJECTS, PART_LABEL } from "@/lib/constants";
import { Card, PageHeader, btn } from "@/components/ui";
import { addLink, deleteLink, saveFocus } from "@/app/actions/studio";

export default async function StudioConnections({ searchParams }: { searchParams: Promise<{ cls?: string }> }) {
  await requireUser("CONTENT", "SUPERADMIN");
  const cls = Number((await searchParams).cls ?? 3);
  const chapters = await prisma.chapter.findMany({ where: { classLevel: cls }, include: { links: true }, orderBy: [{ part: "asc" }, { number: "asc" }] });
  const input = "rounded-lg border border-line bg-surface px-2 py-1.5 text-sm";
  return (
    <div className="space-y-6">
      <PageHeader title="Subject connections" subtitle="Show teachers and students where each chapter's thinking appears in Maths, EVS, Science, Social Science, English, Art and daily life." />
      <form className="flex gap-2">{[3, 4, 5, 6, 7, 8].map((c) => <button key={c} name="cls" value={c} className={c === cls ? btn.primary : btn.secondary}>Class {c}</button>)}</form>
      {chapters.map((ch) => (
        <Card key={ch.id} title={`${PART_LABEL[ch.part]} · ${ch.number}. ${ch.title}`}>
          <form action={saveFocus.bind(null, ch.id)} className="mb-3 flex gap-2">
            <input name="focus" defaultValue={ch.focus ?? ""} placeholder="CT/AI focus of this chapter (one line)" className={`${input} flex-1`} />
            <button className="text-sm font-medium text-brand">Save focus</button>
          </form>
          <ul className="mb-3 space-y-2">
            {ch.links.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-3 rounded-xl bg-surface-2 p-3 text-sm">
                <div><strong>{SUBJECTS[l.subject as keyof typeof SUBJECTS]?.emoji} {l.topic}</strong><div className="text-ink-2">{l.how}</div>{l.activity && <div className="mt-1 text-xs text-muted">Activity: {l.activity}</div>}</div>
                <form action={deleteLink.bind(null, l.id)}><button className="text-xs text-bad">Remove</button></form>
              </li>
            ))}
          </ul>
          <form action={addLink.bind(null, ch.id)} className="grid gap-2 sm:grid-cols-[10rem_1fr_2fr_2fr_auto]">
            <select name="subject" className={input}>{Object.entries(SUBJECTS).map(([k, s]) => <option key={k} value={k}>{s.emoji} {s.name}</option>)}</select>
            <input name="topic" placeholder="Topic" required className={input} />
            <input name="how" placeholder="How the thinking connects" required className={input} />
            <input name="activity" placeholder="Activity idea (optional)" className={input} />
            <button className={btn.secondary}>Add</button>
          </form>
        </Card>
      ))}
    </div>
  );
}
