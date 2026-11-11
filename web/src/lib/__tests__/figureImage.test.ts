import { describe, expect, it } from "vitest";
import { figureSvg } from "../figureImage";
import type { Fig } from "../figures";

describe("picture export for slides", () => {
  it("draws SVG with emoji swapped for colour images", () => {
    const fig: Fig = { kind: "gridmap", rows: 3, cols: 3, items: [{ r: 0, c: 0, icon: "🤖" }, { r: 2, c: 2, icon: "🍎" }], alt: "grid" };
    const { svg, w, h } = figureSvg(fig);
    expect(svg.startsWith("<svg")).toBe(true);
    expect(w).toBeGreaterThan(100);
    expect(h).toBeGreaterThan(100);
    expect((svg.match(/<image /g) ?? []).length).toBe(2);
    expect(svg).not.toMatch(/>🤖</);
    expect(svg).toContain('stroke-width="1.5"'); // camelCase props become SVG attributes
  });
  it("lays out picture sequences side by side with a question mark for the gap", () => {
    const fig: Fig = { kind: "sequence", frames: [{ kind: "arrow", dir: 0, colour: "red", alt: "" }, { kind: "arrow", dir: 1, colour: "red", alt: "" }, null], alt: "seq" };
    const { svg } = figureSvg(fig);
    expect((svg.match(/<svg /g) ?? []).length).toBe(3); // outer + 2 frames
    expect(svg).toContain(">?</text>");
  });
});
