import { describe, expect, it } from "vitest";
import { pickForCoverage, questionKind, PRACTICE_LENGTH } from "../attempts";

const q = (id: string, type: string, difficulty: number, skills: string, pic = false, source = "AUTHORED") => ({ id, type, difficulty, skills, figure: pic ? "{}" : null, optionFigures: null, source });

describe("practice rounds", () => {
  it("have 15 questions", () => expect(PRACTICE_LENGTH).toBe(15));

  it("cover every kind of question and every skill in the chapter", () => {
    // A chapter with lots of easy MCQs and a few rarer kinds.
    const pool = [
      ...Array.from({ length: 30 }, (_, i) => q(`m${i}`, "MCQ", 1, "PATTERN")),
      q("n1", "NUMERIC", 3, "ALGORITHMIC"), q("f1", "FILL_BLANK", 2, "PATTERN"), q("t1", "TRUE_FALSE", 1, "PATTERN"),
      q("o1", "ORDER", 2, "ALGORITHMIC"), q("p1", "MCQ", 2, "ABSTRACT", true), q("c1", "MCQ", 2, "DECOMPOSITION", false, "CBSE"),
      q("x1", "MULTI", 3, "PATTERN"),
    ];
    let seed = 1;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const done: typeof pool = [];
    for (let i = 0; i < PRACTICE_LENGTH; i++) {
      const cands = pool.filter((x) => !done.includes(x));
      done.push(pickForCoverage(cands, pool, done, 1, new Set(), rand));
    }
    const kinds = new Set(pool.map(questionKind));
    expect(new Set(done.map(questionKind))).toEqual(kinds);
    expect(new Set(done.flatMap((x) => x.skills.split(",")))).toEqual(new Set(["PATTERN", "ALGORITHMIC", "ABSTRACT", "DECOMPOSITION"]));
    expect(done).toHaveLength(15);
  });
});
