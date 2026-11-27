import type { Fig } from "../../src/lib/figures";

export type SeedQuestion = {
  ch: number; // chapter number within part
  part?: "CT" | "AI" | "EVS";
  skills: string[];
  type: "MCQ" | "MULTI" | "TRUE_FALSE" | "NUMERIC" | "FILL_BLANK" | "ORDER" | "SHORT";
  d: 1 | 2 | 3;
  stem: string;
  options?: string[];
  answer: number | number[] | boolean | string[];
  solution: string;
  hint?: string;
  puzzle?: boolean;
  family?: string; // set on generated items
  ref?: string; // where the question appears in print, e.g. the help book
  figure?: Fig;
  optionFigures?: (Fig | null)[];
  solutionFigures?: Fig[]; // pictures in the worked solution, placed with "[fig:1]", "[fig:2]", …
};
