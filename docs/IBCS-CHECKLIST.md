# IBCS Compliance Checklist — MVP v0.1

Acceptance gate before any release. Each row must be **PASS** or explicitly waived to Phase 2.

## Notation (scenarios)
- [ ] AC bars are **solid black** (`#1A1A1A`), no border.
- [ ] PY bars are **outlined** (white fill, dark gray 1px border, no hatch).
- [ ] PL / BU bars are **hatched diagonal** (white fill, dark gray border, SVG `<pattern id="hatch">`).
- [ ] FC notation is **not** in MVP (waived to Phase 2).
- [ ] Reference scenario abbreviation (`PY` / `PL` / `BU`) is shown inline once in the chart (legend or tier header).

## Variance (Δ tiers)
- [ ] Δ absolute computed as `actual - reference` (or inverted if `invert=true`).
- [ ] Δ percent computed as `Δ / |reference|`; **null** when reference is 0 or null (rendered as gap, no division by zero).
- [ ] Positive Δ uses IBCS green `#7AB317`.
- [ ] Negative Δ uses IBCS red `#DC2D2D`.
- [ ] Zero Δ uses neutral gray `#8C8C8C`.
- [ ] Δ% labels include a `%` suffix; Δ absolute labels carry the unit of the base measure.

## Number formats
- [ ] Negative numbers shown in **parentheses** `(73)` or with explicit minus, never both.
- [ ] Thousands separator = **thin space** (U+2009), not comma/period.
- [ ] Configurable decimal places (default 0 for base, 0 for Δ abs, 0 for Δ%).
- [ ] Unit shown **once** in the title, not on every label.

## Layout
- [ ] Three tiers (Base / ΔRef / ΔRef%) share the **same category axis**.
- [ ] Tiers are vertically stacked (column visual) or horizontally aligned (bar visual) with consistent category alignment.
- [ ] Base tier scales independently from Δ tiers.
- [ ] No 3D, no gradients, no drop shadows.
- [ ] No gridlines other than a single horizontal zero line on Δ tiers.

## Responsiveness
- [ ] At < 200 px width (column) / height (bar), Δ% tier collapses gracefully (hide rather than overflow).
- [ ] At < 120 px, labels are dropped before bars are clipped.

## Accessibility
- [ ] Default palette has WCAG AA contrast against white background.
- [ ] Variance is communicated by **both** color and a sign in the label (color-blind users see `+101` / `(73)`).
- [ ] All text uses a single font family (Segoe UI fallback chain).

## Out of MVP (do **not** ship)
- FC scenario notation, axis break, small multiples, drill, Top N, highlight columns, JSON theme import, chevrons.
