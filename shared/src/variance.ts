import type { CategoryPoint, VariancePoint } from "./types";

/**
 * Compute absolute and relative variance between actual and reference.
 * - absolute = actual - reference
 * - percent  = (actual - reference) / |reference|   (null when reference is null or 0)
 * - sign: 1 positive, -1 negative, 0 exact zero, null when absolute is null
 *
 * `invert` flips the sign for cost-like measures where lower = better.
 */
export function computeVariance(p: CategoryPoint, invert = false): VariancePoint {
  const { actual, reference, category } = p;
  if (actual == null || reference == null) {
    return { category, absolute: null, percent: null, sign: null };
  }
  let absolute = actual - reference;
  if (invert) absolute = -absolute;
  const percent = reference === 0 ? null : absolute / Math.abs(reference);
  const sign: -1 | 0 | 1 = absolute > 0 ? 1 : absolute < 0 ? -1 : 0;
  return { category, absolute, percent, sign };
}

export function computeVarianceSeries(points: CategoryPoint[], invert = false): VariancePoint[] {
  return points.map((p) => computeVariance(p, invert));
}
