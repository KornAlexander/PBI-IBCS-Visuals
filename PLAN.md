# IBCS Multi-Tier Variance Visuals — Build Plan

**Visuals in scope:**
1. `ibcsMultiTierBar` — horizontal multi-tier variance bar chart, IBCS-compliant
2. `ibcsMultiTierColumn` — vertical multi-tier variance column chart, IBCS-compliant

**Source inputs:** prior IBCS custom-visual research, plus the public reference repo [`dax-tips/CustomVisuals`](https://github.com/dax-tips/CustomVisuals) — especially `kpiAchievementCard` and `multiFacetColumnChart`.

**Functional reference point:** the leading commercial IBCS variance charts for Power BI — see §1a below for the capability map and the MVP / Phase-2 / out-of-scope split against it.

**Visual target:** [docs/reference-image.png](docs/reference-image.png) — the attached IBCS integrated variance example (Oct/Nov/Dec 2017, AC vs PY, with FC for Dec). The FC bar in the picture is for Phase 2; the MVP reproduces the same layout with AC + PY (or AC + PL) only.

---

## 1. What "multi-tier" means here (corrected)

A multi-tier variance chart is the canonical IBCS "integrated variance" layout: **three stacked sub-charts sharing the same category axis**, rendered as a single visual.

| Position (column variant) | Tier | Content | IBCS notation |
|---|---|---|---|
| **Top** | Tier 3 — ΔRef% | Percentage variance vs. reference | Pin/needle bars, semantic color (green = positive, red = negative), value label with `+`/`−` and `%` |
| **Middle** | Tier 2 — ΔRef | Absolute variance vs. reference | Solid colored bars, semantic color, value label with `+`/`−` |
| **Bottom** | Tier 1 — Base | Actual (AC, solid black) overlaid with reference (PY outlined / PL hatched / FC dotted) | IBCS scenario notation; value label above the AC bar; optional `►` marker pointing at the reference value |

For the **horizontal bar variant**: the three tiers stack **side-by-side** (Tier 1 leftmost = base; Tier 2 middle = ΔRef; Tier 3 rightmost = ΔRef%). Categories run vertically. Same shared category axis (rows).

This matches the attached reference image: Oct / Nov / Dec 2017 along the bottom; Tier 1 shows AC (solid black) + PY (outlined, marked with `►`) + FC (hatched) for Dec; Tier 2 shows ΔPL absolute (+101, −73, +79); Tier 3 shows ΔPL% (+18 %, −12 %, +19 %); negative bars red, positive IBCS-green, hatched fill for FC-related bars. **FC notation is implemented in Phase 2** (see §2); the MVP renders the same layout for Oct / Nov / Dec but with the Dec column treated as AC vs PY like the others.

---

## 1a. Reference: commercial IBCS visual capability map

The established commercial IBCS-certified visuals are the de-facto reference. We researched their public feature sets and use them as the long-term north star, picking a strict subset for v0.1.

**Capabilities researched across the leading commercial IBCS visual providers:**

| # | Capability | MVP (v0.1) | Phase 2 | Out of scope (v1+) |
|---|---|:---:|:---:|:---:|
| 1 | IBCS scenario notation: AC solid, PY outlined, PL/BU hatched, FC dotted | AC + PY + PL/BU | + FC dotted | — |
| 2 | Auto-calculated absolute variance (ΔRef) | ✓ | | |
| 3 | Auto-calculated relative variance (ΔRef%) | ✓ | | |
| 4 | Semantic green/positive, red/negative variance color | ✓ | | |
| 5 | "Invert" variance (for cost-like measures where lower = better) | ✓ | | |
| 6 | Multiple chart types in one visual (column, bar, waterfall, area, line, dot, lollipop, hills&valleys) | column + bar (the two we ship) | | other types |
| 7 | Integrated variance layout (Base + ΔRef + ΔRef% tiers) | ✓ — our headline feature | | |
| 8 | Vertical ↔ horizontal orientation switch | ✓ — shipped as two pbiviz files | | single-visual switch |
| 9 | Waterfall / waterfall with subtotals | | | ✓ |
| 10 | Single-measure waterfall (bridge) | | | ✓ |
| 11 | Segmented / stacked / combo charts | | | ✓ |
| 12 | Small multiples (Group bucket, auto-scaled) | | ✓ (one extra category level → grid) | richer auto-layout |
| 13 | Drill-down via category hierarchy | | ✓ | |
| 14 | Top N + Others | | ✓ | |
| 15 | 1-click axis break | | ✓ | |
| 16 | CAGR arrows | | | ✓ |
| 17 | Forecast (FC) display + comparison | | ✓ (notation + label) | full FC-vs-AC overlay |
| 18 | Difference highlight (e.g. min↔max bracket) | | | ✓ |
| 19 | Chevron arrows for variances (color-blind aid) | | | ✓ |
| 20 | Dynamic comments / comment markers / comment box | | | ✓ |
| 21 | Enhanced report-page tooltips (extra dimensions) | native PBI tooltip only | | enhanced tooltip page |
| 22 | Custom themes via JSON | format-pane only | JSON theme import | |
| 23 | Number formats (parentheses for negatives, units in title, decimal control, thin-space thousands) | ✓ | | |
| 24 | Highlight specific columns (right-click on axis label) | | ✓ | |
| 25 | Responsive layout (auto-adapt info density to viewport) | basic — hide pct tier / labels below threshold | progressive (collapse Δ tier, abbreviate labels, hide markers) | full commercial-grade responsiveness |
| 26 | Dynamic legend names | inline scenario codes (`PY`, `PL`) | configurable | |
| 27 | Empty-value handling (gap / zero / interpolate) | gap only | configurable | |
| 28 | Color-blind friendly defaults | green/red defaults only | CVD palette + chevron arrows | |

**Reading guide:** the MVP delivers rows 1–8 (subset), 23, plus the basic version of 25–27 — i.e. one *integrated variance chart* in two orientations, with AC vs PY/PL, semantic variance colors, IBCS number formats, and minimal responsiveness. That is roughly the equivalent of an "Integrated Variance" chart type in a commercial IBCS visual with no additional features turned on. Phase 2 covers the most-requested follow-ons (FC, axis break, small multiples, drill, highlight, theme JSON). Anything in the rightmost column stays out of scope until a v1.0 decision.

IBCS conventions we respect:

- **SAY (notation):** AC = solid fill (black/dark); PY = outlined (white fill, dark border); PL/BU = hatched diagonal; FC = dotted outline.
- **SIMPLIFY:** no gradients, no 3D, no chart junk.
- **UNIFY:** all three tiers share the same category axis order and per-category width allocation.
- **STRUCTURE / CONDENSE:** thin zero baseline per tier; tier label on the left (`ΔPL%`, `ΔPL`); base tier annotates scenario codes inline near the reference bar (`PY`, `PL`, `FC`).
- **COMPARE (in MVP):** Δ and Δ% per category with semantic positive/negative color.
- **SCALE:** each tier has its own independent value scale (the magnitude of Δ% is unrelated to AC); tiers 2 and 3 are zero-anchored; tier 1 optionally supports an axis break.

The two visuals share ~90 % of the codebase. They differ only in axis orientation. One **shared core module**, two thin orientation wrappers.

---

## 2. MVP scope (v0.1) — hard cap

In:

- **2 measures:** `actual` (AC) and `reference` (one of PY / PL / BU, user-declared via a `scenario` setting).
- **1 category axis** (single-level categories, e.g. months). Multi-level hierarchies deferred.
- **Three rendered tiers** as described in §1: Base / ΔRef / ΔRef%.
- **IBCS scenario notation** for the reference bar: solid (AC), outlined (PY), hatched (PL/BU). FC dotted notation is Phase 2.
- **Variance computation:** Δ = AC − Ref; Δ% = (AC − Ref) / |Ref| × 100. Null-safe; `|Ref| < ε` → Δ% null.
- **Semantic color** for Δ and Δ% bars: configurable positive color (default IBCS green), negative color (default IBCS red), zero color (default gray). Optional invert-sign toggle for "lower is better" measures.
- **Value labels** per bar in every tier; IBCS number formatting (k / M / Bn auto-suffix, thin space thousands separator, configurable decimals, sign prefix `+` / `−`).
- **Tier headers** on the left (column variant) / on top (bar variant): `AC`, `ΔRef`, `ΔRef%` with the configured scenario interpolated (`ΔPY`, `ΔPL`, `ΔPL%`, etc.).
- **Tier size allocation** configurable as percentages summing to 100 (default 50 / 25 / 25 for base / abs / pct in column variant).
- **Reference markers** on the base tier: `►` glyph at the reference value pointing at the AC bar (as in the picture).
- **Tooltip per data point:** Category + AC + Ref + Δ + Δ%.
- **Cross-filter:** clicking any bar in any tier selects the **category** (highlights all three tiers + filters the page).
- **Highlight handling** (other visuals filter us): dim non-highlighted to ~30 % opacity across all tiers.
- **Light + dark theme** support.
- **Keyboard navigation + ARIA labels.**
- **Both orientations** shipped as two `.pbiviz` files from a single source tree.

**Phase 2** (planned next release, v0.2):

- **Forecast (FC) scenario:** dotted-outline notation + optional FC-vs-AC overlay on the base tier (the Dec column in `reference-image.png`).
- 1-click axis break on the base tier with explicit break marker.
- Small multiples wrapper (one extra category level → grid of integrated-variance charts, all scaled together).
- Drill-down via category hierarchy.
- Top N + Others.
- Highlight specific columns (right-click on axis label).
- JSON theme import.
- Chevron arrows (color-blind aid) on variance tiers.

**Out of scope (v1+):**

- More than one reference simultaneously (AC vs PY *and* vs PL).
- Waterfall / bridge / segmented / stacked / combo chart types.
- CAGR arrows, difference highlight bracket.
- Dynamic comments / comment markers / comment box.
- Enhanced report-page tooltip (extra dimensions).
- AppSource certification.

---

## 3. Repository structure

```
PBI-IBCS-Visuals/
├── PLAN.md                     ← this file
├── README.md                   ← created in Phase 7
├── .gitignore
├── shared/                     ← shared TypeScript core
│   ├── src/
│   │   ├── core/
│   │   │   ├── dataTransform.ts          (per-category {ac, ref, delta, deltaPct})
│   │   │   ├── ibcsFormat.ts             (number formatting, sign prefix, % suffix)
│   │   │   ├── tierLayout.ts             (allocate viewport into 3 tier bands)
│   │   │   ├── scenarioStyle.ts          (AC solid / PY outlined / PL hatched / FC dotted)
│   │   │   ├── render.ts                 (orchestrates 3 tiers, orientation-aware)
│   │   │   ├── renderBaseTier.ts         (AC+Ref overlay + ► marker)
│   │   │   ├── renderVarianceTier.ts     (absolute Δ, semantic color)
│   │   │   ├── renderVariancePctTier.ts  (Δ% pin bars, semantic color)
│   │   │   ├── selection.ts              (selectionManager wiring)
│   │   │   ├── tooltip.ts                (tooltipService wiring)
│   │   │   └── theme.ts                  (light/dark + custom theme adapter)
│   │   └── types.ts
│   ├── tests/                            (Vitest)
│   └── package.json
├── ibcsMultiTierBar/           ← pbiviz project A (horizontal)
│   ├── pbiviz.json
│   ├── capabilities.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── visual.ts           (orientation='horizontal')
│   │   └── settings.ts         (formatting model)
│   ├── style/visual.less
│   ├── assets/icon.png
│   └── dist/
├── ibcsMultiTierColumn/        ← pbiviz project B (vertical)
│   └── … same structure …
└── docs/
    ├── IBCS-CHECKLIST.md
    ├── SPEC.md
    ├── SELF-TEST.md
    ├── reference-image.png
    └── screenshots/
```

Shared-code consumption: `tsconfig` `paths` alias `@shared/*` → `../shared/src/*`. No build step for the shared module; it compiles inside each pbiviz project's bundle.

---

## 4. Phased build plan

Each phase ends with a git commit; push after each phase.

### Phase 0 — Spec freeze (½ day)

- 0.1 Save the attached reference image to `docs/reference-image.png` as the canonical visual target.
- 0.2 Write [docs/IBCS-CHECKLIST.md](docs/IBCS-CHECKLIST.md) — rules the MVP must pass (notation table, semantic colors, label conventions, tier ordering).
- 0.3 Write [docs/SPEC.md](docs/SPEC.md) — frozen scope (copy §1–§2) + acceptance criteria: "the visual matches `reference-image.png` for the documented sample dataset".
- 0.4 Survey: open the leading commercial IBCS variance visuals side-by-side with the reference; save into `docs/screenshots/reference/`.
- 0.5 Read `dax-tips/CustomVisuals/kpiAchievementCard/src/visual.ts` (variance label + marker patterns) and `multiFacetColumnChart` (multi-band layout).
- 0.6 Read Microsoft `sampleBarChart` — canonical `capabilities.json` + `IVisual` lifecycle.

### Phase 1 — Environment & scaffold (½ day)

- 1.1 `npm i -g powerbi-visuals-tools@latest`; verify `pbiviz --version`.
- 1.2 `pbiviz --install-cert` and trust the cert.
- 1.3 Enable developer-visual mode in Power BI Desktop + Service.
- 1.4 `git init` in `PBI-IBCS-Visuals`; create `.gitignore` (node_modules, dist, .tmp, *.pbiviz logs).
- 1.5 Scaffold both visuals via `pbiviz new …`.
- 1.6 Add `tsconfig` paths alias `@shared/*`.
- 1.7 Pin `apiVersion` in both `pbiviz.json` (confirm latest stable at scaffold time, e.g. 5.11.0).
- 1.8 `pbiviz start` in each, verify dev visual loads in Power BI Service.
- 1.9 Commit `feat: scaffold both visuals + shared module`; push to private GitHub `PBI-IBCS-Visuals`.

### Phase 2 — Data binding & capabilities (½ day)

- 2.1 `capabilities.json` data roles:
  - `category` (grouping, required) — shared axis.
  - `actual` (measure, required, exactly one).
  - `reference` (measure, required, exactly one).
- 2.2 `dataViewMappings`: categorical with one category + two value buckets.
- 2.3 Formatting model in `settings.ts`:
  - **Reference**: `scenario` enum (PY / PL / BU) — drives notation + tier headers. (FC added in Phase 2.)
  - **IBCS Numbers**: decimals, unit-suffix-mode (auto/k/M/Bn/none), thousands-separator-char.
  - **Tiers**: base-pct, abs-pct, pct-pct (validated sum 100), show-tier-headers, tier-header-font, tier-header-size, show-reference-marker (default true).
  - **Base Tier**: ac-color (default black), ref-stroke-color (default black), bar-width-percent, axis-break (default false).
  - **Variance**: positive-color (default `#7AB317`), negative-color (default `#DC2D2D`), zero-color (default `#8C8C8C`), invert-sign.
  - **Labels**: show-value-labels (default true), label-font, label-size, label-color, label-decimals-base, label-decimals-pct.
- 2.4 Verify Fields + Format pane in Power BI Service.

### Phase 3 — Shared core: transform & layout (1 day)

- 3.1 `dataTransform.ts`: for each category row produce `{ category, ac, ref, delta, deltaPct, selectionId }`. Null-safe; `|ref| < ε` → `deltaPct = null`.
- 3.2 `tierLayout.ts`: viewport + orientation + tier percentages → three tier band rectangles; per-tier independent value scale (auto-domain with 10 % headroom).
- 3.3 `scenarioStyle.ts`: `{ fill, stroke, strokeDasharray, patternId | null }` per scenario; SVG `<pattern>` defs for hatched (PL). Dotted (FC) `<pattern>` def added in Phase 2.
- 3.4 Vitest in `shared/tests/`. Matrix: null AC / null Ref / zero Ref (Δ% null gap), negative / mixed signs, 1 / 5 / 50 / 200 categories, sign-invert, all three MVP scenarios (PY / PL / BU).

### Phase 4 — Shared core: rendering (1½–2 days)

- 4.1 `render.ts` orchestrates: tier separator lines, tier headers, then each tier renderer.
- 4.2 `renderBaseTier.ts`: reference bar first (scenario notation), AC bar in front; `►` glyph at reference value if enabled; value label above AC bar.
- 4.3 `renderVarianceTier.ts`: Δ bars from tier zero baseline; semantic color from sign; signed value label.
- 4.4 `renderVariancePctTier.ts`: Δ% pin bars (narrower than abs bars — IBCS convention) from tier zero baseline; signed value label + `%`.
- 4.5 Value-axis ticks suppressed (IBCS labels-on-bars); thin zero baselines visible.
- 4.6 Wire `selectionManager` and `tooltipService` placeholders (full impl in Phase 5).

### Phase 5 — Interactivity (½ day)

- 5.1 Click any bar / category label → `selectionManager.select(categorySelectionId)` → cross-filters all three tiers + page.
- 5.2 Handle `highlights` → dim non-highlighted to ~30 % across all tiers.
- 5.3 Tooltip on hover/focus: Category / AC / Ref (with scenario code) / Δ / Δ%.
- 5.4 Keyboard nav: Tab into visual; Arrow keys move category focus; focused category highlights in all three tiers simultaneously; Enter selects, Esc clears. Per-bar `aria-label="Category — AC value, scenario reference value, delta absolute, delta percent"`.

### Phase 6 — Theme + polish (½ day)

- 6.1 Read host theme via `host.colorPalette`; apply where user hasn't overridden. Semantic green/red stays IBCS-standard in dark theme unless overridden.
- 6.2 Dark-theme sanity pass.
- 6.3 Small-viewport: below threshold A collapse Δ% tier first, then ΔRef tier; below threshold B hide tier headers and inline labels.
- 6.4 Performance: D3 general-update (enter/update/exit); throttle `update()` via animation frame.

### Phase 7 — Packaging (½ day)

- 7.1 `pbiviz package` → `dist/ibcsMultiTierBar.pbiviz` + `dist/ibcsMultiTierColumn.pbiviz`.
- 7.2 Smoke test in a clean PBIX without dev server.
- 7.3 Write [README.md](README.md) with side-by-side screenshots vs. `reference-image.png`, install instructions, IBCS rules covered, limitations, MIT license.
- 7.4 Tag `v0.1.0`; attach both `.pbiviz` files to a GitHub release.

### Phase 8 — Integration & distribution (deferred)

- 8.1 Bundle into pbi_fixer as organizational visuals (mirrors PieChart_Fixer pattern).
- 8.2 Blog post on ActionableReporting.com.

---

## 5. Self-test strategy

Three layers, fastest → most realistic.

### Layer A — Unit tests (Vitest, no Power BI)

`shared/tests/` covering `dataTransform.ts`, `tierLayout.ts`, `ibcsFormat.ts`, `scenarioStyle.ts`.

Matrix:

- Null AC, null Ref, zero Ref (Δ% null gap, not Infinity).
- Negative / mixed-sign Δ; sign-invert toggle swaps colors.
- 1 / 5 / 50 / 200 categories.
- Tiny vs huge viewport — per-tier scales independent.
- All three MVP scenarios (PY / PL / BU) produce documented `scenarioStyle` output.

Run: `npm test` in `shared/`. Re-runs on save.

### Layer B — Visual unit tests (`pbiviz test` / Karma)

Per project, mount the visual against a mocked host with fixture `dataView`; assert:

- SVG contains exactly 3 tier `<g>` groups.
- Bar counts per tier match category count.
- Base-tier groups contain AC `<rect>` + Ref `<rect>` (or `<rect>` + pattern fill).
- Δ-bar fill color matches positive/negative/zero per row's sign.
- `aria-label` content on a known bar contains expected `Category — AC … Ref … Δ … Δ%` text.

Run: `pbiviz test`. CI runs on every push.

### Layer C — End-to-end in Power BI Service (Playwright)

`e2e/` at the repo root.

Script flow:

1. Launch Chromium with persistent `storageState.json` under `temp/` (MFA done once, reused thereafter).
2. Open a pre-prepared test report in the Fabric **Demo** workspace (`da2e15a8-c06d-4da0-ad10-c68aba63e564`) with a dev-visual placeholder and a sample dataset matching the AC + PY portion of `reference-image.png` (Oct / Nov / Dec 2017). The Dec-as-FC variant becomes a Phase-2 baseline.
3. `pbiviz start` in a background terminal loads the dev visual.
4. Per scenario:
   - Screenshot the visual into `e2e/screenshots/`.
   - Assert SVG `<rect>` count per tier.
   - Assert specific bar's `aria-label` matches expected text.
   - Hover a bar → assert `[role="tooltip"]` content.
   - Click a bar → assert a sibling card visual updates (cross-filter proof).
5. Pixel-diff each screenshot vs. baseline in `e2e/baselines/` via Playwright's `toHaveScreenshot()`.
6. **Pixel-diff** the rendered visual vs. `docs/reference-image.png` with relaxed tolerance — the headline "looks like an IBCS chart" gate.

Why Playwright: Power BI Service is a web app; dev visual loads over WebSocket from `pbiviz start`; only realistic way to validate full "looks right + behaves right" inside Power BI without manual clicking.

Reuses the MFA-persistent session pattern from [pbi_to_excalidraw](memory:/memories/pbi_to_excalidraw.md). MFA blocks CI, so Layer C is local-only; CI runs Layer A + B.

Run: `npx playwright test`.

### Daily loop

```
Edit shared/core/* → save → Vitest re-runs (Layer A, <1 s)
                          ↓ passes
              pbiviz HMR reloads dev visual in browser
                          ↓ looks right
              npx playwright test (Layer C automated)
                          ↓ green
              git commit + push
```

---

## 6. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Δ% with Ref ≈ 0 explodes | `|Ref| < ε` → null Δ%; render as gap with `n/a` in tooltip. |
| Independent tier scales mislead reader | Always render zero baseline + per-tier scale label in tooltip; document in README. |
| Power BI Visuals API breakage between versions | Pin `apiVersion` in `pbiviz.json`; document in README. |
| Shared-code import path fragility across two pbiviz projects | `tsconfig` `paths` alias `@shared/*`; one ground truth. |
| Tier % settings sum ≠ 100 | Validate in `settings.ts`; clamp + re-normalize on render. |
| Cross-filter on a single tier confuses users | Always select the **category** (not the bar); highlight syncs all three tiers. |
| MFA blocking Playwright in CI | Layer C local-only; CI runs Layer A + B. |
| Scope creep into multi-reference / waterfall / drill | Hard cap at §2; rest into backlog. |

---

## 7. Estimated effort

| Phase | Effort |
|---|---|
| 0 — Spec | ½ d |
| 1 — Environment | ½ d |
| 2 — Capabilities | ½ d |
| 3 — Transform + layout + Vitest | 1 d |
| 4 — Rendering (3 tier renderers) | 1½–2 d |
| 5 — Interactivity | ½ d |
| 6 — Theme + polish | ½ d |
| 7 — Packaging + README | ½ d |
| **Total to v0.1.0** | **~5½–6½ focused days** |

---

## 8. First concrete actions (after your approval)

1. Save attached reference image to `docs/reference-image.png`.
2. Create `docs/IBCS-CHECKLIST.md` and `docs/SPEC.md` (Phase 0).
3. `npm i -g powerbi-visuals-tools@latest` and `pbiviz --install-cert` (Phase 1.1–1.2).
4. `git init` + `.gitignore`, scaffold both pbiviz projects (Phase 1.4–1.5).
5. Create `shared/` with `package.json` + Vitest config.
6. Commit + push baseline.

**Awaiting your approval to proceed.**
