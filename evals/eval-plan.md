# Evaluation Plan: Year-over-Year Period Comparison

## Scope
This plan evaluates the approved specification in [specs/dashboard-evolution.md](../specs/dashboard-evolution.md) against the current static dashboard in [web.html](../web.html).

The simplest reproducible mechanism for this repository is:
1. Inspect the source of [web.html](../web.html) for deterministic behaviors.
2. Open [web.html](../web.html) locally and confirm the rendered DOM snapshot matches the expected states.
3. Treat any user judgment about readability or interpretation as MANUAL.

No CSV, runtime database connection, or invented data is used in the evaluation.

## Coverage
- Automated acceptance criteria: 10/11
- MANUAL acceptance criteria: 1/11
- Deterministic coverage: 90.9%

## Result
- PASS: AC-001, AC-002, AC-004, AC-006, AC-007, AC-010, AC-011
- FAIL: AC-003, AC-008, AC-009
- MANUAL: AC-005

## Acceptance Criteria Matrix
| AC | Check | Mode | Status | Evidence |
| --- | --- | --- | --- | --- |
| AC-001 | Default view selects a base calendar period and a prior-year comparison block. | Automated | PASS | `getDefaults()`, `updateHero()`, and `renderChart()` derive the active period and the previous-year comparison. See [web.html](../web.html#L740). |
| AC-002 | Non-temporal filters apply symmetrically to base and comparison rows. | Automated | PASS | `selectedBaseRows()` and `selectedComparisonRows()` both use the same filter sets. See [web.html](../web.html#L745). |
| AC-003 | KPIs show net sales, orders, average ticket, gross margin, and units for both periods. | Automated | FAIL | `renderKpis()` renders only the current value plus a delta, not explicit values for both periods. See [web.html](../web.html#L884). |
| AC-004 | Absolute and relative variation are visible in the KPI layer. | Automated | PASS | `delta.absolute` and `delta.relative` are rendered together in each KPI badge. See [web.html](../web.html#L884). |
| AC-005 | The main visualization is easy to read as an equivalent-date comparison. | MANUAL | MANUAL | The SVG is aligned by shifted dates and labeled as interannual comparison, but readability still needs a human check. See [web.html](../web.html#L913). |
| AC-006 | Rankings and narratives prioritize contribution to change. | Automated | PASS | `renderDrivers()` sorts by delta magnitude and `renderInsights()` narrates positive/negative impulses. See [web.html](../web.html#L930). |
| AC-007 | Empty or informative states appear when the base or comparison is missing. | Automated | PASS | `renderChart()` emits explicit empty states for missing base or missing comparison. See [web.html](../web.html#L913). |
| AC-008 | A failed table validation blocks reliable presentation. | Automated | FAIL | `renderQuality()` hardcodes PASS badges and has no FAIL branch for table validation. See [web.html](../web.html#L976). |
| AC-009 | A join that duplicates sales or breaks cardinality is detected and blocked. | Automated | FAIL | `renderQuality()` always reports `fact_ventas → dimensions 200 → 200 filas | PASS`; no blocking branch exists. See [web.html](../web.html#L976). |
| AC-010 | No PII is shown or inferred anywhere in the interface. | Automated | PASS | The source map and narrative only expose anonymous commercial fields; the privacy text explicitly excludes names, email, birth date, and postal code. See [web.html](../web.html#L976) and [web.html](../web.html#L1044). |
| AC-011 | The final source is a validated Supabase snapshot with no CSV or runtime DB dependency. | Automated | PASS | `QUALITY` is embedded in the HTML and the page initializes from the embedded snapshot; there is no runtime fetch path. See [web.html](../web.html#L671) and [web.html](../web.html#L1044). |

## Evidence Summary
- The dashboard boots from a static embedded snapshot and sets `qualityState` to PASS on load.
- The current period and the prior-year comparison are rendered in the hero and chart labels.
- KPIs display current values and deltas, but not explicit side-by-side period values.
- Quality reporting is PASS-only in the current implementation, so failure gating is not yet testable in the shipped HTML.

## Remaining MANUAL Checks
- AC-005: confirm the main comparison chart is interpretable by a business user without manual calculations.

## Notes
- This plan intentionally keeps the evaluation mechanism minimal: source inspection plus a local browser smoke test.
- If AC-003, AC-008, or AC-009 are required to pass in the delivered dashboard, the HTML must be extended to render explicit prior-period KPI values and real FAIL/blocking logic for validation and cardinality errors.