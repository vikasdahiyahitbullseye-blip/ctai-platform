import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("../db", () => ({ prisma: {} }));
const { normalDate } = await import("../bulkEdit");

describe("bulk edit dates", () => {
  it("reads the ways people write dates in Excel", () => {
    expect(normalDate("2015-08-14")).toBe("2015-08-14");
    expect(normalDate("2015/8/4")).toBe("2015-08-04");
    expect(normalDate("14/08/2015")).toBe("2015-08-14"); // day first
    expect(normalDate("4-8-2015")).toBe("2015-08-04");
    expect(normalDate("14.08.2015")).toBe("2015-08-14");
    expect(normalDate("42230")).toBe("2015-08-14"); // Excel serial
    expect(normalDate("")).toBe("");
    expect(normalDate("next year")).toBe("next year");
  });
});
