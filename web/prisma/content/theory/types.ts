// "Learn it" theory for the Classes 3–5 help books: the concepts each chapter's questions practise.
// Used in the help-book PDFs (docs/helpbooks), the chapter learning modules and the class slides.
import type { Fig } from "../../../src/lib/figures";

export type Concept = {
  title: string;
  text: string; // short explanation; **bold** allowed
  points?: string[]; // key points or steps
  fig?: Fig; // a picture drawn by the platform's figure renderer
  table?: string[][]; // small table, first row = header
  example?: { q: string; steps: string[]; answer: string };
  remember?: string;
};
export type ChapterTheory = { intro: string; concepts: Concept[]; tip: string };
export const T = (t: ChapterTheory) => t;
