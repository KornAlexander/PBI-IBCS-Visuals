import { describe, it, expect } from "vitest";
import { computeCagr } from "../src/cagr";

describe("computeCagr", () => {
  it("computes a positive per-period growth rate", () => {
    // 100 -> 133.1 over 3 periods => 10% per period
    const r = computeCagr(100, 133.1, 3);
    expect(r).not.toBeNull();
    expect(r as number).toBeCloseTo(0.1, 6);
  });

  it("computes a negative growth rate", () => {
    const r = computeCagr(100, 72.9, 3);
    expect(r as number).toBeCloseTo(-0.1, 6);
  });

  it("returns 0 when first equals last", () => {
    expect(computeCagr(50, 50, 4)).toBeCloseTo(0, 12);
  });

  it("returns null for null inputs", () => {
    expect(computeCagr(null, 100, 3)).toBeNull();
    expect(computeCagr(100, null, 3)).toBeNull();
  });

  it("returns null when first is zero", () => {
    expect(computeCagr(0, 100, 3)).toBeNull();
  });

  it("returns null for fewer than one period", () => {
    expect(computeCagr(100, 200, 0)).toBeNull();
    expect(computeCagr(100, 200, -2)).toBeNull();
  });

  it("returns null when start and end have opposite signs", () => {
    expect(computeCagr(-100, 100, 3)).toBeNull();
    expect(computeCagr(100, -100, 3)).toBeNull();
  });
});
