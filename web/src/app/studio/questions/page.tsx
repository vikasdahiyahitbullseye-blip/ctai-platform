import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { QUESTION_TYPES, DIFFICULTY } from "@/lib/constants";
import { Card, PageHeader, Pill, LinkButton, btn, Empty } from "@/components/ui";

const STATUS_TONE: Record<string, "good" | "warn" | "default" | "bad"> = { PUBLISHED: "good", IN_REVIEW: "warn", DRAFT: "default", RETIRED: "bad" };

export default async function StudioQuestions({ searchParams }: { searchParams: Promise<{ cls?: string; status?: string; q?: string; part?: string }> }) {
  await requireUser("CONTENT", "SUPERADMIN");
  const sp = await searchParams;
  const where = {
    ...(sp.cls ? { classLevel: Number(sp.cls) } : {}),
    ...(sp.status ? { status: sp.status } : {}),
    ...(sp.part ? { chapter: { part: sp.part } } : {}),
    ...(sp.q ? { OR: [{ stem: { contains: sp.q } }, { code: { contains: sp.q } }] } : {}),
  };
  const questions = await prisma.question.findMany({ where, include: { chapter: true }, orderBy: [{ updatedAt: "desc" }], take: 150 });
  const sel = "rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  return (
    <div className="space-y-6">
      <PageHeader title="Questions" subtitle={`${questions.length} shown`} action={<LinkButton href="/studio/questions/new">+ New question</LinkButton>} />
      <Card>
        <form className="flex flex-wrap items-end gap-2">
          <select name="cls" defaultValue={sp.cls ?? ""} className={sel}><option value="">All classes</option>{[3, 4, 5, 6, 7, 8].map((c) => <option key={c} value={c}>Class {c}</option>)}</select>
          <select name="part" defaultValue={sp.part ?? ""} className={sel}><option value="">All parts</option><option value="CT">CT</option><option value="AI">AI</option><option value="EVS">EVS</option></select>
          <select name="status" defaultValue={sp.status ?? ""} className={sel}><option value="">Any status</option>{["DRAFT", "IN_REVIEW", "PUBLISHED", "RETIRED"].map((s) => <option key={s}>{s}</option>)}</select>
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search text or code" className={sel} />
          <button className={btn.secondary}>Filter</button>
        </form>
      </Card>
      <Card>
        {questions.length === 0 ? <Empty>No questions match.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="py-2">Code</th><th>Question</th><th>Chapter</th><th>Type</th><th>Level</th><th>Status</th></tr></thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-t border-line">
                    <td className="py-2"><Link href={`/studio/questions/${q.id}`} className="font-mono text-xs text-brand">{q.code}</Link></td>
                    <td className="max-w-sm truncate">{q.stem.replace(/\*\*/g, "").replace(/\n+/g, " ")}</td>
                    <td className="text-xs">{q.classLevel} · {q.chapter.part} {q.chapter.number}</td>
                    <td className="text-xs">{QUESTION_TYPES[q.type as keyof typeof QUESTION_TYPES]}</td>
                    <td className="text-xs">{DIFFICULTY[q.difficulty as 1 | 2 | 3]}</td>
                    <td><Pill tone={STATUS_TONE[q.status]}>{q.status.replace("_", " ")}</Pill>{q.isPuzzle && <Pill tone="brand">Puzzle</Pill>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
