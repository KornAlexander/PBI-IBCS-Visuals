# PBI IBCS Visuals

Two IBCS-compliant Power BI custom visuals plus a shared core module.

- [`ibcsMultiTierBar/`](ibcsMultiTierBar/) — horizontal integrated variance chart.
- [`ibcsMultiTierColumn/`](ibcsMultiTierColumn/) — vertical integrated variance chart.
- [`shared/`](shared/) — pure-TS variance math, scenario styling, types (consumed via tsconfig `@shared/*` path alias).
- [`docs/`](docs/) — spec, IBCS checklist, self-test strategy.
- [`PLAN.md`](PLAN.md) — build plan, scope, phases, Zebra BI capability map.

## Status

MVP (v0.1) in progress. Scope = IBCS integrated variance chart with AC + PY/PL/BU, Δ + Δ% tiers, semantic green/red, two orientations. Forecast scenario + axis break + small multiples + drill + Top N + theme JSON ship in Phase 2.

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
