import type { Orientation } from "./chart";

/** User-facing layout choice. `auto` adapts to the available canvas size. */
export type LayoutMode = "auto" | "multi" | "single" | "inline";

/** Concrete layout actually rendered after resolving `auto`. */
export type ResolvedLayout = "multi" | "single" | "inline";

/**
 * Canvas-size thresholds (in px, measured along the axis that the variance tiers expand
 * into: width for bar orientation, height for column orientation) used by the `auto` layout.
 *
 *  - below INLINE_MAX   -> inline variance (no separate tier, most compact)
 *  - below SINGLE_MAX   -> a single variance tier
 *  - otherwise          -> the full multi-tier layout (Δ absolute + Δ%)
 */
export const LAYOUT_INLINE_MAX = 360;
export const LAYOUT_SINGLE_MAX = 560;

/** Pick a layout from the available canvas size for the given orientation. */
export function pickAutoLayout(orientation: Orientation, width: number, height: number): ResolvedLayout {
  const space = orientation === "bar" ? width : height;
  if (space < LAYOUT_INLINE_MAX) return "inline";
  if (space < LAYOUT_SINGLE_MAX) return "single";
  return "multi";
}

/** Resolve a (possibly `auto`) layout mode to a concrete layout. */
export function resolveLayout(
  mode: LayoutMode | undefined,
  orientation: Orientation,
  width: number,
  height: number
): ResolvedLayout {
  if (!mode || mode === "auto") return pickAutoLayout(orientation, width, height);
  return mode;
}
