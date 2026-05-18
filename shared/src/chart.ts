import * as d3 from "d3";
import type { CategoryPoint, Scenario, VariancePoint } from "./types";
import { computeVarianceSeries } from "./variance";
import { getScenarioStyle, VARIANCE_COLORS } from "./scenarioStyle";
import { formatNumber, formatPercent } from "./numberFormat";

export type Orientation = "column" | "bar";

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
  width: number;
  height: number;
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
  svg.attr("width", cfg.width).attr("height", cfg.height).attr("font-family", FONT);

  defs(svg);

  const points = data.points;
  if (!points.length) {
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

function tierHeights(total: number, cfg: ChartConfig, axisH: number) {
  const ratios = [60, cfg.showAbsoluteTier ? 20 : 0, cfg.showPercentTier ? 20 : 0];
  const sum = ratios.reduce((a, b) => a + b, 0) || 60;
  const usable = total - axisH - TIER_GAP * (ratios.filter((r) => r > 0).length - 1);
  return ratios.map((r) => (r / sum) * usable);
}

function renderColumn(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  points: CategoryPoint[],
  variance: VariancePoint[],
  cfg: ChartConfig
) {
  const axisH = AXIS_SIZE + 6;
  const [hBase, hAbs, hPct] = tierHeights(cfg.height, cfg, axisH);
  const padL = 40;
  const padR = 12;
  const innerW = cfg.width - padL - padR;

  const x = d3
    .scaleBand<string>()
    .domain(points.map((p) => p.category))
    .range([0, innerW])
    .paddingInner(0.25)
    .paddingOuter(0.2);

  // Base tier
  const baseG = svg.append("g").attr("transform", `translate(${padL},0)`);
  drawBaseTierColumn(baseG, points, x, hBase, cfg);

  let y = hBase;
  if (cfg.showAbsoluteTier) {
    y += TIER_GAP;
    const g = svg.append("g").attr("transform", `translate(${padL},${y})`);
    drawVarianceTierColumn(g, variance, x, hAbs, cfg, "abs");
    y += hAbs;
  }
  if (cfg.showPercentTier) {
    y += TIER_GAP;
    const g = svg.append("g").attr("transform", `translate(${padL},${y})`);
    drawVarianceTierColumn(g, variance, x, hPct, cfg, "pct");
    y += hPct;
  }

  // Category axis at the very bottom
  const axisG = svg.append("g").attr("transform", `translate(${padL},${cfg.height - axisH + 2})`);
  axisG
    .selectAll("text")
    .data(points)
    .enter()
    .append("text")
    .attr("x", (d) => (x(d.category) ?? 0) + x.bandwidth() / 2)
    .attr("y", AXIS_SIZE)
    .attr("text-anchor", "middle")
    .attr("font-size", AXIS_SIZE)
    .attr("fill", "#333")
    .text((d) => d.category);
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

  // Header
  g.append("text")
    .attr("x", -4)
    .attr("y", -2)
    .attr("text-anchor", "end")
    .attr("font-size", HEADER_SIZE)
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .text(`AC | ${cfg.scenario}`);

  // Zero baseline
  g.append("line")
    .attr("x1", 0).attr("x2", x.range()[1])
    .attr("y1", y(0)).attr("y2", y(0))
    .attr("stroke", "#999").attr("stroke-width", 0.5);

  const refStyle = getScenarioStyle(cfg.scenario);
  const innerBand = x.bandwidth();
  const barW = innerBand / 2 - 1;

  // Reference bars (left within group)
  g.selectAll(".bar-ref")
    .data(points)
    .enter()
    .append("rect")
    .attr("class", "bar-ref")
    .attr("x", (d) => (x(d.category) ?? 0))
    .attr("y", (d) => y(Math.max(0, d.reference ?? 0)))
    .attr("width", barW)
    .attr("height", (d) => Math.abs(y(d.reference ?? 0) - y(0)))
    .attr("fill", refStyle.patternId ? `url(#${refStyle.patternId})` : refStyle.fill)
    .attr("stroke", refStyle.stroke)
    .attr("stroke-width", refStyle.strokeWidth);

  // AC bars (right within group)
  g.selectAll(".bar-ac")
    .data(points)
    .enter()
    .append("rect")
    .attr("class", "bar-ac")
    .attr("x", (d) => (x(d.category) ?? 0) + barW + 2)
    .attr("y", (d) => y(Math.max(0, d.actual ?? 0)))
    .attr("width", barW)
    .attr("height", (d) => Math.abs(y(d.actual ?? 0) - y(0)))
    .attr("fill", cfg.colors.acFill);

  // Value labels on AC bars (when bar tall enough)
  g.selectAll(".lbl-ac")
    .data(points)
    .enter()
    .append("text")
    .attr("class", "lbl-ac")
    .attr("x", (d) => (x(d.category) ?? 0) + barW + 2 + barW / 2)
    .attr("y", (d) => Math.max(LABEL_SIZE, y(d.actual ?? 0) - 2))
    .attr("text-anchor", "middle")
    .attr("font-size", LABEL_SIZE)
    .attr("fill", "#333")
    .text((d) =>
      d.actual == null || Math.abs(y(d.actual) - y(0)) < 12 ? "" : formatNumber(d.actual, { decimals: cfg.decimals })
    );
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
  const extent = d3.extent(vals);
  const m = Math.max(Math.abs(extent[0] ?? 0), Math.abs(extent[1] ?? 0)) || 1;
  const y = d3.scaleLinear().domain([-m, m]).range([h, 0]);

  // Header
  const headerText = mode === "abs" ? `Δ${cfg.scenario}` : `Δ${cfg.scenario}%`;
  g.append("text")
    .attr("x", -4).attr("y", -2)
    .attr("text-anchor", "end")
    .attr("font-size", HEADER_SIZE)
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .text(headerText);

  // Zero line
  g.append("line")
    .attr("x1", 0).attr("x2", x.range()[1])
    .attr("y1", y(0)).attr("y2", y(0))
    .attr("stroke", "#666").attr("stroke-width", 0.75);

  const barW = x.bandwidth();

  g.selectAll("rect")
    .data(variance)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.category) ?? 0)
    .attr("y", (d) => {
      const v = accessor(d);
      if (v == null) return y(0);
      return v >= 0 ? y(v) : y(0);
    })
    .attr("width", barW)
    .attr("height", (d) => {
      const v = accessor(d);
      if (v == null) return 0;
      return Math.abs(y(v) - y(0));
    })
    .attr("fill", (d) => {
      const v = accessor(d);
      if (v == null) return "transparent";
      if (v > 0) return cfg.colors.positive;
      if (v < 0) return cfg.colors.negative;
      return cfg.colors.zero;
    });

  g.selectAll(".lbl")
    .data(variance)
    .enter()
    .append("text")
    .attr("class", "lbl")
    .attr("x", (d) => (x(d.category) ?? 0) + barW / 2)
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
      return mode === "abs"
        ? formatNumber(v, { decimals: cfg.decimals })
        : formatPercent(v, 0);
    });
}

function renderBar(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  points: CategoryPoint[],
  variance: VariancePoint[],
  cfg: ChartConfig
) {
  const axisW = 60;
  const padTop = 18;
  const padBottom = 4;
  const innerH = cfg.height - padTop - padBottom;

  const totalW = cfg.width - axisW;
  const ratios = [60, cfg.showAbsoluteTier ? 20 : 0, cfg.showPercentTier ? 20 : 0];
  const sum = ratios.reduce((a, b) => a + b, 0) || 60;
  const usableW = totalW - TIER_GAP * (ratios.filter((r) => r > 0).length - 1);
  const widths = ratios.map((r) => (r / sum) * usableW);

  const y = d3
    .scaleBand<string>()
    .domain(points.map((p) => p.category))
    .range([0, innerH])
    .paddingInner(0.25)
    .paddingOuter(0.2);

  // Category labels on the left
  const axisG = svg.append("g").attr("transform", `translate(0,${padTop})`);
  axisG
    .selectAll("text")
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

  let xOff = axisW;
  const baseG = svg.append("g").attr("transform", `translate(${xOff},${padTop})`);
  drawBaseTierBar(baseG, points, y, widths[0], innerH, cfg);
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
  _h: number,
  cfg: ChartConfig
) {
  const vals = points.flatMap((p) => [p.actual ?? 0, p.reference ?? 0]);
  const max = d3.max(vals) ?? 1;
  const min = Math.min(0, d3.min(vals) ?? 0);
  const x = d3.scaleLinear().domain([min, max]).nice().range([0, w]);

  g.append("text")
    .attr("x", 0).attr("y", -4)
    .attr("font-size", HEADER_SIZE).attr("font-weight", "bold").attr("fill", "#333")
    .text(`AC | ${cfg.scenario}`);

  g.append("line")
    .attr("x1", x(0)).attr("x2", x(0))
    .attr("y1", 0).attr("y2", y.range()[1])
    .attr("stroke", "#999").attr("stroke-width", 0.5);

  const refStyle = getScenarioStyle(cfg.scenario);
  const innerBand = y.bandwidth();
  const barH = innerBand / 2 - 1;

  g.selectAll(".bar-ref")
    .data(points)
    .enter()
    .append("rect")
    .attr("class", "bar-ref")
    .attr("x", (d) => Math.min(x(0), x(d.reference ?? 0)))
    .attr("y", (d) => y(d.category) ?? 0)
    .attr("width", (d) => Math.abs(x(d.reference ?? 0) - x(0)))
    .attr("height", barH)
    .attr("fill", refStyle.patternId ? `url(#${refStyle.patternId})` : refStyle.fill)
    .attr("stroke", refStyle.stroke)
    .attr("stroke-width", refStyle.strokeWidth);

  g.selectAll(".bar-ac")
    .data(points)
    .enter()
    .append("rect")
    .attr("class", "bar-ac")
    .attr("x", (d) => Math.min(x(0), x(d.actual ?? 0)))
    .attr("y", (d) => (y(d.category) ?? 0) + barH + 2)
    .attr("width", (d) => Math.abs(x(d.actual ?? 0) - x(0)))
    .attr("height", barH)
    .attr("fill", cfg.colors.acFill);

  g.selectAll(".lbl-ac")
    .data(points)
    .enter()
    .append("text")
    .attr("class", "lbl-ac")
    .attr("x", (d) => x(d.actual ?? 0) + 3)
    .attr("y", (d) => (y(d.category) ?? 0) + barH + 2 + barH / 2)
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

  g.append("text")
    .attr("x", 0).attr("y", -4)
    .attr("font-size", HEADER_SIZE).attr("font-weight", "bold").attr("fill", "#333")
    .text(mode === "abs" ? `Δ${cfg.scenario}` : `Δ${cfg.scenario}%`);

  g.append("line")
    .attr("x1", x(0)).attr("x2", x(0))
    .attr("y1", 0).attr("y2", y.range()[1])
    .attr("stroke", "#666").attr("stroke-width", 0.75);

  const barH = y.bandwidth();
  g.selectAll("rect.var")
    .data(variance)
    .enter()
    .append("rect")
    .attr("class", "var")
    .attr("x", (d) => {
      const v = accessor(d);
      if (v == null) return x(0);
      return v >= 0 ? x(0) : x(v);
    })
    .attr("y", (d) => y(d.category) ?? 0)
    .attr("width", (d) => {
      const v = accessor(d);
      if (v == null) return 0;
      return Math.abs(x(v) - x(0));
    })
    .attr("height", barH)
    .attr("fill", (d) => {
      const v = accessor(d);
      if (v == null) return "transparent";
      if (v > 0) return cfg.colors.positive;
      if (v < 0) return cfg.colors.negative;
      return cfg.colors.zero;
    });

  g.selectAll(".lbl")
    .data(variance)
    .enter()
    .append("text")
    .attr("class", "lbl")
    .attr("x", (d) => {
      const v = accessor(d);
      if (v == null) return x(0);
      return v >= 0 ? x(v) + 3 : x(v) - 3;
    })
    .attr("y", (d) => (y(d.category) ?? 0) + barH / 2)
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
      return mode === "abs"
        ? formatNumber(v, { decimals: cfg.decimals })
        : formatPercent(v, 0);
    });
}

export const PALETTE = {
  positive: VARIANCE_COLORS.positive,
  negative: VARIANCE_COLORS.negative,
  zero: VARIANCE_COLORS.zero,
  acFill: "#1A1A1A"
};
