# PBI IBCS Visuals

Two IBCS-compliant Power BI custom visuals plus a shared core module.

- [`ibcsMultiTierBar/`](ibcsMultiTierBar/) — horizontal integrated variance chart.
- [`ibcsMultiTierColumn/`](ibcsMultiTierColumn/) — vertical integrated variance chart.
- [`shared/`](shared/) — pure-TS variance math, scenario styling, types (consumed via tsconfig `@shared/*` path alias).
- [`docs/`](docs/) — spec, IBCS checklist, self-test strategy.
- [`PLAN.md`](PLAN.md) — build plan, scope, phases, commercial IBCS visual capability map.

## Status

Core IBCS integrated variance chart is implemented in both orientations: AC + PY/PL/BU/FC reference scenarios, Δ + Δ% tiers, semantic green/red, IBCS number formatting, selection/cross-filter, tooltips, sorting, scrollbar, outlier cutoffs and configurable fonts.

Recently added:

- **IBCS scenario notation** for the reference bar: AC solid, PY light fill, PL/BU outlined, and **FC dotted outline** (distinct dotted fill + dashed border).
- **Reference marker** (`►` / `▼` glyph) on the base tier pointing from the reference value at the AC bar, toggleable via the *Show reference marker* setting.
- **Accessibility**: per-category focusable cells with descriptive `aria-label`s (AC / reference / Δ / Δ%), full keyboard navigation (Arrow keys, Home/End), Enter/Space to cross-filter and Escape to clear.
- **Top N + Others**: keep the leading *N* categories (after sorting) and optionally fold the remainder into a single aggregated **Others** bucket. An in-visual `− Top N +` stepper increases/decreases *N* directly on the canvas (persisted to the format pane), in addition to the *Enable Top N* / *Top N categories* / *Show "Others"* settings.
- **Adaptive variance layout** (*Variance layout* setting): `Auto` switches between **inline variance** (compact — Δ / Δ% shown as text beside the base tier), a **single variance tier**, and the full **multi-tier** layout (Δ + Δ%) based on the available canvas size; the layout can also be pinned to any of those modes manually.
- **Bottom N**: the *Top N keeps* setting switches the Top N / Others grouping between the leading (Top N) and trailing (Bottom N) categories after sorting.
- **Missing-value handling** (*Missing values* setting): `Gap` (default IBCS behaviour), `Treat as zero`, or `Interpolate` interior gaps linearly from their neighbours.
- **CAGR option** (*First→last as CAGR*): renders the column-orientation first→last overlay as a compound per-period growth rate instead of the simple total-change percent.

Still on the roadmap (Phase 2+): axis break, small multiples, drill-down, JSON theme import, FC-vs-AC overlay. See [`PLAN.md`](PLAN.md) for the full capability map.


## Quick start

```powershell
# 1. Install dev cert once (admin / accept dialog)
pbiviz install-cert

# 2. Shared core tests
cd shared
npm install
npm test

# 3. Run a visual in dev mode
cd ..\ibcsMultiTierBar
npm install
npm start  # = pbiviz start
```

See [`docs/SELF-TEST.md`](docs/SELF-TEST.md) for the three-layer test strategy.
