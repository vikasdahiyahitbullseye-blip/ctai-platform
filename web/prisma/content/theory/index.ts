// "Learn it" theory for Classes 3–8, keyed "<class>-CT-<chapter>" (CT chapters) and "<class>-AI-<chapter>" (AI chapters, Classes 6–8).
import { THEORY3 } from "./class3";
import { THEORY4 } from "./class4";
import { THEORY5 } from "./class5";
import { THEORY6 } from "./class6";
import { THEORY7 } from "./class7";
import { THEORY8 } from "./class8";
import { THEORY_AI } from "./ai";
import type { ChapterTheory } from "./types";
export const THEORY: Record<string, ChapterTheory> = { ...THEORY3, ...THEORY4, ...THEORY5, ...THEORY6, ...THEORY7, ...THEORY8, ...THEORY_AI };
export type { ChapterTheory, Concept } from "./types";
