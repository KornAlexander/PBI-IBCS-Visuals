import type { Scenario } from "./types";

export interface ScenarioStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  /** SVG <pattern> id; null = solid fill */
  patternId: "hatch" | null;
}

/** IBCS semantic colors for variance bars/columns. */
export const VARIANCE_COLORS = {
  positive: "#7AB317",
  negative: "#FF0000",
  zero: "#8C8C8C"
} as const;

const BLACK = "#1A1A1A";
const LIGHT_AC = "#BFBFBF";
const DARK_GRAY = "#4D4D4D";

/**
 * IBCS notation (per user mapping):
 *   AC  = solid (acFill, default black)
 *   PY  = light fill (light version of AC, no border)
 *   PL  = outlined (white fill + dark border)
 *   BU  = outlined (same as PL)
 *   FC  = hatched (Phase 2)
 */
export function getScenarioStyle(s: Scenario, acFill: string = BLACK): ScenarioStyle {
  switch (s) {
    case "AC":
      return { fill: acFill, stroke: acFill, strokeWidth: 0, patternId: null };
    case "PY":
      return { fill: LIGHT_AC, stroke: LIGHT_AC, strokeWidth: 0, patternId: null };
    case "PL":
    case "BU":
      return { fill: "#FFFFFF", stroke: DARK_GRAY, strokeWidth: 1, patternId: null };
    case "FC":
      return { fill: "#FFFFFF", stroke: DARK_GRAY, strokeWidth: 1, patternId: "hatch" };
  }
}
