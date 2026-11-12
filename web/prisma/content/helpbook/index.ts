// Questions from the "Think, Play & Solve" help books (Classes 3–8): CBSE-level CT questions written as companions to each
// CBSE handbook question (same topic and difficulty, new questions), with answers and solutions. Figures: public/hb.
import HB from "./hb.json";

export type HelpbookRow = { c: number; ch: number; label: string; stem: string; options: string[]; answer: number; solution: string; skills: string[]; d: number; fig: [string, number, number] | null };
export const HELPBOOK = HB as HelpbookRow[];
export const helpbookRef = (r: HelpbookRow) => `Think, Play & Solve Help Book, Class ${r.c} · Chapter ${r.ch} · ${r.label.startsWith("P") ? "Thinking Spot" : r.label.startsWith("A") ? `Activity ${r.label}` : `Question ${r.label}`}`;
