import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { budget, formatHours, KIND_LABEL, type LessonKind } from "@/lib/plan";
import { PART_LABEL } from "@/lib/constants";
import { PrintButton } from "@/app/teacher/tests/[id]/print/PrintButton";
import type { Ref } from "@/lib/libraryLinks";

export default async function PrintPlan({ searchParams }: { searchParams: Promise<{ cls?: string }> }) {
  const user = await requireUser("TEACHER", "ADMIN", "CONTENT", "SUPERADMIN");
  const cls = Math.min(8, Math.max(3, Number((await searchParams).cls ?? 3) || 3));
  const school = await prisma.school.findUnique({ where: { id: user.schoolId } });
  const [lessons, chapters] = await Promise.all([
    prisma.lesson.findMany({ where: { classLevel: cls }, orderBy: { number: "asc" } }),
    prisma.chapter.findMany({ where: { classLevel: cls }, orderBy: [{ part: "asc" }, { number: "asc" }] }),
  ]);
  const b = budget(cls);
  return (
    <div className="mx-auto max-w-[297mm] bg-white p-8 text-black print:p-0">
      <div className="no-print mb-6 flex items-center justify-between rounded-xl bg-[#eef1f7] p-3 text-sm">
        <span>Print preview. Landscape works best. Use your browser&apos;s print dialog to save as PDF.</span>
        <PrintButton />
      </div>
      <header className="border-b-2 border-black pb-3 text-center">
        <div className="text-xl font-bold uppercase">{school?.isHq ? "Hitbullseye" : school?.name}</div>
        <div className="text-lg font-semibold">Computational Thinking &amp; AI · Class {cls} · Year plan</div>
        <div className="text-sm">{b.periods} periods × 40 min = {b.hours} hours{b.projectHours ? ` (+ ${b.projectHours} h projects outside the timetable)` : ""} · Term 1: April–September · Term 2: October–February</div>
      </header>
      <h2 className="mt-4 font-bold">Chapter-wise periods</h2>
      <table className="mt-2 w-full border-collapse text-[12px]">
        <thead><tr><th className="border border-black/40 px-2 py-1 text-left">Part</th><th className="border border-black/40 px-2 py-1 text-left">Chapter</th><th className="border border-black/40 px-2 py-1">Periods</th><th className="border border-black/40 px-2 py-1">Time</th></tr></thead>
        <tbody>
          {chapters.map((c) => (
            <tr key={c.id}><td className="border border-black/40 px-2 py-0.5">{PART_LABEL[c.part]}</td><td className="border border-black/40 px-2 py-0.5">{c.number}. {c.title}</td><td className="border border-black/40 px-2 py-0.5 text-center">{c.periods}</td><td className="border border-black/40 px-2 py-0.5 text-center">{formatHours(c.periods ?? 0)}</td></tr>
          ))}
        </tbody>
      </table>
      <h2 className="mt-6 font-bold">Period-by-period plan</h2>
      <table className="mt-2 w-full border-collapse text-[11px]">
        <thead>
          <tr>{["#", "Month · week", "Type", "Period", "Learning objective", "Resources", "Homework"].map((h) => <th key={h} className="border border-black/40 px-1.5 py-1 text-left">{h}</th>)}</tr>
        </thead>
        <tbody>
          {lessons.map((l) => (
            <tr key={l.id} className="break-inside-avoid">
              <td className="border border-black/40 px-1.5 py-0.5 text-center">{l.number}</td>
              <td className="border border-black/40 px-1.5 py-0.5 whitespace-nowrap">{l.month.slice(0, 3)} · {l.week}</td>
              <td className="border border-black/40 px-1.5 py-0.5">{KIND_LABEL[l.kind as LessonKind]}</td>
              <td className="border border-black/40 px-1.5 py-0.5">{l.title}</td>
              <td className="border border-black/40 px-1.5 py-0.5">{l.objective}</td>
              <td className="border border-black/40 px-1.5 py-0.5">{(JSON.parse(l.refs) as Ref[]).map((r) => r.label).join("; ")}</td>
              <td className="border border-black/40 px-1.5 py-0.5">{(JSON.parse(l.homework) as Ref[]).map((r) => r.label).join("; ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <footer className="mt-6 border-t border-black/30 pt-2 text-center text-xs">Hitbullseye CT &amp; AI · Based on the CBSE CT &amp; AI Curriculum (Classes 3–8), 2026-27</footer>
    </div>
  );
}
