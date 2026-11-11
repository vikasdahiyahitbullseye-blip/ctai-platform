// "Learn it" theory for Classes 3–8 (CT chapters), keyed "<class>-CT-<chapter>".
import { THEORY3 } from "./class3";
import { THEORY4 } from "./class4";
import { THEORY5 } from "./class5";
import { THEORY6 } from "./class6";
import { THEORY7 } from "./class7";
import { THEORY8 } from "./class8";
import type { ChapterTheory } from "./types";
export const THEORY: Record<string, ChapterTheory> = { ...THEORY3, ...THEORY4, ...THEORY5, ...THEORY6, ...THEORY7, ...THEORY8 };
export type { ChapterTheory, Concept } from "./types";
