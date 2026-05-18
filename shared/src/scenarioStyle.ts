import type { Scenario } from "./types";

export interface ScenarioStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  /** SVG <pattern> id, set on PL/BU for hatched fill; null = solid */
  patternId: "hatch" | null;
}

/** IBCS semantic colors for variance bars/columns. */
export const VARIANCE_COLORS = {
  positive: "#7AB317",
  negative: "#DC2D2D",
  zero: "#8C8C8C"
} as const;

const BLACK = "#1A1A1A";
const DARK_GRAY = "#4D4D4D";

/** Notation per IBCS: AC solid, PY outlined, PL/BU hatched. (FC dotted = Phase 2.) */
export function getScenarioStyle(s: Scenario): ScenarioStyle {
  switch (s) {
    case "AC":
      return { fill: BLACK, stroke: BLACK, strokeWidth: 0, patternId: null };
    case "PY":
      return { fill: "#FFFFFF", stroke: DARK_GRAY, strokeWidth: 1, patternId: null };
    case "PL":
    case "BU":
      return { fill: "#FFFFFF", stroke: DARK_GRAY, strokeWidth: 1, patternId: "hatch" };
  }
}
