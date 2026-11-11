// CBSE CT & AI handbook exercises (Student Handbook questions; answers and solutions from the CBSE Teacher Handbook, 2026-27).
// AI chapters (Classes 6–8): each chapter's end-of-chapter Exercise, transcribed with CBSE's solutions.

/** [stem, options, index of the correct option] */
export type Mcq = [string, string[], number];
export type AiExercise = {
  chapter: number;
  mcq: Mcq[];
  /** [sentence with a blank, accepted answers] */
  fill: [string, string[]][];
  /** [question, CBSE model answer] (teacher-marked) */
  short: [string, string][];
  /** "Think and apply" / case-based: [question, CBSE answer] (teacher-marked) */
  apply: [string, string][];
  /** [statement, true/false] */
  tf?: [string, boolean][];
  /** Classify/identify tables: every row becomes a multiple-choice item whose choices are the table's answers. */
  tables?: { title: string; rows: [string, string][]; choices?: string[] }[];
};
export const A = (x: AiExercise) => x;
