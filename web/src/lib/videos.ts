// Concept videos: who may upload recordings (a super-admin setting) and which videos are ready to watch.
// A video without a recording is visible only to people allowed to upload; everyone else never sees it.
import "server-only";
import { prisma } from "./db";

export const UPLOAD_ROLE_OPTIONS: { role: string; label: string }[] = [
  { role: "CONTENT", label: "Content team" },
  { role: "REVIEWER", label: "Question reviewers" },
  { role: "ADMIN", label: "School admins" },
  { role: "TEACHER", label: "Teachers" },
  { role: "SUPERADMIN", label: "Super-admins" },
];
const KEY = "videoUploadRoles";

/** Roles allowed to upload concept videos. Nobody until the super-admin allows a role. */
export async function videoUploadRoles(): Promise<string[]> {
  const s = await prisma.setting.findUnique({ where: { key: KEY } });
  try {
    const v = s ? (JSON.parse(s.value) as unknown) : [];
    return Array.isArray(v) ? v.filter((r): r is string => UPLOAD_ROLE_OPTIONS.some((o) => o.role === r)) : [];
  } catch {
    return [];
  }
}

export async function setVideoUploadRoles(roles: string[]) {
  const clean = UPLOAD_ROLE_OPTIONS.map((o) => o.role).filter((r) => roles.includes(r));
  await prisma.setting.upsert({ where: { key: KEY }, update: { value: JSON.stringify(clean) }, create: { key: KEY, value: JSON.stringify(clean) } });
  return clean;
}

export async function canUploadVideos(user: { role: string }) {
  return (await videoUploadRoles()).includes(user.role);
}

export const isRecorded = (r: { url: string | null; fileId: string | null }) => !!(r.url || r.fileId);

/** Prisma filter for video resources that have a recording. */
export const RECORDED = { OR: [{ url: { not: null } }, { fileId: { not: null } }] };

/** Ids of video resources (for some classes) that have no recording yet: hide links to them. */
export async function unrecordedVideoIds(classLevel?: number) {
  const rows = await prisma.resource.findMany({ where: { kind: "VIDEO", url: null, fileId: null, ...(classLevel ? { classLevel } : {}) }, select: { id: true } });
  return new Set(rows.map((r) => r.id));
}
