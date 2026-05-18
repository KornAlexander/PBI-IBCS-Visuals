# Self-Test Strategy

Three independent test layers. All three must pass before any release.

## Layer A — Vitest (shared core, headless)
**Where:** `shared/tests/*.test.ts`
**What:** Pure-function unit tests for variance math, scenario styling, formatters. No DOM, no Power BI.
**Run:** `cd shared && npm test`
**Coverage target:** ≥ 90 % on `shared/src/variance.ts` and `shared/src/scenarioStyle.ts`.

## Layer B — pbiviz test / Karma (component, browser)
**Where:** each visual project's own `test/` folder (added later — `pbiviz` v7 generates the harness on demand).
**What:** Render the visual into a real DOM with the official `powerbi-visuals-utils-testutils`, drive update events with synthetic dataviews, assert SVG structure.
**Run:** `cd ibcsMultiTierBar && npm test` (after adding `karma.conf` per pbiviz v7 docs).
**Coverage target:** smoke + per-tier rendering + scenario notation + sign coloring per visual.

## Layer C — Playwright (end-to-end against Fabric Demo workspace)
**Where:** `e2e/` (added in Phase 6).
**What:** Launch Chromium, sign in once into Fabric Demo workspace (`da2e15a8-c06d-4da0-ad10-c68aba63e564`), open the dev test report, enable developer-visual placeholder, run `pbiviz start` in parallel, screenshot, compare to baseline.
**Auth:** persistent `storageState.json` under `temp/` (gitignored). MFA happens once; subsequent runs reuse cookies.
**Baselines:** screenshot snapshots per visual stored in `e2e/baselines/`.
**Run:** `npx playwright test` (full) or `npx playwright test --update-snapshots` (rebaseline).
