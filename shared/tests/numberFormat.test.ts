import { describe, expect, it } from "vitest";
import { formatNumber, formatPercent } from "../src/numberFormat";

describe("formatNumber", () => {
  it("formats positive with thin space thousands", () => {
    expect(formatNumber(1234567)).toBe("1\u2009234\u2009567");
  });
  it("formats negative with parentheses by default", () => {
    expect(formatNumber(-73)).toBe("(73)");
  });
  it("formats negative with sign when configured", () => {
    expect(formatNumber(-73, { negatives: "sign" })).toBe("\u221273");
  });
  it("honors decimals", () => {
    expect(formatNumber(1234.567, { decimals: 2 })).toBe("1\u2009234.57");
  });
  it("returns empty for null", () => {
    expect(formatNumber(null)).toBe("");
  });
});

describe("formatPercent", () => {
  it("renders percent with non-breaking thin space", () => {
    expect(formatPercent(0.18)).toBe("18\u202F%");
  });
  it("uses unicode minus for negative", () => {
    expect(formatPercent(-0.12)).toBe("\u221212\u202F%");
  });
});
