import { NextResponse } from "next/server";
import { getSessionUser, audit } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveVideoUpload } from "@/lib/files";
import { canUploadVideos } from "@/lib/videos";

/** Adds, replaces or removes the recording of a concept video. Only roles the super-admin allows may do this. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorised", { status: 401 });
  if (!(await canUploadVideos(user))) return new NextResponse("Forbidden", { status: 403 });
  const video = await prisma.resource.findUnique({ where: { id } });
  if (!video || video.kind !== "VIDEO") return new NextResponse("Not found", { status: 404 });
  const form = await req.formData();
  const op = String(form.get("op") ?? "");
  const back = (msg: string, ok: boolean) => NextResponse.redirect(new URL(`/videos?cls=${video.classLevel ?? ""}&${ok ? "done" : "error"}=${encodeURIComponent(msg)}#v${id}`, req.url), 303);
  try {
    if (op === "link") {
      const url = String(form.get("url") ?? "").trim();
      if (!/^https:\/\/\S+$/.test(url)) return back("The link must start with https://", false);
      await prisma.resource.update({ where: { id }, data: { url, fileId: null, status: "PUBLISHED" } });
    } else if (op === "file") {
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0) return back("Choose a video file first.", false);
      const f = await saveVideoUpload(file, user.id);
      await prisma.resource.update({ where: { id }, data: { fileId: f.id, url: null, status: "PUBLISHED" } });
    } else if (op === "remove") {
      await prisma.resource.update({ where: { id }, data: { url: null, fileId: null } });
    } else return back("Unknown action.", false);
  } catch (e) {
    return back((e as Error).message, false);
  }
  await audit(user, op === "remove" ? "VIDEO_REMOVED" : "VIDEO_RECORDING_SAVED", video.title);
  return back(op === "remove" ? "Recording removed." : "Recording saved. Teachers and students can now watch it.", true);
}
