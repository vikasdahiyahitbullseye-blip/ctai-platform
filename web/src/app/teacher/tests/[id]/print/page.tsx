import { requireUser } from "@/lib/auth";
import { requireTestAccess } from "@/lib/teacher";
import { buildPaper, instructionFor, VERSION_NAMES } from "@/lib/paper";
import { Markdown } from "@/components/Markdown";
import { StemFigure, OptionList } from "@/components/QuestionFigures";
import { PrintButton } from "./PrintButton";

export default async function PrintView({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ v?: string; key?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser("TEACHER", "ADMIN");
  await requireTestAccess(user, id);
  const version = Math.min(2, Math.max(0, Number(sp.v ?? 0) || 0));
  const isKey = sp.key === "1";
  const { test, school, items, totalMarks, sections } = await buildPaper(id, version);
  const big = test.classLevel <= 5;

  return (
    <div className="mx-auto max-w-[210mm] bg-white p-8 text-black shadow-sm print:p-0 print:shadow-none">
      <div className="no-print mb-6 flex items-center justify-between rounded-xl bg-[#eef1f7] p-3 text-sm">
        <span>Print preview — use your browser&apos;s print dialog to save as PDF.</span>
        <PrintButton />
      </div>
      <header className="border-b-2 border-black pb-3 text-center">
        <div className="text-xl font-bold uppercase tracking-wide">{school?.name ?? "School"}</div>
        <div className="text-sm">Academic Session {school?.session ?? ""} · Computational Thinking &amp; AI</div>
        <div className="mt-2 text-lg font-semibold">{test.title}{isKey ? " — Answer Key" : ""}</div>
        <div className="mt-1 flex justify-between text-sm">
          <span>Class {test.classLevel} · Set {VERSION_NAMES[version]}</span>
          <span>{test.durationMin ? `Time: ${test.durationMin} min · ` : ""}Maximum marks: {totalMarks}</span>
        </div>
      </header>
      {!isKey && (
        <>
          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>Name: ______________________</div>
            <div>Roll no.: __________</div>
            <div>Section: ______</div>
          </div>
          {test.instructions && <p className="mt-3 text-sm"><strong>Instructions:</strong> {test.instructions}</p>}
        </>
      )}

      {sections.map((sec) => (
        <section key={sec} className="mt-6">
          {sections.length > 1 && <h2 className="mb-3 border-b border-black/30 pb-1 font-bold">Section {sec}{sec === "B" ? " — Challenge questions" : ""}</h2>}
          <ol className="space-y-5">
            {items.filter((i) => i.section === sec).map((it) => (
              <li key={it.no} className="break-inside-avoid">
                <div className="flex gap-3">
                  <span className="font-bold">{it.no}.</span>
                  <div className={`flex-1 ${big ? "text-[15px]" : "text-sm"}`}>
                    <Markdown text={it.stem} />
                    <StemFigure fig={it.figure} />
                    {instructionFor(it.type) && !isKey && <p className="mt-1 italic">{instructionFor(it.type)}</p>}
                    {it.optionFigures?.some(Boolean) && <OptionList options={it.options} figures={it.optionFigures} />}
                    {it.options.length > 0 && it.type !== "ORDER" && !it.optionFigures?.some(Boolean) && (
                      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
                        {it.options.map((o, k) => <div key={k}>({String.fromCharCode(97 + k)}) {o}</div>)}
                      </div>
                    )}
                    {it.type === "ORDER" && <div className="mt-2 flex flex-wrap gap-2">{it.options.map((o) => <span key={o} className="rounded border border-black/40 px-2 py-0.5">{o}</span>)}</div>}
                    {!isKey && (it.type === "NUMERIC" || it.type === "FILL_BLANK" || it.type === "ORDER") && <div className="mt-3 border-b border-dotted border-black/60 pb-4">Answer:</div>}
                    {isKey && (
                      <div className="mt-2 rounded border border-black/20 p-2">
                        <div><strong>Answer:</strong> {it.answerText}</div>
                        <div className="mt-1 text-[13px] text-black/80"><strong>Solution:</strong> <Markdown text={it.solution} className="inline" /></div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs">[{it.marks}]</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <footer className="mt-8 border-t border-black/30 pt-2 text-center text-xs">Hitbullseye CT &amp; AI · Original questions mapped to the CBSE CT &amp; AI curriculum</footer>
    </div>
  );
}
