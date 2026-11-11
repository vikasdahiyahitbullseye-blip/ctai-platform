// File uploads (homework photos, project evidence, resources). Stored on local disk in development;
// in production point STORAGE_DIR at a mounted volume or replace with S3-compatible storage.
import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "./db";

export const STORAGE_DIR = process.env.STORAGE_DIR ?? path.join(process.cwd(), "storage", "uploads");
export const MAX_UPLOAD = 8 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif",
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "text/csv": ".csv",
};

export async function saveUpload(file: File | null | undefined, ownerId: string) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.size > MAX_UPLOAD) throw new Error("File is larger than 8 MB.");
  const ext = ALLOWED[file.type];
  if (!ext) throw new Error("Please upload a photo, PDF, Word, PowerPoint, Excel or CSV file.");
  await mkdir(STORAGE_DIR, { recursive: true });
  const name = `${randomUUID()}${ext}`;
  await writeFile(path.join(STORAGE_DIR, name), Buffer.from(await file.arrayBuffer()));
  return prisma.storedFile.create({ data: { ownerId, filename: file.name.slice(0, 120) || `upload${ext}`, mime: file.type, size: file.size, path: name } });
}

export const MAX_VIDEO = Number(process.env.VIDEO_MAX_MB ?? 200) * 1024 * 1024;
const VIDEO_TYPES: Record<string, string> = { "video/mp4": ".mp4", "video/webm": ".webm" };

/** Saves an uploaded concept-video file (MP4 or WebM). */
export async function saveVideoUpload(file: File, ownerId: string) {
  if (file.size === 0) throw new Error("The file is empty.");
  if (file.size > MAX_VIDEO) throw new Error(`The video is larger than ${Math.round(MAX_VIDEO / 1024 / 1024)} MB. Upload it to YouTube (unlisted) and paste the link instead.`);
  const ext = VIDEO_TYPES[file.type];
  if (!ext) throw new Error("Please upload an MP4 or WebM video.");
  await mkdir(STORAGE_DIR, { recursive: true });
  const name = `${randomUUID()}${ext}`;
  await writeFile(path.join(STORAGE_DIR, name), Buffer.from(await file.arrayBuffer()));
  return prisma.storedFile.create({ data: { ownerId, filename: file.name.slice(0, 120) || `video${ext}`, mime: file.type, size: file.size, path: name } });
}
