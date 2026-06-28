"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { VISUAL_VERSION } from "./version";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

class GeneralCard extends FormattingSettingsCard {
    scenario = new formattingSettings.ItemDropdown({
        name: "scenario",
        displayName: "Reference scenario",
        items: [
            { value: "PY", displayName: "Previous Year (PY)" },
            { value: "PL", displayName: "Plan (PL)" },
            { value: "BU", displayName: "Budget (BU)" },
            { value: "FC", displayName: "Forecast (FC)" }
        ],
        value: { value: "PY", displayName: "Previous Year (PY)" }
    });

    invert = new formattingSettings.ToggleSwitch({
        name: "invert",
        displayName: "Invert variance (lower is better)",
        value: false
    });

    showAbsoluteTier = new formattingSettings.ToggleSwitch({
        name: "showAbsoluteTier",
        displayName: "Show Δ absolute tier",
        value: true
    });

    showPercentTier = new formattingSettings.ToggleSwitch({
        name: "showPercentTier",
        displayName: "Show Δ% tier",
        value: true
    });

    decimals = new formattingSettings.NumUpDown({
        name: "decimals",
        displayName: "Decimal places — AC",
        value: 0
    });

    decimalsAbs = new formattingSettings.NumUpDown({
        name: "decimalsAbs",
        displayName: "Decimal places — Δ absolute",
        value: 0
    });

    decimalsPct = new formattingSettings.NumUpDown({
        name: "decimalsPct",
        displayName: "Decimal places — Δ%",
        value: 0
    });

    axisWidthPercent = new formattingSettings.NumUpDown({
        name: "axisWidthPercent",
        displayName: "Category axis width (%)",
        value: 25
    });

    maxVisibleCategories = new formattingSettings.NumUpDown({
        name: "maxVisibleCategories",
        displayName: "Max visible categories (scroll above)",
        value: 10
    });

    enableScrollbar = new formattingSettings.ToggleSwitch({
        name: "enableScrollbar",
        displayName: "Enable scrollbar",
        value: true
    });

    sortBy = new formattingSettings.ItemDropdown({
        name: "sortBy",
        displayName: "Sort by",
        items: [
            { value: "category", displayName: "Category" },
            { value: "actual", displayName: "Actual" },
            { value: "reference", displayName: "Reference" },
            { value: "variance", displayName: "Δ Absolute" },
            { value: "variancePct", displayName: "Δ Percent" }
        ],
        value: { value: "actual", displayName: "Actual" }
    });

    pctOutlierCutoff = new formattingSettings.NumUpDown({
        name: "pctOutlierCutoff",
        displayName: "Δ% outlier cutoff (%)",
        value: 0
    });

    absOutlierCutoff = new formattingSettings.NumUpDown({
        name: "absOutlierCutoff",
        displayName: "Δ absolute outlier cutoff",
        value: 0
    });

    sortDir = new formattingSettings.ItemDropdown({
        name: "sortDir",
        displayName: "Sort direction",
        items: [
            { value: "asc", displayName: "Ascending" },
            { value: "desc", displayName: "Descending" }
        ],
        value: { value: "desc", displayName: "Descending" }
    });

    showFirstLastDelta = new formattingSettings.ToggleSwitch({
        name: "showFirstLastDelta",
        displayName: "Show first→last delta",
        value: false
    });

    firstLastCagr = new formattingSettings.ToggleSwitch({
        name: "firstLastCagr",
        displayName: "First→last as CAGR (per-period)",
        value: false
    });

    showReferenceMarker = new formattingSettings.ToggleSwitch({
        name: "showReferenceMarker",
        displayName: "Show reference marker",
        value: true
    });

    topNEnabled = new formattingSettings.ToggleSwitch({
        name: "topNEnabled",
        displayName: "Enable Top N",
        value: false
    });

    topN = new formattingSettings.NumUpDown({
        name: "topN",
        displayName: "Top N categories",
        value: 5
    });

    showOthers = new formattingSettings.ToggleSwitch({
        name: "showOthers",
        displayName: "Show \u201cOthers\u201d (group remaining)",
        value: true
    });

    topNFrom = new formattingSettings.ItemDropdown({
        name: "topNFrom",
        displayName: "Top N keeps",
        items: [
            { value: "top", displayName: "Top (leading)" },
            { value: "bottom", displayName: "Bottom (trailing)" }
        ],
        value: { value: "top", displayName: "Top (leading)" }
    });

    emptyValueMode = new formattingSettings.ItemDropdown({
        name: "emptyValueMode",
        displayName: "Missing values",
        items: [
            { value: "gap", displayName: "Gap (leave empty)" },
            { value: "zero", displayName: "Treat as zero" },
            { value: "interpolate", displayName: "Interpolate" }
        ],
        value: { value: "gap", displayName: "Gap (leave empty)" }
    });

    layoutMode = new formattingSettings.ItemDropdown({
        name: "layoutMode",
        displayName: "Variance layout",
        items: [
            { value: "auto", displayName: "Auto (fit to canvas)" },
            { value: "multi", displayName: "Multi-tier (Δ + Δ%)" },
            { value: "single", displayName: "Single variance tier" },
            { value: "inline", displayName: "Inline variance" }
        ],
        value: { value: "auto", displayName: "Auto (fit to canvas)" }
    });

    minBandPx = new formattingSettings.NumUpDown({
        name: "minBandPx",
        displayName: "Min row height (px)",
        value: 28
    });

    name: string = "general";
    displayName: string = "General";
    slices: Array<FormattingSettingsSlice> = [
        this.scenario, this.invert, this.showAbsoluteTier, this.showPercentTier,
        this.decimals, this.decimalsAbs, this.decimalsPct,
        this.axisWidthPercent, this.maxVisibleCategories, this.enableScrollbar,
        this.sortBy, this.sortDir, this.showFirstLastDelta, this.firstLastCagr, this.showReferenceMarker,
        this.topNEnabled, this.topN, this.showOthers, this.topNFrom, this.emptyValueMode, this.layoutMode, this.minBandPx,
        this.pctOutlierCutoff, this.absOutlierCutoff
    ];
}

class ColorsCard extends FormattingSettingsCard {
    positive = new formattingSettings.ColorPicker({
        name: "positive", displayName: "Positive variance", value: { value: "#7AB317" }
    });
    negative = new formattingSettings.ColorPicker({
        name: "negative", displayName: "Negative variance", value: { value: "#FF0000" }
    });
    zero = new formattingSettings.ColorPicker({
        name: "zero", displayName: "Zero variance", value: { value: "#8C8C8C" }
    });
    acFill = new formattingSettings.ColorPicker({
        name: "acFill", displayName: "Actual (AC) fill", value: { value: "#1A1A1A" }
    });

    name: string = "colors";
    displayName: string = "Colors";
    slices: Array<FormattingSettingsSlice> = [this.positive, this.negative, this.zero, this.acFill];
}

class TextCard extends FormattingSettingsCard {
    font = new formattingSettings.FontControl({
        name: "font",
        displayName: "Font",
        fontFamily: new formattingSettings.FontPicker({
            name: "fontFamily",
            displayName: "Font family",
            value: "Segoe UI, sans-serif"
        }),
        fontSize: new formattingSettings.NumUpDown({
            name: "fontSize",
            displayName: "Font size",
            value: 9
        }),
        bold: new formattingSettings.ToggleSwitch({ name: "bold", displayName: "Bold", value: false }),
        italic: new formattingSettings.ToggleSwitch({ name: "italic", displayName: "Italic", value: false }),
        underline: new formattingSettings.ToggleSwitch({ name: "underline", displayName: "Underline", value: false })
    });

    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Color",
        value: { value: "#333333" }
    });

    name: string = "text";
    displayName: string = "Text";
    slices: Array<FormattingSettingsSlice> = [this.font, this.color];
}

class AboutCard extends FormattingSettingsCard {
    version = new formattingSettings.ReadOnlyText({
        name: "version",
        displayName: "Version",
        value: VISUAL_VERSION
    });

    author = new formattingSettings.ReadOnlyText({
        name: "author",
        displayName: "Author",
        value: "Alexander Korn"
    });

    website = new formattingSettings.ReadOnlyText({
        name: "website",
        displayName: "Website",
        value: "actionablereporting.com"
    });

    name: string = "about";
    displayName: string = "About";
    slices: Array<FormattingSettingsSlice> = [this.version, this.author, this.website];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    general = new GeneralCard();
    text = new TextCard();
    colors = new ColorsCard();
    about = new AboutCard();
    cards = [this.general, this.text, this.colors, this.about];
}
