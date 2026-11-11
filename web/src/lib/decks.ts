// Edited class-slide decks: a super-admin can replace a chapter's generated deck with an edited .pptx.
// Stored as an internal Resource (kind SLIDES, code DECK-<class>-<part>-<chapter>) so it never shows in resource lists.
import "server-only";
import { prisma } from "./db";

export const deckCode = (ch: { classLevel: number; part: string; number: number }) => `DECK-${ch.classLevel}-${ch.part}-${ch.number}`;
export const DECK_STATUS = "INTERNAL";
export const MAX_DECK = 100 * 1024 * 1024;

export async function deckOverride(ch: { classLevel: number; part: string; number: number }) {
  return prisma.resource.findUnique({ where: { code: deckCode(ch) }, include: { file: true } });
}
