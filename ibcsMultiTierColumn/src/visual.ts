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

import ISelectionId = powerbi.visuals.ISelectionId;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ITooltipService = powerbi.extensibility.ITooltipService;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

const ORIENTATION: Orientation = "column";

interface PointWithId extends CategoryPoint {
    selectionId: ISelectionId;
}

export class Visual implements IVisual {
    private host: powerbi.extensibility.visual.IVisualHost;
    private target: HTMLElement;
    private svg: SVGSVGElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    private scrollWrap: HTMLDivElement;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;
    private selectionIdByCategory: Map<string, ISelectionId> = new Map();
    private pointsByCategory: Map<string, CategoryPoint> = new Map();
    private lastOptions?: VisualUpdateOptions;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.target = options.element;
        this.target.style.overflow = "hidden";
        this.formattingSettingsService = new FormattingSettingsService();
        this.selectionManager = options.host.createSelectionManager();
        this.tooltipService = options.host.tooltipService;
        this.selectionManager.registerOnSelectCallback(() => this.rerender());

        const wrap = document.createElement("div");
        wrap.style.cssText = "width:100%;height:100%;overflow-x:auto;overflow-y:hidden;";
        this.target.appendChild(wrap);
        this.scrollWrap = wrap;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        wrap.appendChild(svg);
        this.svg = svg;
    }

    public update(options: VisualUpdateOptions): void {
        this.lastOptions = options;
        const dv = options.dataViews && options.dataViews[0];
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, dv);

        const points = this.extractPointsWithIds(dv);
        this.pointsByCategory.clear();
        this.selectionIdByCategory.clear();
        for (const p of points) {
            this.pointsByCategory.set(p.category, { category: p.category, actual: p.actual, reference: p.reference });
            this.selectionIdByCategory.set(p.category, p.selectionId);
        }

        this.render();
    }

    private render(): void {
        if (!this.lastOptions) return;
        const options = this.lastOptions;
        const selectedIds = this.selectionManager.getSelectionIds() as ISelectionId[];
        const selectedCategories = new Set<string>();
        for (const [cat, id] of this.selectionIdByCategory) {
            if (selectedIds.some((s) => (s as { equals: (o: ISelectionId) => boolean }).equals(id))) {
                selectedCategories.add(cat);
            }
        }

        const cfg: ChartConfig = {
            orientation: ORIENTATION,
            scenario: (this.formattingSettings.general.scenario.value.value as Exclude<Scenario, "AC">) ?? "PY",
            invert: this.formattingSettings.general.invert.value,
            showAbsoluteTier: this.formattingSettings.general.showAbsoluteTier.value,
            showPercentTier: this.formattingSettings.general.showPercentTier.value,
            decimals: Math.max(0, Math.min(3, Math.round(this.formattingSettings.general.decimals.value ?? 0))),
            decimalsAbs: Math.max(0, Math.min(3, Math.round(this.formattingSettings.general.decimalsAbs.value ?? 0))),
            decimalsPct: Math.max(0, Math.min(3, Math.round(this.formattingSettings.general.decimalsPct.value ?? 0))),
            colors: {
                positive: this.formattingSettings.colors.positive.value.value || PALETTE.positive,
                negative: this.formattingSettings.colors.negative.value.value || PALETTE.negative,
                zero: this.formattingSettings.colors.zero.value.value || PALETTE.zero,
                acFill: this.formattingSettings.colors.acFill.value.value || PALETTE.acFill
            },
            axisWidthPercent: clamp(this.formattingSettings.general.axisWidthPercent.value ?? 25, 5, 60),
            maxVisibleCategories: Math.max(1, Math.round(this.formattingSettings.general.maxVisibleCategories.value ?? 10)),
            enableScrollbar: this.formattingSettings.general.enableScrollbar.value,
            minBandPx: Math.max(8, Math.round(this.formattingSettings.general.minBandPx.value ?? 48)),
            sortBy: (this.formattingSettings.general.sortBy.value.value as ChartConfig["sortBy"]) ?? "category",
            sortDir: (this.formattingSettings.general.sortDir.value.value as ChartConfig["sortDir"]) ?? "asc",
            pctOutlierCutoff: Math.max(0, this.formattingSettings.general.pctOutlierCutoff.value ?? 0),
            absOutlierCutoff: Math.max(0, this.formattingSettings.general.absOutlierCutoff.value ?? 0),
            showFirstLastDelta: this.formattingSettings.general.showFirstLastDelta.value,
            font: {
                family: this.formattingSettings.text.font.fontFamily.value || "Segoe UI, sans-serif",
                size: Math.max(6, Math.min(40, Math.round(this.formattingSettings.text.font.fontSize.value ?? 9))),
                bold: this.formattingSettings.text.font.bold.value,
                italic: this.formattingSettings.text.font.italic.value,
                underline: this.formattingSettings.text.font.underline.value,
                color: this.formattingSettings.text.color.value.value || "#333333"
            },
            width: Math.max(80, options.viewport.width),
            height: Math.max(80, options.viewport.height),
            callbacks: {
                onPointClick: (cat, ev) => this.onPointClick(cat, ev),
                onPointHover: (cat, ev) => this.onPointHover(cat, ev),
                onPointLeave: () => this.tooltipService.hide({ immediately: false, isTouchEvent: false }),
                onBackgroundClick: () => { this.selectionManager.clear(); this.render(); },
                selectedCategories
            }
        };

        const data: ChartData = { points: Array.from(this.pointsByCategory.values()) };
        this.target.style.width = cfg.width + "px";
        this.target.style.height = cfg.height + "px";
        this.scrollWrap.style.width = cfg.width + "px";
        this.scrollWrap.style.height = cfg.height + "px";
        this.scrollWrap.style.overflowX = cfg.enableScrollbar ? "auto" : "hidden";
        this.scrollWrap.style.overflowY = "hidden";
        renderChart(this.svg, data, cfg);
    }

    private rerender(): void { this.render(); }

    private onPointClick(category: string, ev: MouseEvent): void {
        const id = this.selectionIdByCategory.get(category);
        if (!id) return;
        this.selectionManager.select(id, ev.ctrlKey || ev.metaKey || ev.shiftKey).then(() => this.render());
    }

    private onPointHover(category: string, ev: MouseEvent): void {
        const p = this.pointsByCategory.get(category);
        if (!p) return;
        const scenario = this.formattingSettings.general.scenario.value.value as string;
        const items: VisualTooltipDataItem[] = [
            { displayName: "Category", value: String(category) },
            { displayName: "AC", value: p.actual == null ? "—" : String(p.actual) },
            { displayName: scenario, value: p.reference == null ? "—" : String(p.reference) }
        ];
        if (p.actual != null && p.reference != null) {
            const diff = p.actual - p.reference;
            const pct = p.reference !== 0 ? (diff / Math.abs(p.reference)) * 100 : 0;
            items.push({ displayName: `Δ${scenario}`, value: (diff >= 0 ? "+" : "") + String(diff) });
            items.push({ displayName: `Δ${scenario}%`, value: (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%" });
        }
        const id = this.selectionIdByCategory.get(category);
        this.tooltipService.show({
            coordinates: [ev.clientX, ev.clientY],
            dataItems: items,
            identities: id ? [id] : [],
            isTouchEvent: false
        });
    }

    private extractPointsWithIds(dv: DataView | undefined): PointWithId[] {
        if (!dv || !dv.categorical) return [];
        const cat = dv.categorical.categories && dv.categorical.categories[0];
        const vals = dv.categorical.values;
        if (!cat || !vals || vals.length === 0) return [];

        const actualSeries = vals.find((v) => v.source.roles && v.source.roles["actual"]);
        const refSeries = vals.find((v) => v.source.roles && v.source.roles["reference"]);

        return cat.values.map((c, i) => ({
            category: c == null ? "" : String(c),
            actual: actualSeries ? toNum(actualSeries.values[i]) : null,
            reference: refSeries ? toNum(refSeries.values[i]) : null,
            selectionId: this.host.createSelectionIdBuilder().withCategory(cat, i).createSelectionId()
        }));
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
