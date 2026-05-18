import { describe, expect, it } from "vitest";
import { computeVariance, computeVarianceSeries } from "../src/variance";

describe("computeVariance", () => {
  it("computes absolute and percent for positive variance", () => {
    expect(computeVariance({ category: "Oct", actual: 660, reference: 559 })).toEqual({
      category: "Oct",
      absolute: 101,
      percent: 101 / 559,
      sign: 1
    });
  });

  it("computes negative variance", () => {
    const r = computeVariance({ category: "Nov", actual: 527, reference: 600 });
    expect(r.absolute).toBe(-73);
    expect(r.sign).toBe(-1);
  });

  it("returns null variance when actual is null", () => {
    expect(computeVariance({ category: "x", actual: null, reference: 100 })).toEqual({
      category: "x",
      absolute: null,
      percent: null,
      sign: null
    });
  });

  it("returns null percent when reference is zero", () => {
    const r = computeVariance({ category: "x", actual: 10, reference: 0 });
    expect(r.absolute).toBe(10);
    expect(r.percent).toBeNull();
    expect(r.sign).toBe(1);
  });

  it("inverts sign for cost-like measures", () => {
    const r = computeVariance({ category: "x", actual: 90, reference: 100 }, true);
    expect(r.absolute).toBe(10);
    expect(r.sign).toBe(1);
  });

  it("zero variance has sign 0", () => {
    const r = computeVariance({ category: "x", actual: 50, reference: 50 });
    expect(r.sign).toBe(0);
  });
});

describe("computeVarianceSeries", () => {
  it("maps over an array", () => {
    const out = computeVarianceSeries([
      { category: "Oct", actual: 660, reference: 559 },
      { category: "Nov", actual: 527, reference: 600 },
      { category: "Dec", actual: 500, reference: 421 }
    ]);
    expect(out.map((p) => p.absolute)).toEqual([101, -73, 79]);
  });
});
