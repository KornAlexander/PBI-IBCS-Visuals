/**
 * Compound Annual (per-period) Growth Rate between a first and last value over a number
 * of periods.
 *
 *   CAGR = (last / first) ^ (1 / periods) - 1
 *
 * Returns the growth rate as a fraction (e.g. 0.18 for +18 %), or `null` when it cannot
 * be defined:
 *  - `first` or `last` is null,
 *  - `periods` < 1,
 *  - `first` is 0 (division by zero), or
 *  - `first` and `last` have opposite signs / `last` is negative with a fractional root
 *    (a real CAGR is only meaningful for same-sign, non-zero start values).
 */
export function computeCagr(
  first: number | null,
  last: number | null,
  periods: number
): number | null {
  if (first == null || last == null) return null;
  if (!Number.isFinite(periods) || periods < 1) return null;
  if (first === 0) return null;
  const ratio = last / first;
  // A fractional root of a negative ratio is not a real number; reject opposite signs.
  if (ratio < 0) return null;
  const rate = Math.pow(ratio, 1 / periods) - 1;
  return Number.isFinite(rate) ? rate : null;
}
