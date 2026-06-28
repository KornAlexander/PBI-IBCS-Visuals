import { describe, expect, it } from "vitest";
import { buildAriaLabel, ChartConfig } from "../src/chart";
import { computeVariance } from "../src/variance";
import type { CategoryPoint } from "../src/types";

const baseCfg = {
  scenario: "PY",
  decimals: 0,
  decimalsAbs: 0,
  decimalsPct: 0
} as unknown as ChartConfig;

describe("buildAriaLabel", () => {
  it("summarises AC, reference, Δ and Δ% for a complete point", () => {
    const p: CategoryPoint = { category: "Oct", actual: 120, reference: 100 };
    const label = buildAriaLabel(p, computeVariance(p), baseCfg);
    expect(label).toContain("Oct:");
    expect(label).toContain("AC 120");
    expect(label).toContain("PY 100");
    expect(label).toContain("ΔPY");
    expect(label).toContain("ΔPY%");
  });

  it("reports missing values as 'no data'", () => {
    const p: CategoryPoint = { category: "Nov", actual: null, reference: null };
    const label = buildAriaLabel(p, computeVariance(p), baseCfg);
    expect(label).toContain("AC no data");
    expect(label).toContain("PY no data");
  });

  it("marks Δ% as 'no data' when reference is zero", () => {
    const p: CategoryPoint = { category: "Dec", actual: 50, reference: 0 };
    const label = buildAriaLabel(p, computeVariance(p), baseCfg);
    expect(label).toContain("ΔPY% no data");
  });
});
