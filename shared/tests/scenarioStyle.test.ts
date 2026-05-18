import { describe, expect, it } from "vitest";
import { getScenarioStyle, VARIANCE_COLORS } from "../src/scenarioStyle";

describe("getScenarioStyle", () => {
  it("AC is solid (acFill)", () => {
    const s = getScenarioStyle("AC", "#1A1A1A");
    expect(s.patternId).toBeNull();
    expect(s.fill).toBe("#1A1A1A");
  });

  it("PY is a light solid fill (no border)", () => {
    const s = getScenarioStyle("PY");
    expect(s.patternId).toBeNull();
    expect(s.fill).toBe("#BFBFBF");
    expect(s.strokeWidth).toBe(0);
  });

  it("PL is outlined", () => {
    const s = getScenarioStyle("PL");
    expect(s.patternId).toBeNull();
    expect(s.fill).toBe("#FFFFFF");
    expect(s.strokeWidth).toBeGreaterThan(0);
  });

  it("BU is outlined like PL", () => {
    expect(getScenarioStyle("BU").fill).toBe("#FFFFFF");
    expect(getScenarioStyle("BU").patternId).toBeNull();
  });

  it("FC is hatched", () => {
    const s = getScenarioStyle("FC");
    expect(s.patternId).toBe("hatch");
  });

  it("VARIANCE_COLORS uses bright red as negative default", () => {
    expect(VARIANCE_COLORS.positive).toBe("#7AB317");
    expect(VARIANCE_COLORS.negative).toBe("#FF0000");
    expect(VARIANCE_COLORS.zero).toBe("#8C8C8C");
  });
});
