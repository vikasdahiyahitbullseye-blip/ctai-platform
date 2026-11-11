import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PART_LABEL } from "@/lib/constants";
import { Card, PageHeader, Pill, btn } from "@/components/ui";
import { deckCode } from "@/lib/decks";

export default async function HqSlides({ searchParams }: { searchParams: Promise<{ cls?: string; done?: string; error?: string }> }) {
  await requireUser("SUPERADMIN");
  const sp = await searchParams;
  const cls = Math.min(8, Math.max(3, Number(sp.cls) || 3));
  const chapters = await prisma.chapter.findMany({ where: { classLevel: cls }, orderBy: [{ part: "asc" }, { number: "asc" }] });
  const edited = await prisma.resource.findMany({ where: { code: { in: chapters.map(deckCode) } }, include: { file: true } });
  const byCode = new Map(edited.map((r) => [r.code, r]));
  const parts = [...new Set(chapters.map((c) => c.part))];
  return (
    <div className="space-y-6">
      <PageHeader title="Class slides" subtitle="Every chapter has a PowerPoint deck built from its content. To change one, download it, edit it in PowerPoint (or Google Slides, then download as .pptx) and upload it here. Teachers then get your edited deck." />
      <nav className="flex flex-wrap gap-2">{[3, 4, 5, 6, 7, 8].map((c) => <Link key={c} href={`/hq/slides?cls=${c}`} className={c === cls ? btn.primary : btn.secondary}>Class {c}</Link>)}</nav>
      {sp.done && <p className="rounded-xl bg-good-soft p-3 text-sm font-medium">{sp.done}</p>}
      {sp.error && <p className="rounded-xl bg-bad-soft p-3 text-sm font-medium">{sp.error}</p>}
      {parts.map((part) => (
        <Card key={part} title={`Class ${cls} · ${PART_LABEL[part]}`}>
          <ul className="divide-y divide-line">
            {chapters.filter((c) => c.part === part).map((c) => {
              const e = byCode.get(deckCode(c));
              return (
                <li key={c.id} id={`c${c.id}`} className="scroll-mt-24 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.number}. {c.title}</span>
                    {e ? <Pill tone="brand">Edited deck</Pill> : <Pill>Generated</Pill>}
                    {e?.file && <span className="text-xs text-muted">{e.file.filename} · {e.description} · {e.file.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <a href={`/api/slides/${c.id}`} className="font-medium text-brand">⬇ Download what teachers get</a>
                    {e && <a href={`/api/slides/${c.id}?generated=1`} className="font-medium text-brand">⬇ Download the generated deck</a>}
                    <form action={`/api/slides/${c.id}`} method="post" encType="multipart/form-data" className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="op" value="upload" />
                      <input type="file" name="file" required accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" aria-label={`Edited deck for ${c.title}`} className="text-sm" />
                      <button className={btn.secondary}>{e ? "Replace edited deck" : "Upload edited deck"}</button>
                    </form>
                    {e && <form action={`/api/slides/${c.id}`} method="post"><input type="hidden" name="op" value="revert" /><button className="font-medium text-bad">Go back to the generated deck</button></form>}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}
      <p className="text-xs text-muted">Note: an edited deck does not change when the chapter content changes later, and reloading the demo data (npm run seed) removes edited decks.</p>
    </div>
  );
}
