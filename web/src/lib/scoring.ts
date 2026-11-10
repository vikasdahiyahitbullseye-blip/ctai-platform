// Auto-marking for objective question types (docs/SPEC.md §5).

export type AnswerValue = number | number[] | string | string[] | boolean | null;

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Returns whether a response is correct.
 * Stored answer formats:
 *  MCQ: number (option index) · MULTI: number[] · TRUE_FALSE: boolean
 *  NUMERIC: number · FILL_BLANK: string[] (accepted variants) · ORDER: number[] (option indices in correct order)
 */
export function isCorrect(type: string, key: AnswerValue, given: AnswerValue): boolean {
  if (given === null || given === undefined || given === "") return false;
  switch (type) {
    case "MCQ":
      return Number(given) === Number(key);
    case "TRUE_FALSE":
      return String(given) === String(key);
    case "NUMERIC": {
      const g = typeof given === "number" ? given : parseFloat(String(given).replace(/,/g, "").replace(/[\u2212\u2013\u2014]/g, "-").replace(/\s+/g, ""));
      return Number.isFinite(g) && Math.abs(g - Number(key)) < 1e-9;
    }
    case "FILL_BLANK": {
      const variants = Array.isArray(key) ? key.map(String) : [String(key)];
      return variants.some((v) => norm(v) === norm(String(given)));
    }
    case "MULTI": {
      if (!Array.isArray(given) || !Array.isArray(key)) return false;
      const a = [...given].map(Number).sort((x, y) => x - y);
      const b = [...key].map(Number).sort((x, y) => x - y);
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    case "ORDER": {
      if (!Array.isArray(given) || !Array.isArray(key)) return false;
      return given.length === key.length && given.every((v, i) => Number(v) === Number(key[i]));
    }
    default:
      return false;
  }
}

/** Human-readable correct answer, used in answer keys and review screens. */
export function formatAnswer(type: string, options: string[], key: AnswerValue): string {
  const letter = (i: number) => String.fromCharCode(97 + i);
  switch (type) {
    case "MCQ":
      return `(${letter(Number(key))}) ${options[Number(key)] ?? ""}`;
    case "MULTI":
      return (key as number[]).map((i) => `(${letter(i)}) ${options[i]}`).join(", ");
    case "TRUE_FALSE":
      return String(key) === "true" ? "True" : "False";
    case "NUMERIC":
      return String(key);
    case "FILL_BLANK":
      return Array.isArray(key) ? String(key[0]) : String(key);
    case "ORDER":
      return (key as number[]).map((i) => options[i]).join(" → ");
    case "SHORT":
      return Array.isArray(key) ? String(key[0]) : String(key);
    default:
      return String(key);
  }
}
