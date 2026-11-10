import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { SUBJECTS } from "@/lib/constants";
import { Card, PageHeader, btn } from "@/components/ui";
import { saveKit } from "@/app/actions/studio";

export default async function EditKit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  await requireUser("CONTENT", "SUPERADMIN");
  const k = await prisma.projectKit.findUnique({ where: { id }, include: { milestones: { orderBy: { position: "asc" } }, criteria: { orderBy: { position: "asc" } } } });
  if (!k) notFound();
  const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  const subjects = k.subjects.split(",");
  const sessions = k.milestones.reduce((s, m) => s + m.sessions, 0);
  return (
    <form action={saveKit.bind(null, id)} className="space-y-6">
      <PageHeader title={`${k.emoji} ${k.title}`} subtitle={`Class ${k.classLevel} · ${k.code} · ${sessions} sessions planned`} action={<button className={btn.primary}>Save kit</button>} />
      {saved && <div className="rounded-xl bg-good-soft p-3 text-sm text-good">Saved.</div>}
      <Card title="Overview">
        <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
          <label className="text-sm font-medium">Title<input name="title" defaultValue={k.title} className={input} /></label>
          <label className="text-sm font-medium">Emoji<input name="emoji" defaultValue={k.emoji} className={input} /></label>
        </div>
        <label className="mt-3 block text-sm font-medium">Tagline<input name="tagline" defaultValue={k.tagline} className={input} /></label>
        <label className="mt-3 block text-sm font-medium">Driving question<textarea name="drivingQuestion" rows={2} defaultValue={k.drivingQuestion} className={input} /></label>
        <label className="mt-3 block text-sm font-medium">Overview<textarea name="overview" rows={3} defaultValue={k.overview} className={input} /></label>
        <label className="mt-3 block text-sm font-medium">Final product<input name="finalProduct" defaultValue={k.finalProduct} className={input} /></label>
        <fieldset className="mt-3"><legend className="text-sm font-medium">Subjects connected</legend>
          <div className="mt-1 flex flex-wrap gap-2">{Object.entries(SUBJECTS).map(([code, s]) => <label key={code} className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs"><input type="checkbox" name="subjects" value={code} defaultChecked={subjects.includes(code)} />{s.emoji} {s.name}</label>)}</div>
        </fieldset>
        <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={k.published} /> Published (teachers can launch it)</label>
      </Card>
      {k.milestones.map((m) => (
        <Card key={m.id} title={`Milestone ${m.position} · ${m.phase}`}>
          <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
            <label className="text-sm font-medium">Title<input name={`m_${m.id}_title`} defaultValue={m.title} className={input} /></label>
            <label className="text-sm font-medium">Sessions<input type="number" min={1} name={`m_${m.id}_sessions`} defaultValue={m.sessions} className={input} /></label>
          </div>
          <label className="mt-3 block text-sm font-medium">Student task<textarea name={`m_${m.id}_studentTask`} rows={3} defaultValue={m.studentTask} className={input} /></label>
          <label className="mt-3 block text-sm font-medium">Teacher guide<textarea name={`m_${m.id}_teacherGuide`} rows={3} defaultValue={m.teacherGuide} className={input} /></label>
          <label className="mt-3 block text-sm font-medium">Deliverable<input name={`m_${m.id}_deliverable`} defaultValue={m.deliverable} className={input} /></label>
        </Card>
      ))}
      <Card title="Rubric (4 levels per criterion)">
        <div className="space-y-5">
          {k.criteria.map((c) => {
            const levels = JSON.parse(c.levels) as string[];
            return (
              <div key={c.id}>
                <input name={`c_${c.id}_name`} defaultValue={c.name} className={`${input} font-semibold`} />
                <div className="mt-2 grid gap-2 sm:grid-cols-4">{levels.map((l, i) => <label key={i} className="text-xs text-muted">Level {i + 1}<textarea name={`c_${c.id}_${i + 1}`} rows={3} defaultValue={l} className={input} /></label>)}</div>
              </div>
            );
          })}
        </div>
      </Card>
      <button className={btn.primary}>Save kit</button>
    </form>
  );
}
