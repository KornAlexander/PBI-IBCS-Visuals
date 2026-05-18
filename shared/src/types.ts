export type Scenario = "AC" | "PY" | "PL" | "BU";

export interface CategoryPoint {
  category: string;
  actual: number | null;
  reference: number | null;
}

export interface VariancePoint {
  category: string;
  absolute: number | null;
  percent: number | null;
  sign: -1 | 0 | 1 | null;
}
