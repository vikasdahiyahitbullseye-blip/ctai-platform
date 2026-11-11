import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { budget, RESERVED_PERIODS } from "@/lib/plan";
import { Card, PageHeader, btn } from "@/components/ui";
import { PlanEditor } from "./PlanEditor";

export default async function StudioPlan({ searchParams }: { searchParams: Promise<{ cls?: string }> }) {
  await requireUser("CONTENT", "SUPERADMIN");
  const cls = Math.min(8, Math.max(3, Number((await searchParams).cls ?? 3) || 3));
  const chapters = await prisma.chapter.findMany({ where: { classLevel: cls }, orderBy: [{ part: "asc" }, { number: "asc" }] });
  const b = budget(cls);
  return (
    <div className="space-y-6">
      <PageHeader title="Teaching plan" subtitle="How many 40-minute periods each chapter gets. The yearly plan and the library are built from these numbers." />
      <form className="flex flex-wrap gap-2">{[3, 4, 5, 6, 7, 8].map((c) => <button key={c} name="cls" value={c} className={c === cls ? btn.primary : btn.secondary}>Class {c}</button>)}</form>
      <Card title={`Class ${cls}: ${b.periods} periods (${b.hours} hours)`} action={<Link href={`/teacher/plan/print?cls=${cls}`} className="text-sm text-brand">Preview the printable plan</Link>}>
        <p className="mb-4 text-sm text-ink-2">
          {cls <= 5
            ? "CBSE: 50 hours a year for Classes 3–5, taught inside Maths and EVS (TWAU) periods."
            : "CBSE: 100 hours a year for Classes 6–8: 40 h Advanced CT, 20 h AI (5 h per AI chapter) and 40 h for two 20-hour projects. Projects run outside the timetable here, so the plan covers 60 hours."}{" "}
          {RESERVED_PERIODS} periods are kept for getting started, two revision periods and two term exams, leaving <strong>{b.periods - RESERVED_PERIODS}</strong> for chapters.
        </p>
        <PlanEditor classLevel={cls} target={b.periods - RESERVED_PERIODS} rows={chapters.map((c) => ({ id: c.id, part: c.part, number: c.number, title: c.title, periods: c.periods ?? 1 }))} />
      </Card>
    </div>
  );
}
