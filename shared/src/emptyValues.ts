import type { CategoryPoint } from "./types";

/**
 * How missing (null) measure values are handled before rendering.
 *  - `gap`         leave nulls as-is (default IBCS behaviour: render a gap).
 *  - `zero`        replace every null with 0.
 *  - `interpolate` linearly interpolate interior nulls from the nearest non-null
 *                  neighbours on each side. Leading/trailing nulls (no neighbour on
 *                  one side) are left as gaps.
 */
export type EmptyValueMode = "gap" | "zero" | "interpolate";

/**
 * Apply the chosen empty-value strategy to a category series.
 *
 * Operates independently on the `actual` and `reference` measures and preserves the
 * category order (interpolation assumes the points are in their natural axis order).
 * The input is never mutated; a new array of new point objects is returned.
 */
export function fillMissingValues(points: CategoryPoint[], mode: EmptyValueMode): CategoryPoint[] {
  if (mode === "gap") return points.map((p) => ({ ...p }));

  const actual = points.map((p) => p.actual);
  const reference = points.map((p) => p.reference);

  const fill = mode === "zero" ? fillZero : interpolateInterior;

  const filledActual = fill(actual);
  const filledReference = fill(reference);

  return points.map((p, i) => ({
    category: p.category,
    actual: filledActual[i],
    reference: filledReference[i]
  }));
}

function fillZero(series: (number | null)[]): (number | null)[] {
  return series.map((v) => (v == null ? 0 : v));
}

/**
 * Linearly interpolate interior null gaps. A null with a non-null value on both sides
 * is replaced by a straight-line value between the two surrounding anchors. Nulls with
 * no anchor on one side (leading/trailing) are kept null.
 */
function interpolateInterior(series: (number | null)[]): (number | null)[] {
  const out = series.slice();
  let prevIdx = -1;
  for (let i = 0; i < out.length; i++) {
    if (out[i] != null) {
      if (prevIdx >= 0 && i - prevIdx > 1) {
        const startV = series[prevIdx] as number;
        const endV = series[i] as number;
        const span = i - prevIdx;
        for (let k = prevIdx + 1; k < i; k++) {
          out[k] = startV + ((endV - startV) * (k - prevIdx)) / span;
        }
      }
      prevIdx = i;
    }
  }
  return out;
}
