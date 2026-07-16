# Eval Plan: Dashboard Evolution - Combo Filters and Year Calendar

Status: Draft for implementation
Scope: `specs/dashboard-evolution.md` v0.1.0
Repository constraints: standalone HTML, embedded validated data, no runtime Supabase, no Confluence publication in this change

## Purpose
Define the simplest reproducible evaluation contract for the approved dashboard evolution before implementation work starts. The harness should be browser-based, zero-dependency, and runnable locally against the standalone dashboard HTML.

## Evaluation Model
- One eval per acceptance criterion: `EVAL-001` through `EVAL-012`.
- Each eval must report one of `PASS`, `FAIL`, `BLOCKED`, or `MANUAL`.
- Deterministic checks are automated in the harness.
- External, subjective, or evidence-based checks remain `MANUAL`.
- If the implementation lacks an observable signal needed to verify a requirement deterministically, the eval is `BLOCKED` until the implementation exposes that signal.

## Result Rules
- `PASS`: the observed behavior satisfies the criterion and evidence is recorded.
- `FAIL`: the observable behavior contradicts the criterion.
- `BLOCKED`: the criterion cannot be evaluated deterministically with the current observable surface.
- `MANUAL`: the criterion depends on Supabase evidence, Confluence evidence, viewport judgment, or other human review.

## Coverage Matrix
| Eval ID | AC | Requirement mapping | Check type | Expected result class | Evidence required |
|---|---|---|---|---|---|
| `EVAL-001` | `AC-001` | `REQ-001` | Automated | `PASS` / `FAIL` / `BLOCKED` | Filter control roles, labels, and multi-select behavior for every non-year filter |
| `EVAL-002` | `AC-002` | `REQ-002`, `REQ-003` | Automated | `PASS` / `FAIL` / `BLOCKED` | Year control type, opened options, and dataset-year membership |
| `EVAL-003` | `AC-003` | `REQ-004` | Automated | `PASS` / `FAIL` / `BLOCKED` | Reset action, pre-reset mutated state, post-reset default state |
| `EVAL-004` | `AC-004` | `REQ-005` | Automated | `PASS` / `FAIL` / `BLOCKED` | KPI, chart, and summary text before and after a filter interaction |
| `EVAL-005` | `AC-005` | `REQ-006` | Automated | `PASS` / `FAIL` / `BLOCKED` | Quality banner text and any derived status fields from embedded data |
| `EVAL-006` | `AC-006` | `REQ-007` | Automated | `PASS` / `FAIL` / `BLOCKED` | Text audit of rendered labels, summaries, and embedded snapshot for obvious PII patterns |
| `EVAL-007` | `AC-007` | `REQ-008` | Automated | `PASS` / `FAIL` / `BLOCKED` | Empty-state message and absence of broken chart output for a no-match filter combination |
| `EVAL-008` | `AC-008` | `REQ-009` | MANUAL | `MANUAL` | Browser screenshot and reviewer notes for narrow viewport readability and operability |
| `EVAL-009` | `AC-009` | `REQ-010` | Automated | `PASS` / `FAIL` / `BLOCKED` | Generated filter option values compared against the embedded validated dataset values |
| `EVAL-010` | `AC-010` | `REQ-011` | MANUAL | `MANUAL` | Reviewer judgment that the KPI and chart set remains recognizable and functionally equivalent |
| `EVAL-011` | `AC-011` | `REQ-012` | Automated | `PASS` / `FAIL` / `BLOCKED` | Local open succeeds without runtime network dependence or external script/style loads |
| `EVAL-012` | `AC-012` | `REQ-013` | Automated | `PASS` / `FAIL` / `BLOCKED` | Single-year selection renders one active year series and no prior-year comparison series |

## Automated Oracle Notes
### `EVAL-001` - non-year combo filters
The harness should confirm that the non-year filters are exposed as multi-select controls rather than single-select inputs or static chips. The observable checks should verify:
- there are distinct controls for month, channel, user type, and promotion;
- each control allows more than one value to remain selected at once;
- selection state is reflected in the DOM, not only in internal variables;
- the control is reachable with keyboard and pointer input.

### `EVAL-002` - calendar-based year picker
The harness should confirm that the year control presents a calendar-like year-picker behavior and only offers years present in the embedded snapshot. The oracle should verify:
- available year options are a subset of the validated dataset years;
- the control presents a year-selection UI rather than another chip list;
- invalid or invented years cannot be selected through the rendered UI.

### `EVAL-003` - reset behavior
The harness should mutate at least one filter, activate reset, and confirm all filter groups return to the full-selection default. The oracle should also confirm the dashboard refreshes after reset.

### `EVAL-004` - synchronized updates
The harness should record KPI values, summary text, and at least one chart container before and after a filter change. A pass requires observable updates in the visible state after the change.

### `EVAL-005` - truthful quality banner
The harness should compare the quality banner against embedded data facts that can be computed locally from the snapshot. It should fail if the banner contains invented totals or status claims that do not match the embedded data.

### `EVAL-006` - privacy exclusion
The harness should scan rendered text and embedded snapshot content for prohibited personal-data patterns, especially names, emails, dates of birth, and postal codes. Any obvious PII exposure is a failure.

### `EVAL-007` - empty state handling
The harness should drive the dashboard into a no-match state using only valid filters and confirm the affected chart regions render an explicit empty state instead of broken or fabricated visuals.

### `EVAL-009` - authoritative options
The harness should extract generated filter option labels and values and compare them with the set of validated embedded dataset values. This eval fails if the UI exposes values not present in the snapshot.

### `EVAL-011` - self-contained delivery
The harness should open the dashboard locally and inspect the page for prohibited external script or stylesheet loads. It should also confirm the dashboard does not require runtime database connectivity.

### `EVAL-012` - single-year trend behavior
The harness should select exactly one year and verify the comparative trend renders one active year series, with no prior-year overlay or second series in the legend or SVG content.

## Manual Checks
- `EVAL-008`: narrow viewport readability and usability.
- `EVAL-010`: business-readability and functional equivalence of the KPI/chart set.

## Evidence Schema
Each eval result should export a compact evidence object with the following fields:
- `id`: eval identifier
- `ac`: acceptance criterion identifier
- `result`: `PASS`, `FAIL`, `BLOCKED`, or `MANUAL`
- `summary`: one-line explanation of the observed outcome
- `details`: small JSON payload with the measured values, DOM anchors, or failure reason
- `timestamp`: ISO 8601 time of the evaluation run

Evidence must not include raw sales records, credentials, runtime connection strings, or personal data.

## Coverage Summary
- Total ACs: 12
- Automated candidates: 10
- Manual checks: 2
- Blocked checks at plan time: 0
- Coverage: 12/12 acceptance criteria mapped to an eval ID

## Current PASS / FAIL Status
- The eval plan is not executed yet, so no runtime PASS / FAIL result exists.
- Implementation work remains pending, so all results below execution level are intentionally deferred.

## Remaining MANUAL Checks
- `AC-008` / `EVAL-008`
- `AC-010` / `EVAL-010`

## Local Run Shape
The eventual harness should be runnable from a local HTTP server with no build step:
- serve the repository root with `python3 -m http.server 8000`
- open `http://localhost:8000/evals/harness.html`
- run all automated checks
- review the exported evidence bundle

## Notes for Implementation
The implementation should expose stable observable behavior where needed so the automated checks can inspect:
- filter groups and their selection state;
- the year picker and its available options;
- reset behavior;
- chart empty states and series count;
- quality banner text;
- a reproducible summary of the embedded dataset values.

## Approval Boundary
This file does not approve the dashboard implementation. It only defines the reusable evaluation contract that will be executed after implementation is added.