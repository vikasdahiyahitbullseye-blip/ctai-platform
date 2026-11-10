export type SeedQuestion = {
  ch: number; // chapter number within part
  part?: "CT" | "AI" | "EVS";
  skills: string[];
  type: "MCQ" | "MULTI" | "TRUE_FALSE" | "NUMERIC" | "FILL_BLANK" | "ORDER";
  d: 1 | 2 | 3;
  stem: string;
  options?: string[];
  answer: number | number[] | boolean | string[];
  solution: string;
  hint?: string;
  puzzle?: boolean;
};
