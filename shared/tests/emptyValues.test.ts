import { describe, it, expect } from "vitest";
import { fillMissingValues } from "../src/emptyValues";
import type { CategoryPoint } from "../src/types";

const data: CategoryPoint[] = [
  { category: "A", actual: 100, reference: 90 },
  { category: "B", actual: null, reference: null },
  { category: "C", actual: 60, reference: 50 },
  { category: "D", actual: null, reference: 30 }
];

describe("fillMissingValues", () => {
  it("leaves nulls untouched in gap mode but returns a copy", () => {
    const out = fillMissingValues(data, "gap");
    expect(out).not.toBe(data);
    expect(out[0]).not.toBe(data[0]);
    expect(out.map((p) => p.actual)).toEqual([100, null, 60, null]);
    expect(out.map((p) => p.reference)).toEqual([90, null, 50, 30]);
  });

  it("replaces every null with zero in zero mode", () => {
    const out = fillMissingValues(data, "zero");
    expect(out.map((p) => p.actual)).toEqual([100, 0, 60, 0]);
    expect(out.map((p) => p.reference)).toEqual([90, 0, 50, 30]);
  });

  it("linearly interpolates interior gaps", () => {
    const out = fillMissingValues(data, "interpolate");
    // actual B between 100 and 60 => 80
    expect(out[1].actual).toBe(80);
    // reference B between 90 and 50 => 70
    expect(out[1].reference).toBe(70);
  });

  it("leaves trailing nulls as gaps when interpolating (no right anchor)", () => {
    const out = fillMissingValues(data, "interpolate");
    expect(out[3].actual).toBeNull();
  });

  it("leaves leading nulls as gaps when interpolating (no left anchor)", () => {
    const lead: CategoryPoint[] = [
      { category: "A", actual: null, reference: null },
      { category: "B", actual: 10, reference: 5 }
    ];
    const out = fillMissingValues(lead, "interpolate");
    expect(out[0].actual).toBeNull();
    expect(out[0].reference).toBeNull();
  });

  it("interpolates across multiple consecutive gaps", () => {
    const span: CategoryPoint[] = [
      { category: "A", actual: 0, reference: null },
      { category: "B", actual: null, reference: null },
      { category: "C", actual: null, reference: null },
      { category: "D", actual: 30, reference: null }
    ];
    const out = fillMissingValues(span, "interpolate");
    expect(out.map((p) => p.actual)).toEqual([0, 10, 20, 30]);
  });

  it("does not mutate the input", () => {
    const copy = data.map((p) => ({ ...p }));
    fillMissingValues(data, "zero");
    expect(data).toEqual(copy);
  });
});
