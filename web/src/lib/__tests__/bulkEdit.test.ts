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

const { parseTeaches } = await import("../bulkEdit");
const { parseRole } = await import("../staffImport");
describe("teacher import helpers", () => {
  const sections = [{ id: "s3a", classLevel: 3, section: "A" }, { id: "s6a", classLevel: 6, section: "A" }];
  it("reads the Teaches cell", () => {
    const r = parseTeaches("6-A CT; class 6 a AI, 3A", sections);
    expect(r.errors).toEqual([]);
    expect(r.parsed.map((p) => p.label)).toEqual(["6-A CT", "6-A AI", "3-A CT"]);
    expect(parseTeaches("3-A AI; 9-Z; maths", sections).errors).toHaveLength(3);
    expect(parseTeaches("6-A CT; 6-A", sections).parsed).toHaveLength(1); // CT is the default subject
  });
  it("reads the role, defaulting to teacher", () => {
    expect(parseRole("")).toBe("TEACHER");
    expect(parseRole(" Admin ")).toBe("ADMIN");
    expect(parseRole("principal")).toBe("ADMIN");
    expect(parseRole("cook")).toBeNull();
  });
});
