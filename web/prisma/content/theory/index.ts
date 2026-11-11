// "Learn it" theory for Classes 3–5, keyed "<class>-CT-<chapter>".
import { THEORY3 } from "./class3";
import { THEORY4 } from "./class4";
import { THEORY5 } from "./class5";
import type { ChapterTheory } from "./types";
export const THEORY: Record<string, ChapterTheory> = { ...THEORY3, ...THEORY4, ...THEORY5 };
export type { ChapterTheory, Concept } from "./types";
