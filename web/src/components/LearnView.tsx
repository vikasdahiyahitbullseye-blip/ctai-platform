// Shows a learning module or a concept video to a teacher or a student.
// Modules: written content + a worked example + "Try it" questions from the bank (with pictures).
// Videos: the recording when one has been added (YouTube link, video URL or uploaded file); otherwise the
// script and storyboard for teachers, and a "coming soon" note for students.
import { prisma } from "@/lib/db";
import { formatAnswer } from "@/lib/scoring";
import { Markdown } from "./Markdown";
import { StemFigure, OptionList } from "./QuestionFigures";

type Res = { id: string; kind: string; title: string; description: string | null; body: string | null; url: string | null; fileId: string | null; meta: string | null };

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

export async function LearnView({ r, forStudent }: { r: Res; forStudent: boolean }) {
  if (r.kind === "VIDEO") {
    const ready = !!(r.url || r.fileId);
    return (
      <div className="space-y-4">
        {ready ? <Player r={r} /> : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-surface-2 p-6 text-center">
            <span className="text-4xl" aria-hidden>🎬</span>
            <span className="font-semibold">{forStudent ? "This video is coming soon." : "Not recorded yet"}</span>
            {!forStudent && <span className="max-w-md text-sm text-muted">The script below is ready to record. The content team adds the recording in Content studio → Resources (a YouTube link, a video link or an upload).</span>}
          </div>
        )}
        {!forStudent && r.body && (
          <details open={!ready} className="rounded-2xl border border-line bg-surface p-4">
            <summary className="cursor-pointer font-semibold">Script and storyboard</summary>
            <div className="mt-3"><Markdown text={r.body} /></div>
          </details>
        )}
      </div>
    );
  }

  const meta = r.meta ? (JSON.parse(r.meta) as { exampleId?: string; tryIds?: string[] }) : {};
  const ids = [meta.exampleId, ...(meta.tryIds ?? [])].filter(Boolean) as string[];
  const qs = ids.length ? await prisma.question.findMany({ where: { id: { in: ids } } }) : [];
  const example = qs.find((q) => q.id === meta.exampleId);
  const tries = (meta.tryIds ?? []).map((id) => qs.find((q) => q.id === id)).filter(Boolean) as typeof qs;
  const [before, after] = (r.body ?? "").split(/\n(?=## Activity:)/);
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-surface p-5"><Markdown text={before} /></div>
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
