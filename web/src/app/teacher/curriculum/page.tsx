import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teacherSections } from "@/lib/teacher";
import { SUBJECTS, SKILLS, PART_LABEL, CORE_CT_SKILLS, AI_SKILLS } from "@/lib/constants";
import { Card, PageHeader, btn } from "@/components/ui";

export default async function CurriculumMap({ searchParams }: { searchParams: Promise<{ cls?: string }> }) {
  const user = await requireUser("TEACHER", "ADMIN");
  const levels = [...new Set((await teacherSections(user.id)).map((s) => s.section.classLevel))].sort();
  const cls = Number((await searchParams).cls ?? levels[0] ?? 3);
  const chapters = await prisma.chapter.findMany({ where: { classLevel: cls }, include: { links: true, questions: { where: { status: "PUBLISHED" }, select: { skills: true } }, _count: { select: { resources: true } } }, orderBy: [{ part: "asc" }, { number: "asc" }] });
  const parts = [...new Set(chapters.map((c) => c.part))].sort((a, b) => ["CT", "AI"].indexOf(a) - ["CT", "AI"].indexOf(b));
  const skillCols = cls >= 6 ? [...CORE_CT_SKILLS, ...AI_SKILLS] : CORE_CT_SKILLS;
  const subjectCols = Object.keys(SUBJECTS).filter((s) => chapters.some((c) => c.links.some((l) => l.subject === s)));
  return (
    <div className="space-y-6">
      <PageHeader title="Curriculum map" subtitle="How each chapter builds CT & AI skills and connects to other subjects. CT in Classes 3–5 is taught inside Maths and EVS; in Classes 6–8 across subjects, with AI taught by the Computer teacher." />
      <form className="flex flex-wrap gap-2">{[3, 4, 5, 6, 7, 8].map((c) => <button key={c} name="cls" value={c} className={c === cls ? btn.primary : btn.secondary}>Class {c}</button>)}</form>
      <Card title="CBSE time allocation">
        <p className="text-sm text-ink-2">{cls <= 5 ? "Class 3–5: about 50 hours a year, inside existing Maths and EVS (TWAU) periods — no separate timetable slot needed." : "Class 6–8: about 100 hours a year — 40 h Advanced CT (inside Maths and other subjects), 20 h AI (4 chapters × 5 h), 40 h interdisciplinary projects (2 × 20 h)."}</p>
      </Card>
      {parts.map((part) => (
        <Card key={part} title={PART_LABEL[part]}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="py-2">Chapter</th>
                  {skillCols.map((s) => <th key={s} className="px-1 text-center" title={SKILLS[s]}>{SKILLS[s].split(" ")[0]}</th>)}
                  {subjectCols.map((s) => <th key={s} className="px-1 text-center" title={SUBJECTS[s as keyof typeof SUBJECTS].name}>{SUBJECTS[s as keyof typeof SUBJECTS].emoji}</th>)}
                  <th className="text-right">Qs</th>
                </tr>
              </thead>
              <tbody>
                {chapters.filter((c) => c.part === part).map((c) => {
                  const counts = Object.fromEntries(skillCols.map((s) => [s, c.questions.filter((q) => q.skills.split(",").includes(s)).length]));
                  return (
                    <tr key={c.id} className="border-t border-line">
                      <td className="py-2 pr-2"><Link href={`/teacher/chapter/${c.id}`} className="font-medium text-brand">{c.number}. {c.title}</Link>{c.focus && <div className="max-w-xs text-xs text-muted">{c.focus}</div>}</td>
                      {skillCols.map((s) => <td key={s} className="px-1 text-center">{counts[s] ? <span className="inline-block min-w-7 rounded-md bg-brand-soft px-1.5 py-0.5 text-xs font-semibold text-brand-ink">{counts[s]}</span> : <span className="text-line">·</span>}</td>)}
                      {subjectCols.map((s) => <td key={s} className="px-1 text-center">{c.links.some((l) => l.subject === s) ? "●" : <span className="text-line">·</span>}</td>)}
                      <td className="text-right tabular-nums">{c.questions.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
      <p className="text-xs text-muted">Skill columns show how many published questions practise each skill. ● = a cross-subject connection is described for that chapter.</p>
    </div>
  );
}
