// Account creation helpers: child-friendly usernames and temporary passwords.
import "server-only";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { prisma } from "./db";

const WORDS = ["tiger", "mango", "river", "rocket", "panda", "comet", "lotus", "falcon", "pixel", "ocean", "maple", "cobra", "jumbo", "zebra", "orbit", "koala"];

export function tempPassword() {
  return `${WORDS[randomInt(WORDS.length)]}${randomInt(10, 100)}`;
}

function slug(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "").slice(0, 12) || "user";
}

/** e.g. "aarav.3a07"; teachers: "anjali.mehra". Adds a number if taken. */
export async function uniqueUsername(base: string, taken?: Set<string>) {
  let u = base;
  for (let i = 2; taken?.has(u) || (await prisma.user.findUnique({ where: { username: u } })); i++) u = `${base}${i}`;
  taken?.add(u);
  return u;
}

export async function studentUsername(name: string, classLevel: number, section: string, roll?: string | null) {
  const first = slug(name.split(/\s+/)[0]);
  return uniqueUsername(`${first}.${classLevel}${section.toLowerCase()}${roll ? String(roll).padStart(2, "0") : ""}`);
}

/** `taken` holds usernames already handed out in the same batch (they are not in the database yet). */
export async function staffUsername(name: string, taken?: Set<string>) {
  const parts = name.replace(/^(mr|mrs|ms|dr)\.?\s+/i, "").split(/\s+/).map(slug).filter(Boolean);
  return uniqueUsername(parts.slice(0, 2).join(".") || "staff", taken);
}

export async function hashPassword(p: string) {
  return bcrypt.hash(p, 10);
}
