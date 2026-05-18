"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;

import { VisualFormattingSettingsModel } from "./settings";
import { renderChart, PALETTE, ChartConfig, ChartData, Orientation } from "../../shared/src/chart";
import { CategoryPoint, Scenario } from "../../shared/src/types";

const ORIENTATION: Orientation = "column";

export class Visual implements IVisual {
    private host: powerbi.extensibility.visual.IVisualHost;
    private target: HTMLElement;
    private svg: SVGSVGElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    private scrollWrap: HTMLDivElement;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.target = options.element;
        this.target.style.overflow = "hidden";
        this.formattingSettingsService = new FormattingSettingsService();

        const wrap = document.createElement("div");
        wrap.style.cssText = "width:100%;height:100%;overflow:auto;";
        this.target.appendChild(wrap);
        this.scrollWrap = wrap;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        wrap.appendChild(svg);
        this.svg = svg;
    }

    public update(options: VisualUpdateOptions): void {
        const dv = options.dataViews && options.dataViews[0];
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, dv);

        const points = extractPoints(dv);
        const cfg: ChartConfig = {
            orientation: ORIENTATION,
            scenario: (this.formattingSettings.general.scenario.value.value as Exclude<Scenario, "AC">) ?? "PY",
            invert: this.formattingSettings.general.invert.value,
            showAbsoluteTier: this.formattingSettings.general.showAbsoluteTier.value,
            showPercentTier: this.formattingSettings.general.showPercentTier.value,
            decimals: Math.max(0, Math.min(3, Math.round(this.formattingSettings.general.decimals.value ?? 0))),
            colors: {
                positive: this.formattingSettings.colors.positive.value.value || PALETTE.positive,
                negative: this.formattingSettings.colors.negative.value.value || PALETTE.negative,
                zero: this.formattingSettings.colors.zero.value.value || PALETTE.zero,
                acFill: this.formattingSettings.colors.acFill.value.value || PALETTE.acFill
            },
            axisWidthPercent: clamp(this.formattingSettings.general.axisWidthPercent.value ?? 25, 5, 60),
            maxVisibleCategories: Math.max(1, Math.round(this.formattingSettings.general.maxVisibleCategories.value ?? 10)),
            minBandPx: Math.max(8, Math.round(this.formattingSettings.general.minBandPx.value ?? 48)),
            width: Math.max(80, options.viewport.width),
            height: Math.max(80, options.viewport.height)
        };

        const data: ChartData = { points };
        renderChart(this.svg, data, cfg);
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}

function extractPoints(dv: DataView | undefined): CategoryPoint[] {
    if (!dv || !dv.categorical) return [];
    const cat = dv.categorical.categories && dv.categorical.categories[0];
    const vals = dv.categorical.values;
    if (!cat || !vals || vals.length === 0) return [];

    const actualSeries = vals.find((v) => v.source.roles && v.source.roles["actual"]);
    const refSeries = vals.find((v) => v.source.roles && v.source.roles["reference"]);

    return cat.values.map((c, i) => ({
        category: c == null ? "" : String(c),
        actual: actualSeries ? toNum(actualSeries.values[i]) : null,
        reference: refSeries ? toNum(refSeries.values[i]) : null
    }));
}

function toNum(v: powerbi.PrimitiveValue | null | undefined): number | null {
    if (v == null) return null;
    const n = typeof v === "number" ? v : Number(v);
    return isFinite(n) ? n : null;
}

function clamp(v: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, v));
}
