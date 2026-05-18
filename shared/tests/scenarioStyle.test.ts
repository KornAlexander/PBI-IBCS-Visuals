import { describe, expect, it } from "vitest";
import { getScenarioStyle, VARIANCE_COLORS } from "../src/scenarioStyle";

describe("getScenarioStyle", () => {
  it("AC is solid black", () => {
    const s = getScenarioStyle("AC");
    expect(s.patternId).toBeNull();
    expect(s.fill).toBe("#1A1A1A");
  });

  it("PY is outlined", () => {
    const s = getScenarioStyle("PY");
    expect(s.patternId).toBeNull();
    expect(s.fill).toBe("#FFFFFF");
    expect(s.strokeWidth).toBeGreaterThan(0);
  });

  it("PL/BU are hatched", () => {
    expect(getScenarioStyle("PL").patternId).toBe("hatch");
    expect(getScenarioStyle("BU").patternId).toBe("hatch");
  });

  it("VARIANCE_COLORS provides positive/negative/zero", () => {
    expect(VARIANCE_COLORS.positive).toBe("#7AB317");
    expect(VARIANCE_COLORS.negative).toBe("#DC2D2D");
    expect(VARIANCE_COLORS.zero).toBe("#8C8C8C");
  });
});
