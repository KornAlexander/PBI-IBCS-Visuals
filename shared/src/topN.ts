import type { CategoryPoint } from "./types";

export interface TopNOptions {
  /** Number of leading categories to keep. <= 0 or >= length disables grouping. */
  topN: number;
  /** When true, all remaining categories are aggregated into a single "Others" point. */
  showOthers: boolean;
  /** Label used for the aggregated bucket. Defaults to "Others". */
  othersLabel?: string;
  /**
   * Which end of the (already sorted) list to keep:
   *  - `"top"`    keep the leading N (default).
   *  - `"bottom"` keep the trailing N (Bottom N) — useful for "worst/smallest" views.
   * In both cases the kept points retain their original relative order and the "Others"
   * bucket is appended after them.
   */
  from?: "top" | "bottom";
}

/**
 * Reduce a (already sorted) list of category points to the top (or bottom) N, optionally
 * folding the remainder into a single aggregated "Others" point.
 *
 * - Returns a shallow copy; the input is never mutated.
 * - When `topN` is non-positive or covers the whole list, the points are returned unchanged.
 * - "Others" sums the non-null actuals and references of the remaining points. If every
 *   remaining value for a measure is null, that measure stays null.
 */
export function applyTopN(points: CategoryPoint[], opts: TopNOptions): CategoryPoint[] {
  const n = Math.floor(opts.topN);
  if (!Number.isFinite(n) || n <= 0 || n >= points.length) {
    return points.slice();
  }

  const fromBottom = opts.from === "bottom";
  const kept = fromBottom ? points.slice(points.length - n) : points.slice(0, n);
  const rest = fromBottom ? points.slice(0, points.length - n) : points.slice(n);

  if (!opts.showOthers) {
    return kept;
  }

  let actual: number | null = null;
  let reference: number | null = null;
  for (const p of rest) {
    if (p.actual != null) actual = (actual ?? 0) + p.actual;
    if (p.reference != null) reference = (reference ?? 0) + p.reference;
  }

  kept.push({ category: opts.othersLabel ?? "Others", actual, reference });
  return kept;
}
