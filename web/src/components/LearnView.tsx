// Shows a learning module or a concept video to a teacher or a student.
// Modules: written content + a worked example + "Try it" questions from the bank (with pictures).
// Videos: the recording (YouTube link, video URL or uploaded file). Scripts are on the Concept videos page.
import { prisma } from "@/lib/db";
import { formatAnswer } from "@/lib/scoring";
import { Markdown } from "./Markdown";
import { StemFigure, OptionList } from "./QuestionFigures";
import { TheoryView, hasTheory } from "./TheoryView";

type Res = { id: string; kind: string; title: string; description: string | null; body: string | null; url: string | null; fileId: string | null; meta: string | null; chapterId?: string | null };

export function youTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function Player({ r }: { r: Res }) {
  const yt = r.url ? youTubeId(r.url) : null;
  if (yt) return <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black"><iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${yt}`} title={r.title} allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>;
  const src = r.fileId ? `/api/files/${r.fileId}` : r.url && /\.(mp4|webm)(\?|$)/i.test(r.url) ? r.url : null;
  if (src) return <video className="w-full rounded-2xl bg-black" controls preload="metadata" src={src} />;
  if (r.url) return <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-block rounded-xl bg-brand px-4 py-2 font-semibold text-white">▶ Open the video</a>;
  return null;
}

export async function LearnView({ r }: { r: Res; forStudent: boolean }) {
  // Only recorded videos reach this view (unrecorded ones are hidden from teachers and students).
  if (r.kind === "VIDEO") return <Player r={r} />;

  const meta = r.meta ? (JSON.parse(r.meta) as { exampleId?: string; tryIds?: string[] }) : {};
  const ids = [meta.exampleId, ...(meta.tryIds ?? [])].filter(Boolean) as string[];
  const qs = ids.length ? await prisma.question.findMany({ where: { id: { in: ids } } }) : [];
  const example = qs.find((q) => q.id === meta.exampleId);
  const tries = (meta.tryIds ?? []).map((id) => qs.find((q) => q.id === id)).filter(Boolean) as typeof qs;
  const [before, after] = (r.body ?? "").split(/\n(?=## Activity:)/);
  const ch = r.chapterId ? await prisma.chapter.findUnique({ where: { id: r.chapterId }, select: { classLevel: true, part: true, number: true } }) : null;
  const theoryKey = ch ? `${ch.classLevel}-${ch.part}-${ch.number}` : "";
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-surface p-5"><Markdown text={before} /></div>
      {hasTheory(theoryKey) && <TheoryView theoryKey={theoryKey} />}
      {example && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="text-lg font-bold">Worked example</h3>
          <div className="mt-2"><Markdown text={example.stem} /></div>
          <StemFigure json={example.figure} />
          {example.type !== "ORDER" && <OptionList options={JSON.parse(example.options)} figuresJson={example.optionFigures} />}
          <div className="mt-3 rounded-xl bg-good-soft p-3 text-sm"><strong>Answer:</strong> {formatAnswer(example.type, JSON.parse(example.options), JSON.parse(example.answer))}<div className="mt-1"><Markdown text={example.solution} /></div></div>
        </div>
      )}
      {tries.length > 0 && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="text-lg font-bold">Try it</h3>
          <ol className="mt-3 space-y-4">
            {tries.map((q, i) => (
              <li key={q.id}>
                <div className="font-semibold">Question {i + 1}</div>
                <Markdown text={q.stem} />
                <StemFigure json={q.figure} />
                {q.type !== "ORDER" && <OptionList options={JSON.parse(q.options)} figuresJson={q.optionFigures} />}
                {q.type === "ORDER" && <p className="text-sm text-muted">Put in order: {(JSON.parse(q.options) as string[]).join(" · ")}</p>}
                <details className="mt-2 text-sm"><summary className="cursor-pointer font-medium text-brand">Show answer</summary><div className="mt-1"><strong>{formatAnswer(q.type, JSON.parse(q.options), JSON.parse(q.answer))}</strong><Markdown text={q.solution} className="mt-1 text-ink-2" /></div></details>
              </li>
            ))}
          </ol>
        </div>
      )}
      {after && <div className="rounded-2xl border border-line bg-surface p-5"><Markdown text={after} /></div>}
    </div>
  );
}
