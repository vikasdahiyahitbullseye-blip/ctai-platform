import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STORAGE_DIR } from "@/lib/files";

/** Files are visible to: their owner, staff of the owner's school, classmates on the same project team, and anyone signed in for published resources. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorised", { status: 401 });
  const f = await prisma.storedFile.findUnique({ where: { id }, include: { owner: true, resources: true, submissions: { include: { team: { include: { members: true } } } } } });
  if (!f) return new NextResponse("Not found", { status: 404 });
  const staff = ["TEACHER", "ADMIN"].includes(user.role) && f.owner.schoolId === user.schoolId;
  const hq = ["CONTENT", "SUPERADMIN"].includes(user.role);
  const teammate = f.submissions.some((s) => s.team.members.some((m) => m.userId === user.id));
  const resource = f.resources.some((r) => r.status === "PUBLISHED");
  if (!(f.ownerId === user.id || staff || hq || teammate || resource)) return new NextResponse("Forbidden", { status: 403 });
  const data = await readFile(path.join(STORAGE_DIR, path.basename(f.path)));
  return new NextResponse(new Uint8Array(data), {
    headers: { "Content-Type": f.mime, "Content-Disposition": `inline; filename="${f.filename.replace(/"/g, "")}"`, "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" },
  });
}
