import * as d3 from "d3";
import type { CategoryPoint, Scenario, VariancePoint } from "./types";
import { computeVarianceSeries } from "./variance";
import { getScenarioStyle, VARIANCE_COLORS } from "./scenarioStyle";
import { formatNumber, formatPercent } from "./numberFormat";

export type Orientation = "column" | "bar";

export interface ChartCallbacks {
  onPointClick?: (category: string, event: MouseEvent) => void;
  onPointHover?: (category: string, event: MouseEvent) => void;
  onPointLeave?: () => void;
  onBackgroundClick?: () => void;
  /** Categories currently selected; non-selected get dimmed. Empty = none selected (all full opacity). */
  selectedCategories?: Set<string>;
}

export interface ChartConfig {
  orientation: Orientation;
  scenario: Exclude<Scenario, "AC">;
  invert: boolean;
  showAbsoluteTier: boolean;
  showPercentTier: boolean;
  decimals: number;
  colors: {
    positive: string;
    negative: string;
    zero: string;
    acFill: string;
  };
  /** Width of category axis as percent of total chart width (bar orientation only). 5..60. */
  axisWidthPercent: number;
  /** Max number of categories to render before adding a scrollbar. */
  maxVisibleCategories: number;
  /** Per-category band size in pixels when scrolling (bar = row height; column = column width). */
  minBandPx: number;
  width: number;
  height: number;
  callbacks?: ChartCallbacks;
}

export interface ChartData {
  points: CategoryPoint[];
}

const FONT = "'Segoe UI', sans-serif";
const LABEL_SIZE = 11;
const HEADER_SIZE = 11;
const AXIS_SIZE = 11;
const TIER_GAP = 6;

export function renderChart(svgEl: SVGSVGElement, data: ChartData, cfg: ChartConfig): void {
  const svg = d3.select(svgEl);
  svg.selectAll("*").remove();
  svg.attr("font-family", FONT);

  // Background click clears selection
  svg.on("click", function (event) {
    if (event.target === this) cfg.callbacks?.onBackgroundClick?.();
  });

  defs(svg);

  const points = data.points;
  if (!points.length) {
    svg.attr("width", cfg.width).attr("height", cfg.height);
    svg
      .append("text")
      .attr("x", cfg.width / 2)
      .attr("y", cfg.height / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", LABEL_SIZE)
      .attr("fill", "#666")
      .text("No data");
    return;
  }

  const variance = computeVarianceSeries(points, cfg.invert);

  if (cfg.orientation === "column") {
    renderColumn(svg, points, variance, cfg);
  } else {
    renderBar(svg, points, variance, cfg);
  }

  applySelectionDimming(svg, cfg);
}

function applySelectionDimming(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  cfg: ChartConfig
) {
  const sel = cfg.callbacks?.selectedCategories;
  if (!sel || sel.size === 0) return;
  svg.selectAll<SVGGraphicsElement, unknown>("[data-cat]").attr("opacity", function () {
    const cat = (this as SVGGraphicsElement).getAttribute("data-cat") ?? "";
    return sel.has(cat) ? 1 : 0.35;
  });
}

/** Truncate <text> elements at the END with an ellipsis when they exceed maxWidthFn(d). */
function truncateTextEnd<T>(
  selection: d3.Selection<SVGTextElement, T, SVGGElement | SVGSVGElement, unknown>,
  maxWidthFn: (d: T) => number
): void {
  selection.each(function (d) {
    const node = this as SVGTextElement;
    const full = node.textContent ?? "";
    const maxW = maxWidthFn(d);
    if (!full || maxW <= 0 || node.getComputedTextLength() <= maxW) return;
    let lo = 0;
    let hi = full.length;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      node.textContent = full.slice(0, mid) + "\u2026";
      if (node.getComputedTextLength() <= maxW) lo = mid;
      else hi = mid - 1;
    }
    node.textContent = (lo === 0 ? "" : full.slice(0, lo)) + "\u2026";
  });
}

function defs(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
  const defs = svg.append("defs");
  const p = defs
    .append("pattern")
    .attr("id", "hatch")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 4)
    .attr("height", 4)
    .attr("patternTransform", "rotate(45)");
  p.append("rect").attr("width", 4).attr("height", 4).attr("fill", "#FFFFFF");
  p.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 4).attr("stroke", "#4D4D4D").attr("stroke-width", 1);
}

/* ----------------------------------------------------------------- COLUMN */

function renderColumn(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  points: CategoryPoint[],
  variance: VariancePoint[],
  cfg: ChartConfig
) {
  // Decide whether to scroll horizontally. Per-band min width = minBandPx; if data
  // exceeds maxVisibleCategories the SVG grows beyond viewport width.
  const n = points.length;
  const overflowing = n > cfg.maxVisibleCategories;
  const padL = 8;
  const padR = 12;
  const axisH = AXIS_SIZE + 6;
  const tierGapTotal = TIER_GAP * (numTiers(cfg) - 1);
  const hUsable = cfg.height - axisH - tierGapTotal - 14; // 14 = top space for headers
  const ratios = [60, cfg.showAbsoluteTier ? 20 : 0, cfg.showPercentTier ? 20 : 0];
  const sum = ratios.reduce((a, b) => a + b, 0) || 60;
  const tierH = ratios.map((r) => (r / sum) * hUsable);

  // SVG width: max(viewport, minBandPx*n + padding)
  const svgW = overflowing ? Math.max(cfg.width, n * cfg.minBandPx + padL + padR) : cfg.width;
  svg.attr("width", svgW).attr("height", cfg.height);

  const innerW = svgW - padL - padR;
  const x = d3
    .scaleBand<string>()
    .domain(points.map((p) => p.category))
    .range([0, innerW])
    .paddingInner(0.25)
    .paddingOuter(0.15);

  // Base tier
  let yOff = 14;
  const baseG = svg.append("g").attr("transform", `translate(${padL},${yOff})`);
  drawBaseTierColumn(baseG, points, x, tierH[0], cfg);
  yOff += tierH[0];

  if (cfg.showAbsoluteTier) {
    yOff += TIER_GAP;
    const g = svg.append("g").attr("transform", `translate(${padL},${yOff})`);
    drawVarianceTierColumn(g, variance, x, tierH[1], cfg, "abs");
    yOff += tierH[1];
  }
  if (cfg.showPercentTier) {
    yOff += TIER_GAP;
    const g = svg.append("g").attr("transform", `translate(${padL},${yOff})`);
    drawVarianceTierColumn(g, variance, x, tierH[2], cfg, "pct");
    yOff += tierH[2];
  }

  // Category axis
  const axisG = svg.append("g").attr("transform", `translate(${padL},${cfg.height - axisH + 2})`);
  const colLabels = axisG
    .selectAll<SVGTextElement, CategoryPoint>("text")
    .data(points)
    .enter()
    .append("text")
    .attr("x", (d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
    .attr("y", AXIS_SIZE)
    .attr("text-anchor", "middle")
    .attr("font-size", AXIS_SIZE)
    .attr("fill", "#333")
    .text((d) => d.category);
  colLabels.append("title").text((d) => d.category);
  truncateTextEnd<CategoryPoint>(colLabels, () => x.bandwidth() + 2);
}

function drawBaseTierColumn(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  points: CategoryPoint[],
  x: d3.ScaleBand<string>,
  h: number,
  cfg: ChartConfig
) {
  const vals = points.flatMap((p) => [p.actual ?? 0, p.reference ?? 0]);
  const max = d3.max(vals) ?? 1;
  const min = Math.min(0, d3.min(vals) ?? 0);
  const y = d3.scaleLinear().domain([min, max]).nice().range([h, 0]);

  // Header centered horizontally (zero line of variance tiers ≈ center)
  g.append("text")
    .attr("x", (x.range()[1] - x.range()[0]) / 2)
    .attr("y", -3)
    .attr("text-anchor", "middle")
    .attr("font-size", HEADER_SIZE)
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .text(`AC | ${cfg.scenario}`);

  g.append("line")
    .attr("x1", 0).attr("x2", x.range()[1])
    .attr("y1", y(0)).attr("y2", y(0))
    .attr("stroke", "#999").attr("stroke-width", 0.5);

  const refStyle = getScenarioStyle(cfg.scenario, cfg.colors.acFill);
  const band = x.bandwidth();
  // Same-size overlap: both bars same width, shifted horizontally
  const barW = band * 0.7;
  const refOffset = 0;
  const acOffset = band - barW;

  // Reference (left, behind)
  g.selectAll(".bar-ref")
    .data(points).enter()
    .append("rect")
    .attr("class", "bar-ref")
    .attr("data-cat", (d) => d.category)
    .attr("x", (d) => (x(d.category) ?? 0) + refOffset)
    .attr("y", (d) => y(Math.max(0, d.reference ?? 0)))
    .attr("width", barW)
    .attr("height", (d) => Math.abs(y(d.reference ?? 0) - y(0)))
    .attr("fill", refStyle.patternId ? `url(#${refStyle.patternId})` : refStyle.fill)
    .attr("stroke", refStyle.stroke)
    .attr("stroke-width", refStyle.strokeWidth);

  // AC (right, on top, same size)
  g.selectAll(".bar-ac")
    .data(points).enter()
    .append("rect")
    .attr("class", "bar-ac")
    .attr("data-cat", (d) => d.category)
    .attr("x", (d) => (x(d.category) ?? 0) + acOffset)
    .attr("y", (d) => y(Math.max(0, d.actual ?? 0)))
    .attr("width", barW)
    .attr("height", (d) => Math.abs(y(d.actual ?? 0) - y(0)))
    .attr("fill", cfg.colors.acFill)
    .style("cursor", "pointer");

  attachInteractivity(g, cfg);

  // AC value labels
  g.selectAll(".lbl-ac")
    .data(points).enter()
    .append("text")
    .attr("class", "lbl-ac")
    .attr("data-cat", (d) => d.category)
    .attr("x", (d) => (x(d.category) ?? 0) + acOffset + barW / 2)
    .attr("y", (d) => Math.max(LABEL_SIZE, y(d.actual ?? 0) - 2))
    .attr("text-anchor", "middle")
    .attr("font-size", LABEL_SIZE)
    .attr("fill", "#333")
    .text((d) => (d.actual == null || Math.abs(y(d.actual) - y(0)) < 12 ? "" : formatNumber(d.actual, { decimals: cfg.decimals })));
}

function drawVarianceTierColumn(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  variance: VariancePoint[],
  x: d3.ScaleBand<string>,
  h: number,
  cfg: ChartConfig,
  mode: "abs" | "pct"
) {
  const accessor = (v: VariancePoint) => (mode === "abs" ? v.absolute : v.percent);
  const vals = variance.map(accessor).filter((v): v is number => v != null);
  const m = Math.max(Math.abs(d3.min(vals) ?? 0), Math.abs(d3.max(vals) ?? 0)) || 1;
  const y = d3.scaleLinear().domain([-m, m]).range([h, 0]);

  // Header centered horizontally above the tier (i.e., over the chart middle)
  g.append("text")
    .attr("x", (x.range()[1] - x.range()[0]) / 2)
    .attr("y", -3)
    .attr("text-anchor", "middle")
    .attr("font-size", HEADER_SIZE)
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .text(mode === "abs" ? `Δ${cfg.scenario}` : `Δ${cfg.scenario}%`);

  g.append("line")
    .attr("x1", 0).attr("x2", x.range()[1])
    .attr("y1", y(0)).attr("y2", y(0))
    .attr("stroke", "#666").attr("stroke-width", 0.75);

  const band = x.bandwidth();
  if (mode === "pct") {
    // Pin notation: thin line from zero baseline to value, with small square head.
    const PIN = 5;
    g.selectAll("line.pin")
      .data(variance).enter()
      .append("line")
      .attr("class", "pin")
      .attr("data-cat", (d) => d.category)
      .attr("x1", (d) => (x(d.category) ?? 0) + band / 2)
      .attr("x2", (d) => (x(d.category) ?? 0) + band / 2)
      .attr("y1", y(0))
      .attr("y2", (d) => {
        const v = accessor(d);
        return v == null ? y(0) : y(v);
      })
      .attr("stroke", (d) => colorForVariance(accessor(d), cfg))
      .attr("stroke-width", 1);

    g.selectAll("rect.pin-head")
      .data(variance).enter()
      .append("rect")
      .attr("class", "pin-head")
      .attr("data-cat", (d) => d.category)
      .attr("x", (d) => (x(d.category) ?? 0) + band / 2 - PIN / 2)
      .attr("y", (d) => {
        const v = accessor(d);
        return (v == null ? y(0) : y(v)) - PIN / 2;
      })
      .attr("width", (d) => (accessor(d) == null ? 0 : PIN))
      .attr("height", (d) => (accessor(d) == null ? 0 : PIN))
      .attr("fill", (d) => colorForVariance(accessor(d), cfg))
      .style("cursor", "pointer");
  } else {
    g.selectAll("rect.var")
      .data(variance).enter()
      .append("rect")
      .attr("class", "var")
      .attr("data-cat", (d) => d.category)
      .attr("x", (d) => x(d.category) ?? 0)
      .attr("y", (d) => {
        const v = accessor(d);
        return v == null ? y(0) : v >= 0 ? y(v) : y(0);
      })
      .attr("width", band)
      .attr("height", (d) => {
        const v = accessor(d);
        return v == null ? 0 : Math.abs(y(v) - y(0));
      })
      .attr("fill", (d) => colorForVariance(accessor(d), cfg))
      .style("cursor", "pointer");
  }

  attachInteractivity(g, cfg);

  g.selectAll(".lbl")
    .data(variance).enter()
    .append("text")
    .attr("class", "lbl")
    .attr("data-cat", (d) => d.category)
    .attr("x", (d) => (x(d.category) ?? 0) + band / 2)
    .attr("y", (d) => {
      const v = accessor(d);
      if (v == null) return y(0);
      return v >= 0 ? Math.max(LABEL_SIZE, y(v) - 2) : Math.min(h - 2, y(v) + LABEL_SIZE + 1);
    })
    .attr("text-anchor", "middle")
    .attr("font-size", LABEL_SIZE)
    .attr("fill", "#333")
    .text((d) => {
      const v = accessor(d);
      if (v == null) return "";
      return mode === "abs" ? formatNumber(v, { decimals: cfg.decimals, negatives: "sign" }) : formatPercent(v, 0);
    });
}

/* -------------------------------------------------------------------- BAR */

function renderBar(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  points: CategoryPoint[],
  variance: VariancePoint[],
  cfg: ChartConfig
) {
  const n = points.length;
  const overflowing = n > cfg.maxVisibleCategories;
  const padTop = 22;
  const padBottom = 6;

  // SVG height accommodates either viewport or per-row min-band when overflowing.
  const visibleN = Math.min(n, cfg.maxVisibleCategories);
  const innerHViewport = cfg.height - padTop - padBottom;
  const rowH = overflowing ? cfg.minBandPx : Math.max(cfg.minBandPx, innerHViewport / Math.max(1, visibleN));
  const innerH = overflowing ? rowH * n : innerHViewport;
  const svgH = overflowing ? innerH + padTop + padBottom : cfg.height;
  svg.attr("width", cfg.width).attr("height", svgH);

  // Axis width: percentage of chart width, clamped 5..60
  const pct = Math.min(60, Math.max(5, cfg.axisWidthPercent));
  const axisW = Math.round((cfg.width * pct) / 100);

  const y = d3
    .scaleBand<string>()
    .domain(points.map((p) => p.category))
    .range([0, innerH])
    .paddingInner(0.25)
    .paddingOuter(0.15);

  // Category labels on the left, truncated to axisW with trailing ellipsis if too long
  const axisG = svg.append("g").attr("transform", `translate(0,${padTop})`);
  const labels = axisG
    .selectAll<SVGTextElement, CategoryPoint>("text")
    .data(points)
    .enter()
    .append("text")
    .attr("x", axisW - 6)
    .attr("y", (d) => (y(d.category) ?? 0) + y.bandwidth() / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "end")
    .attr("font-size", AXIS_SIZE)
    .attr("fill", "#333")
    .text((d) => d.category);
  labels.append("title").text((d) => d.category);
  truncateTextEnd<CategoryPoint>(labels, () => axisW - 8);

  const totalW = cfg.width - axisW;
  const ratios = [60, cfg.showAbsoluteTier ? 20 : 0, cfg.showPercentTier ? 20 : 0];
  const sum = ratios.reduce((a, b) => a + b, 0) || 60;
  const usableW = totalW - TIER_GAP * (numTiers(cfg) - 1);
  const widths = ratios.map((r) => (r / sum) * usableW);

  let xOff = axisW;
  const baseG = svg.append("g").attr("transform", `translate(${xOff},${padTop})`);
  drawBaseTierBar(baseG, points, y, widths[0], cfg);
  xOff += widths[0];

  if (cfg.showAbsoluteTier) {
    xOff += TIER_GAP;
    const g = svg.append("g").attr("transform", `translate(${xOff},${padTop})`);
    drawVarianceTierBar(g, variance, y, widths[1], cfg, "abs");
    xOff += widths[1];
  }
  if (cfg.showPercentTier) {
    xOff += TIER_GAP;
    const g = svg.append("g").attr("transform", `translate(${xOff},${padTop})`);
    drawVarianceTierBar(g, variance, y, widths[2], cfg, "pct");
  }
}

function drawBaseTierBar(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  points: CategoryPoint[],
  y: d3.ScaleBand<string>,
  w: number,
  cfg: ChartConfig
) {
  const vals = points.flatMap((p) => [p.actual ?? 0, p.reference ?? 0]);
  const max = d3.max(vals) ?? 1;
  const min = Math.min(0, d3.min(vals) ?? 0);
  const x = d3.scaleLinear().domain([min, max]).nice().range([0, w]);

  // Header centered on tier
  g.append("text")
    .attr("x", w / 2).attr("y", -8)
    .attr("text-anchor", "middle")
    .attr("font-size", HEADER_SIZE).attr("font-weight", "bold").attr("fill", "#333")
    .text(`AC | ${cfg.scenario}`);

  g.append("line")
    .attr("x1", x(0)).attr("x2", x(0))
    .attr("y1", 0).attr("y2", y.range()[1])
    .attr("stroke", "#999").attr("stroke-width", 0.5);

  const refStyle = getScenarioStyle(cfg.scenario, cfg.colors.acFill);
  const band = y.bandwidth();
  // Same-size overlap: both bars are barH high, offset vertically so both edges visible.
  const barH = band * 0.7;
  const refOffset = 0;
  const acOffset = band - barH;

  // Reference (top, behind)
  g.selectAll(".bar-ref")
    .data(points).enter()
    .append("rect")
    .attr("class", "bar-ref")
    .attr("data-cat", (d) => d.category)
    .attr("x", (d) => Math.min(x(0), x(d.reference ?? 0)))
    .attr("y", (d) => (y(d.category) ?? 0) + refOffset)
    .attr("width", (d) => Math.abs(x(d.reference ?? 0) - x(0)))
    .attr("height", barH)
    .attr("fill", refStyle.patternId ? `url(#${refStyle.patternId})` : refStyle.fill)
    .attr("stroke", refStyle.stroke)
    .attr("stroke-width", refStyle.strokeWidth);

  // AC (bottom, on top, same size)
  g.selectAll(".bar-ac")
    .data(points).enter()
    .append("rect")
    .attr("class", "bar-ac")
    .attr("data-cat", (d) => d.category)
    .attr("x", (d) => Math.min(x(0), x(d.actual ?? 0)))
    .attr("y", (d) => (y(d.category) ?? 0) + acOffset)
    .attr("width", (d) => Math.abs(x(d.actual ?? 0) - x(0)))
    .attr("height", barH)
    .attr("fill", cfg.colors.acFill)
    .style("cursor", "pointer");

  attachInteractivity(g, cfg);

  // AC labels (at end of bar)
  g.selectAll(".lbl-ac")
    .data(points).enter()
    .append("text")
    .attr("class", "lbl-ac")
    .attr("data-cat", (d) => d.category)
    .attr("x", (d) => x(d.actual ?? 0) + 3)
    .attr("y", (d) => (y(d.category) ?? 0) + acOffset + barH / 2)
    .attr("dominant-baseline", "middle")
    .attr("font-size", LABEL_SIZE)
    .attr("fill", "#333")
    .text((d) => (d.actual == null ? "" : formatNumber(d.actual, { decimals: cfg.decimals })));
}

function drawVarianceTierBar(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  variance: VariancePoint[],
  y: d3.ScaleBand<string>,
  w: number,
  cfg: ChartConfig,
  mode: "abs" | "pct"
) {
  const accessor = (v: VariancePoint) => (mode === "abs" ? v.absolute : v.percent);
  const vals = variance.map(accessor).filter((v): v is number => v != null);
  const m = Math.max(Math.abs(d3.min(vals) ?? 0), Math.abs(d3.max(vals) ?? 0)) || 1;
  const x = d3.scaleLinear().domain([-m, m]).range([0, w]);

  // Header centered on the zero line (middle of the tier since extent is symmetric)
  g.append("text")
    .attr("x", x(0))
    .attr("y", -8)
    .attr("text-anchor", "middle")
    .attr("font-size", HEADER_SIZE).attr("font-weight", "bold").attr("fill", "#333")
    .text(mode === "abs" ? `Δ${cfg.scenario}` : `Δ${cfg.scenario}%`);

  g.append("line")
    .attr("x1", x(0)).attr("x2", x(0))
    .attr("y1", 0).attr("y2", y.range()[1])
    .attr("stroke", "#666").attr("stroke-width", 0.75);

  const band = y.bandwidth();
  if (mode === "pct") {
    // Pin notation: thin line from zero baseline to value, with small square head.
    const PIN = 5;
    g.selectAll("line.pin")
      .data(variance).enter()
      .append("line")
      .attr("class", "pin")
      .attr("data-cat", (d) => d.category)
      .attr("x1", x(0))
      .attr("x2", (d) => {
        const v = accessor(d);
        return v == null ? x(0) : x(v);
      })
      .attr("y1", (d) => (y(d.category) ?? 0) + band / 2)
      .attr("y2", (d) => (y(d.category) ?? 0) + band / 2)
      .attr("stroke", (d) => colorForVariance(accessor(d), cfg))
      .attr("stroke-width", 1);

    g.selectAll("rect.pin-head")
      .data(variance).enter()
      .append("rect")
      .attr("class", "pin-head")
      .attr("data-cat", (d) => d.category)
      .attr("x", (d) => {
        const v = accessor(d);
        return (v == null ? x(0) : x(v)) - PIN / 2;
      })
      .attr("y", (d) => (y(d.category) ?? 0) + band / 2 - PIN / 2)
      .attr("width", (d) => (accessor(d) == null ? 0 : PIN))
      .attr("height", (d) => (accessor(d) == null ? 0 : PIN))
      .attr("fill", (d) => colorForVariance(accessor(d), cfg))
      .style("cursor", "pointer");
  } else {
    g.selectAll("rect.var")
      .data(variance).enter()
      .append("rect")
    .attr("class", "var")
    .attr("data-cat", (d) => d.category)
    .attr("x", (d) => {
      const v = accessor(d);
      if (v == null) return x(0);
      return v >= 0 ? x(0) : x(v);
    })
    .attr("y", (d) => y(d.category) ?? 0)
    .attr("width", (d) => {
      const v = accessor(d);
      return v == null ? 0 : Math.abs(x(v) - x(0));
    })
    .attr("height", band)
    .attr("fill", (d) => colorForVariance(accessor(d), cfg))
    .style("cursor", "pointer");
  }

  attachInteractivity(g, cfg);

  g.selectAll(".lbl")
    .data(variance).enter()
    .append("text")
    .attr("class", "lbl")
    .attr("data-cat", (d) => d.category)
    .attr("x", (d) => {
      const v = accessor(d);
      if (v == null) return x(0);
      return v >= 0 ? x(v) + 3 : x(v) - 3;
    })
    .attr("y", (d) => (y(d.category) ?? 0) + band / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", (d) => {
      const v = accessor(d);
      return v != null && v < 0 ? "end" : "start";
    })
    .attr("font-size", LABEL_SIZE)
    .attr("fill", "#333")
    .text((d) => {
      const v = accessor(d);
      if (v == null) return "";
      return mode === "abs" ? formatNumber(v, { decimals: cfg.decimals, negatives: "sign" }) : formatPercent(v, 0);
    });
}

/* --------------------------------------------------------------- helpers */

function attachInteractivity(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  cfg: ChartConfig
) {
  const cb = cfg.callbacks;
  if (!cb) return;
  g.selectAll<SVGGraphicsElement, { category?: string }>("[data-cat]")
    .on("click", function (event) {
      event.stopPropagation();
      const cat = (this as SVGGraphicsElement).getAttribute("data-cat") ?? "";
      cb.onPointClick?.(cat, event as MouseEvent);
    })
    .on("mousemove", function (event) {
      const cat = (this as SVGGraphicsElement).getAttribute("data-cat") ?? "";
      cb.onPointHover?.(cat, event as MouseEvent);
    })
    .on("mouseleave", function () {
      cb.onPointLeave?.();
    });
}

function numTiers(cfg: ChartConfig): number {
  return 1 + (cfg.showAbsoluteTier ? 1 : 0) + (cfg.showPercentTier ? 1 : 0);
}

function colorForVariance(v: number | null, cfg: ChartConfig): string {
  if (v == null) return "transparent";
  if (v > 0) return cfg.colors.positive;
  if (v < 0) return cfg.colors.negative;
  return cfg.colors.zero;
}

export const PALETTE = {
  positive: VARIANCE_COLORS.positive,
  negative: VARIANCE_COLORS.negative,
  zero: VARIANCE_COLORS.zero,
  acFill: "#1A1A1A"
};
