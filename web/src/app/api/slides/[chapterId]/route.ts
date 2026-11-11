import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildChapterDeck } from "@/lib/slides";

/** Classroom slide deck (.pptx) for one chapter. Teachers, school admins and Hitbullseye staff. */
export async function GET(_: Request, { params }: { params: Promise<{ chapterId: string }> }) {
  const user = await getSessionUser();
  if (!user || !["TEACHER", "ADMIN", "CONTENT", "REVIEWER", "SUPERADMIN"].includes(user.role)) return new NextResponse("Not found", { status: 404 });
  const { chapterId } = await params;
  const ch = await prisma.chapter.findUnique({ where: { id: chapterId } });
  if (!ch) return new NextResponse("Not found", { status: 404 });
  const { buffer, name } = await buildChapterDeck(prisma, chapterId);
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "private, max-age=300" },
  });
}
