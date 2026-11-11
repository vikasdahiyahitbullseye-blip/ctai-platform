import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getSessionUser, audit } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildChapterDeck } from "@/lib/slides";
import { STORAGE_DIR } from "@/lib/files";
import { deckCode, deckOverride, DECK_STATUS, MAX_DECK } from "@/lib/decks";

const PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

/**
 * Classroom slide deck (.pptx) for one chapter. Teachers, school admins and Hitbullseye staff.
 * Serves the super-admin's edited deck when there is one; otherwise builds the deck from the chapter content.
 * `?generated=1` always returns the built deck (a starting point for editing).
 */
export async function GET(req: Request, { params }: { params: Promise<{ chapterId: string }> }) {
  const user = await getSessionUser();
  if (!user || !["TEACHER", "ADMIN", "CONTENT", "REVIEWER", "SUPERADMIN"].includes(user.role)) return new NextResponse("Not found", { status: 404 });
  const { chapterId } = await params;
  const ch = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!ch) return new NextResponse("Not found", { status: 404 });
  const generated = new URL(req.url).searchParams.get("generated") === "1";
  const edited = generated ? null : await deckOverride(ch);
  if (edited?.file) {
    const data = await readFile(path.join(STORAGE_DIR, path.basename(edited.file.path)));
    const name = `Class${ch.classLevel}-${ch.part}-${String(ch.number).padStart(2, "0")}-${ch.title.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "")}.pptx`;
    return new NextResponse(new Uint8Array(data), { headers: { "Content-Type": PPTX, "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "private, no-cache" } });
  }
  const { buffer, name } = await buildChapterDeck(prisma, chapterId);
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": PPTX, "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "private, no-cache" },
  });
}

/** Super-admin: upload an edited deck for this chapter (op=upload) or go back to the generated deck (op=revert). */
export async function POST(req: Request, { params }: { params: Promise<{ chapterId: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "SUPERADMIN") return new NextResponse("Forbidden", { status: 403 });
  const { chapterId } = await params;
  const ch = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!ch) return new NextResponse("Not found", { status: 404 });
  const form = await req.formData();
  const op = String(form.get("op") ?? "");
  const back = (key: "done" | "error", msg: string) => NextResponse.redirect(new URL(`/hq/slides?cls=${ch.classLevel}&${key}=${encodeURIComponent(msg)}#c${ch.id}`, req.url), 303);
  const label = `Class ${ch.classLevel} · ${ch.part} ${ch.number}. ${ch.title}`;

  if (op === "revert") {
    await prisma.resource.deleteMany({ where: { code: deckCode(ch) } });
    await audit(user, "SLIDES_REVERTED", label);
    return back("done", `${label}: teachers now get the generated deck again.`);
  }
  if (op !== "upload") return back("error", "Unknown action.");
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return back("error", "Choose a .pptx file first.");
  if (file.size > MAX_DECK) return back("error", "The file is larger than 100 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  // A .pptx is a zip file: it starts with "PK". Older .ppt files are not accepted.
  if (!/\.pptx$/i.test(file.name) || buf.subarray(0, 2).toString("latin1") !== "PK") return back("error", "Please upload a PowerPoint .pptx file (save .ppt files as .pptx first).");
  await mkdir(STORAGE_DIR, { recursive: true });
  const stored = `${randomUUID()}.pptx`;
  await writeFile(path.join(STORAGE_DIR, stored), buf);
  const f = await prisma.storedFile.create({ data: { ownerId: user.id, filename: file.name.slice(0, 120), mime: PPTX, size: file.size, path: stored } });
  const data = { title: `Edited slides: ${ch.title}`, kind: "SLIDES", status: DECK_STATUS, audience: "TEACHER", classLevel: ch.classLevel, chapterId: ch.id, fileId: f.id, description: `Uploaded by ${user.name}` };
  await prisma.resource.upsert({ where: { code: deckCode(ch) }, update: data, create: { ...data, code: deckCode(ch) } });
  await audit(user, "SLIDES_UPLOADED", `${label} (${file.name})`);
  return back("done", `${label}: teachers now get your edited deck.`);
}
