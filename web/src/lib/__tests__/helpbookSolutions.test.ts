import { describe, it, expect } from "vitest";
import { HELPBOOK, workedSolution } from "../../../prisma/content/helpbook";
import { finishSolution } from "../../../prisma/content/solution";

describe("help-book solutions (CBSE Teacher Handbook style)", () => {
  it("every help-book question has a worked solution", () => {
    const missing = HELPBOOK.filter((r) => !workedSolution(r)).map((r) => `${r.c}-${r.ch}-${r.label}`);
    expect(missing).toEqual([]);
  });

  it("each solution shows steps and ends by naming the correct option", () => {
    for (const r of HELPBOOK) {
      const body = workedSolution(r)!;
      expect(body.split(/\n\s*\n/).length, `${r.c}-${r.ch}-${r.label}`).toBeGreaterThanOrEqual(2);
      const full = finishSolution({ type: "MCQ", options: r.options, answer: r.answer, solution: body });
      expect(full.endsWith(`Hence, option ${String.fromCharCode(97 + r.answer)} is the correct answer.`)).toBe(true);
    }
  });
});
