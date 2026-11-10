import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatAnswer } from "@/lib/scoring";
import { PART_LABEL } from "@/lib/constants";
import { Markdown } from "@/components/Markdown";
import { StemFigure, OptionList } from "@/components/QuestionFigures";
import { PrintButton } from "../../../tests/[id]/print/PrintButton";

export default async function Worksheet({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ key?: string }> }) {
  const { id } = await params;
  const isKey = (await searchParams).key === "1";
  const user = await requireUser("TEACHER", "ADMIN");
  const ch = await prisma.chapter.findUnique({ where: { id }, include: { questions: { where: { status: "PUBLISHED", isPuzzle: false, type: { not: "SHORT" } }, orderBy: [{ difficulty: "asc" }, { code: "asc" }] } } });
  if (!ch) notFound();
  const big = ch.classLevel <= 5;
  return (
    <div className="mx-auto max-w-[210mm] bg-white p-8 text-black print:p-0">
      <div className="no-print mb-6 flex items-center justify-between rounded-xl bg-[#eef1f7] p-3 text-sm"><span>Worksheet preview — print or save as PDF.</span><PrintButton /></div>
      <header className="border-b-2 border-black pb-3 text-center">
        <div className="text-xl font-bold uppercase">{user.school.name}</div>
        <div className="text-lg font-semibold">CT Worksheet: {ch.title}{isKey ? " — Answer Key" : ""}</div>
        <div className="text-sm">Class {ch.classLevel} · {PART_LABEL[ch.part]}</div>
      </header>
      {!isKey && <div className="mt-3 grid grid-cols-3 gap-4 text-sm"><div>Name: ____________________</div><div>Roll no.: ________</div><div>Date: ________</div></div>}
      <p className="mt-3 text-sm italic">Think carefully. Show your thinking in the space or on rough paper. ⭐ = easy · ⭐⭐ = medium · ⭐⭐⭐ = challenge</p>
      <ol className="mt-4 space-y-5">
        {ch.questions.map((q, i) => {
          const opts = JSON.parse(q.options) as string[];
          return (
            <li key={q.id} className="break-inside-avoid">
              <div className="flex gap-3">
                <span className="font-bold">{i + 1}.</span>
                <div className={`flex-1 ${big ? "text-[15px]" : "text-sm"}`}>
                  <Markdown text={q.stem} />
                  <StemFigure json={q.figure} />
                  {q.optionFigures && <OptionList options={opts} figuresJson={q.optionFigures} />}
                  {opts.length > 0 && q.type !== "ORDER" && !q.optionFigures && <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">{opts.map((o, k) => <div key={k}>({String.fromCharCode(97 + k)}) {o}</div>)}</div>}
                  {q.type === "ORDER" && <div className="mt-2 flex flex-wrap gap-2">{[...opts].reverse().map((o) => <span key={o} className="rounded border border-black/40 px-2 py-0.5">{o}</span>)}</div>}
                  {!isKey && ["NUMERIC", "FILL_BLANK", "ORDER"].includes(q.type) && <div className="mt-3 border-b border-dotted border-black/60 pb-4">Answer:</div>}
                  {isKey && <div className="mt-2 rounded border border-black/20 p-2 text-[13px]"><strong>Answer:</strong> {formatAnswer(q.type, opts, JSON.parse(q.answer))}<div className="mt-1 text-black/80">{q.solution}</div></div>}
                </div>
                <span className="text-xs">{"⭐".repeat(q.difficulty)}</span>
              </div>
            </li>
          );
        })}
      </ol>
      <footer className="mt-8 border-t border-black/30 pt-2 text-center text-xs">Hitbullseye CT &amp; AI · original questions</footer>
    </div>
  );
}
