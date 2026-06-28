import { describe, it, expect } from "vitest";
import { applyTopN } from "../src/topN";
import type { CategoryPoint } from "../src/types";

const pts: CategoryPoint[] = [
  { category: "A", actual: 100, reference: 90 },
  { category: "B", actual: 80, reference: 70 },
  { category: "C", actual: 60, reference: 50 },
  { category: "D", actual: 40, reference: 30 },
  { category: "E", actual: 20, reference: 10 }
];

describe("applyTopN", () => {
  it("returns a copy unchanged when topN is 0 (show all)", () => {
    const out = applyTopN(pts, { topN: 0, showOthers: true });
    expect(out).toHaveLength(5);
    expect(out).not.toBe(pts);
    expect(out.map((p) => p.category)).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("returns a copy unchanged when topN covers the whole list", () => {
    expect(applyTopN(pts, { topN: 5, showOthers: true })).toHaveLength(5);
    expect(applyTopN(pts, { topN: 99, showOthers: true })).toHaveLength(5);
  });

  it("keeps only the leading N when showOthers is false", () => {
    const out = applyTopN(pts, { topN: 2, showOthers: false });
    expect(out.map((p) => p.category)).toEqual(["A", "B"]);
  });

  it("aggregates the remainder into an Others bucket", () => {
    const out = applyTopN(pts, { topN: 2, showOthers: true });
    expect(out.map((p) => p.category)).toEqual(["A", "B", "Others"]);
    const others = out[2];
    expect(others.actual).toBe(60 + 40 + 20);
    expect(others.reference).toBe(50 + 30 + 10);
  });

  it("uses a custom Others label", () => {
    const out = applyTopN(pts, { topN: 1, showOthers: true, othersLabel: "Rest" });
    expect(out[1].category).toBe("Rest");
  });

  it("keeps a measure null when every remaining value is null", () => {
    const data: CategoryPoint[] = [
      { category: "A", actual: 10, reference: 5 },
      { category: "B", actual: null, reference: 3 },
      { category: "C", actual: null, reference: 2 }
    ];
    const out = applyTopN(data, { topN: 1, showOthers: true });
    expect(out[1].actual).toBeNull();
    expect(out[1].reference).toBe(5);
  });

  it("does not mutate the input array", () => {
    const copy = pts.slice();
    applyTopN(pts, { topN: 2, showOthers: true });
    expect(pts).toEqual(copy);
  });
});
