import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PART_LABEL } from "@/lib/constants";
import { Card, PageHeader, Pill, btn } from "@/components/ui";
import { Markdown } from "@/components/Markdown";
import { isRecorded } from "@/lib/videos";
import { MAX_VIDEO } from "@/lib/files";

export default async function VideoUploads({ searchParams }: { searchParams: Promise<{ cls?: string; done?: string; error?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const cls = Number(sp.cls) || 3;
  const videos = await prisma.resource.findMany({ where: { kind: "VIDEO", classLevel: cls }, include: { chapter: true, file: true }, orderBy: [{ chapter: { part: "asc" } }, { chapter: { number: "asc" } }, { position: "asc" }] });
  const recorded = videos.filter(isRecorded).length;
  const input = "rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  return (
    <div className="space-y-6">
      <PageHeader title="Concept videos" subtitle={`Class ${cls}: ${recorded} of ${videos.length} recorded. A video appears for teachers and students only once it has a recording.`} />
      <nav className="flex flex-wrap gap-2">{[3, 4, 5, 6, 7, 8].map((c) => <Link key={c} href={`/videos?cls=${c}`} className={c === cls ? btn.primary : btn.secondary}>Class {c}</Link>)}</nav>
      {sp.done && <p className="rounded-xl bg-good-soft p-3 text-sm font-medium">{sp.done}</p>}
      {sp.error && <p className="rounded-xl bg-bad-soft p-3 text-sm font-medium">{sp.error}</p>}
      {videos.map((v) => {
        const ready = isRecorded(v);
        return (
          <Card key={v.id}>
            <div id={`v${v.id}`} className="scroll-mt-24">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">🎬 {v.title}</span>
                {ready ? <Pill tone="good">Recorded</Pill> : <Pill tone="warn">Not recorded</Pill>}
                {v.chapter && <span className="text-xs text-muted">{PART_LABEL[v.chapter.part]} · Chapter {v.chapter.number}</span>}
              </div>
              {ready && (
                <p className="mt-1 text-sm">
                  Current: {v.url ? <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-brand underline">{v.url}</a> : <a href={`/api/files/${v.fileId}`} target="_blank" className="text-brand underline">{v.file?.filename ?? "video file"}</a>}
                  {" · "}<Link href={`/learn/${v.id}`} className="text-brand">Watch</Link>
                </p>
              )}
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <form action={`/api/videos/${v.id}`} method="post" className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="op" value="link" />
                  <label className="min-w-0 flex-1 text-xs text-muted">YouTube link (unlisted is fine) or video link<input name="url" type="url" required placeholder="https://" defaultValue={v.url ?? ""} className={`${input} mt-1 w-full`} /></label>
                  <button className={btn.primary}>Save link</button>
                </form>
                <form action={`/api/videos/${v.id}`} method="post" encType="multipart/form-data" className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="op" value="file" />
                  <label className="min-w-0 flex-1 text-xs text-muted">…or upload a video file (MP4 or WebM, up to {Math.round(MAX_VIDEO / 1024 / 1024)} MB)<input name="file" type="file" accept="video/mp4,video/webm" required className="mt-1 block w-full text-sm" /></label>
                  <button className={btn.secondary}>Upload</button>
                </form>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                {v.body && <details className="text-sm"><summary className="cursor-pointer font-medium text-brand">Script and storyboard</summary><div className="mt-2 rounded-xl bg-surface-2 p-3"><Markdown text={v.body} /></div></details>}
                {ready && <form action={`/api/videos/${v.id}`} method="post"><input type="hidden" name="op" value="remove" /><button className="text-sm font-medium text-bad">Remove recording</button></form>}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
