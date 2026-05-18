# SPEC — IBCS Multi-Tier Bar & Column (v0.1 MVP)

Frozen scope for MVP. Anything not listed here is Phase 2 or out of scope (see [PLAN.md](../PLAN.md) §1a and §2).

## 1. Two visuals, one shared core
- `ibcsMultiTierBar` — horizontal orientation (categories on Y, values on X).
- `ibcsMultiTierColumn` — vertical orientation (categories on X, values on Y).
- Both consume `@shared/*` from `../shared/src`. No duplication of variance math or scenario styling.

## 2. Data roles (capabilities.json)
| Role | Kind | Min | Max | Notes |
|---|---|---|---|---|
| `category` | Grouping | 1 | 1 | Single-level only (no hierarchy). |
| `actual` | Measure | 1 | 1 | AC. |
| `reference` | Measure | 1 | 1 | PY / PL / BU per `scenario` setting. |

## 3. Object model (format pane)
- `scenario` enum: `PY` (default) / `PL` / `BU`.
- `invert` boolean (default `false`) — flips variance sign for cost-like measures.
- `showAbsoluteTier` boolean (default `true`).
- `showPercentTier` boolean (default `true`).
- `numberFormat.decimals` int 0..3 (default 0).
- `numberFormat.thousandsSeparator` enum `thinSpace` / `comma` / `period` (default `thinSpace`).
- `colors.positive` color (default `#7AB317`).
- `colors.negative` color (default `#DC2D2D`).
- `colors.zero` color (default `#8C8C8C`).

## 4. Layout contract
- Three tiers in fixed order (top → bottom for column, left → right for bar): **Base**, **Δ absolute**, **Δ percent**.
- Tier height ratio (column): 60 / 20 / 20 of available height after title + axis.
- Per-tier padding: 8 px top, 4 px bottom.
- Bar group: 2 bars per category (AC + Reference). Inner padding 0.1, outer padding 0.2 of bandwidth.

## 5. Variance math (defined in `shared/src/variance.ts`)
- `absolute = invert ? -(actual - reference) : actual - reference`
- `percent  = reference === 0 || reference == null ? null : absolute / Math.abs(reference)`
- `sign = absolute > 0 ? 1 : absolute < 0 ? -1 : 0`
- Null `actual` or null `reference` ⇒ all three null.

## 6. Rendering rules
- AC: solid fill `colors.acFill` (default black `#1A1A1A`).
- PY: white fill, dark border.
- PL/BU: white fill, dark border, hatched `<pattern id="hatch">` (45° lines, 4 px stride, 1 px stroke).
- Δ bars colored by sign (positive/negative/zero).
- Labels: always shown on Δ tiers; on Base tier only when bar height ≥ 12 px.

## 7. Out of MVP — see PLAN.md §2
FC notation, axis break, small multiples, drill-down, Top N + Others, highlight columns, JSON themes, chevron arrows, waterfall/stacked/combo/line, dynamic comments, enhanced tooltip page.
