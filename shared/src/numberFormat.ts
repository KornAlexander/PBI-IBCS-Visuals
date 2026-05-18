/**
 * Format a number for IBCS-compliant display.
 * - thousands separator: thin space (U+2009) by default
 * - negatives: parentheses by default, or sign
 * - configurable decimals
 */
export interface NumberFormatOptions {
  decimals?: number;
  thousands?: "thin" | "comma" | "period" | "none";
  negatives?: "parentheses" | "sign";
  suffix?: string;
}

export function formatNumber(value: number | null, opts: NumberFormatOptions = {}): string {
  if (value == null || !isFinite(value)) return "";
  const decimals = opts.decimals ?? 0;
  const thousandsChar =
    opts.thousands === "comma" ? ","
    : opts.thousands === "period" ? "."
    : opts.thousands === "none" ? ""
    : "\u2009";
  const negatives = opts.negatives ?? "parentheses";
  const suffix = opts.suffix ?? "";

  const abs = Math.abs(value);
  const fixed = abs.toFixed(decimals);
  const [intPart, fracPart] = fixed.split(".");
  const intWithSep = thousandsChar
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsChar)
    : intPart;
  const body = fracPart ? intWithSep + "." + fracPart : intWithSep;

  if (value < 0) {
    return negatives === "parentheses" ? `(${body}${suffix})` : `\u2212${body}${suffix}`;
  }
  return `${body}${suffix}`;
}

export function formatPercent(value: number | null, decimals = 0): string {
  if (value == null || !isFinite(value)) return "";
  return formatNumber(value * 100, { decimals, suffix: "\u202F%", negatives: "sign" });
}
