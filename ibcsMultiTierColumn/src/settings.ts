"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

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
        displayName: "Decimal places (base & Δ)",
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

    minBandPx = new formattingSettings.NumUpDown({
        name: "minBandPx",
        displayName: "Min column width (px)",
        value: 48
    });

    name: string = "general";
    displayName: string = "General";
    slices: Array<FormattingSettingsSlice> = [
        this.scenario, this.invert, this.showAbsoluteTier, this.showPercentTier,
        this.decimals, this.axisWidthPercent, this.maxVisibleCategories, this.minBandPx
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

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    general = new GeneralCard();
    colors = new ColorsCard();
    cards = [this.general, this.colors];
}
