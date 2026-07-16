# Eval Plan: Comparativa interanual de periodos

- Spec source: `specs/dashboard-evolution.md`
- Spec status: Approved
- Spec version: 1.0.0
- Scope source: approved `REQ-*` and `AC-*` identifiers only

Note: this plan does not introduce new behavior. It only decomposes the approved acceptance criteria into evaluable checks. No eval is marked BLOCKED at planning time because every AC can be described with an observable oracle. The spec still contains implementation TBDs, but those are implementation blockers, not evaluation blockers.

## Evaluation type coverage

- `static`: source-level checks for self-contained delivery and forbidden runtime dependencies.
- `DOM`: rendered structure, text, labels, and stable observable state in the browser.
- `interaction`: user actions that change filters or states and should update the dashboard.
- `data-quality`: Supabase table validation, join cardinality, and snapshot provenance evidence.
- `privacy`: absence of prohibited personal data in rendered content or embedded analytical data.
- `visual-manual`: reviewer judgment where no reliable local oracle is available yet.
- `external-manual`: not used by the approved AC set in this spec, because Confluence is not part of the approved requirements.

## Eval inventory

| Eval ID | Related REQ | Related AC | Type | Automation | Summary |
|---|---|---|---|---|---|
| EVAL-001 | REQ-001, REQ-002 | AC-001 | DOM | automated | Verify the dashboard opens on a base period and a same-span prior-year comparison period. |
| EVAL-002 | REQ-003 | AC-002 | interaction | automated | Verify non-temporal filters apply symmetrically to both periods. |
| EVAL-003 | REQ-004 | AC-003 | DOM | automated | Verify the five core KPIs are shown for both periods. |
| EVAL-004 | REQ-005 | AC-004 | DOM | automated | Verify KPI deltas show both absolute and relative variation. |
| EVAL-005 | REQ-006 | AC-005 | visual-manual | manual | Verify the main comparison chart is readable by equivalent calendar position. |
| EVAL-006 | REQ-007 | AC-006 | visual-manual | manual | Verify rankings and narratives emphasize contribution to change, not only volume. |
| EVAL-007 | REQ-008 | AC-007 | interaction | automated | Verify empty or no-comparison states are informative and do not fabricate results. |
| EVAL-008 | REQ-009, REQ-012 | AC-008 | data-quality | manual | Verify every required table has an explicit PASS or FAIL result before KPI use. |
| EVAL-009 | REQ-009, REQ-012 | AC-009 | data-quality | manual | Verify join cardinality does not inflate sales row counts or duplicate sales records. |
| EVAL-010 | REQ-010, REQ-012 | AC-010 | privacy | automated | Verify rendered content and embedded data do not expose prohibited personal identifiers. |
| EVAL-011 | REQ-011 | AC-011 | static | automated | Verify the production HTML does not depend on CSVs or a runtime Supabase connection. |
| EVAL-012 | REQ-011 | AC-011 | data-quality | manual | Verify the embedded snapshot is traceable to validated read-only Supabase evidence. |

## Eval definitions

### EVAL-001
- Related REQ and AC identifiers: REQ-001, REQ-002, AC-001
- Evaluation type: DOM
- Preconditions and fixture/state required: the approved dashboard is loaded with a validated snapshot that contains at least one selectable period with a same-span comparison in the prior year.
- Action performed: open the dashboard and inspect the period/base comparison state.
- Observable result: the UI shows a selected base period and a comparison period that corresponds to the same calendar span shifted one year back.
- Oracle: PASS if both period states are visible and the comparison period is the same calendar span in the prior year; FAIL if the comparison period is missing, not visible, or not aligned to the same span; BLOCKED if the validated snapshot does not contain a prior-year counterpart for the chosen period.
- Evidence to capture: rendered period labels, selected dates, and a screenshot or DOM snapshot of the comparison header/state.
- Automation status: automated, because the check can be performed from stable rendered text and DOM state after page load.

### EVAL-002
- Related REQ and AC identifiers: REQ-003, AC-002
- Evaluation type: interaction
- Preconditions and fixture/state required: the dashboard exposes at least one non-temporal filter control and the validated snapshot contains rows that change under filter interaction.
- Action performed: change each non-temporal filter one at a time while keeping the period selection unchanged.
- Observable result: both the selected period and the comparison period are recalculated with the same filter state applied.
- Oracle: PASS if each filter interaction updates both sides symmetrically and neither side retains a stale or different filter state; FAIL if one side changes differently, ignores the filter, or produces mismatched values; BLOCKED if no non-temporal filter is exposed or the snapshot cannot produce an observable change under filtering.
- Evidence to capture: before/after screenshots, filter state values, and the KPI/chart deltas triggered by the interaction.
- Automation status: automated, because the expected outcome is a browser-observable state change triggered by UI interaction.

### EVAL-003
- Related REQ and AC identifiers: REQ-004, AC-003
- Evaluation type: DOM
- Preconditions and fixture/state required: the dashboard is loaded with a valid comparison period that has data for the required KPI inputs.
- Action performed: render the dashboard and inspect the KPI region.
- Observable result: the dashboard displays sales net, orders, average ticket, gross margin, and units for both periods.
- Oracle: PASS if all five KPI families are visible for the current and comparison periods; FAIL if any KPI is missing, duplicated incorrectly, mislabeled, or shown for only one period; BLOCKED if the validated snapshot lacks the data needed to compute one of the required KPI families.
- Evidence to capture: KPI labels, displayed values, and a screenshot or DOM snapshot of the KPI block.
- Automation status: automated, because KPI presence and labels are directly observable in the DOM.

### EVAL-004
- Related REQ and AC identifiers: REQ-005, AC-004
- Evaluation type: DOM
- Preconditions and fixture/state required: the dashboard is loaded with a valid comparison period and all KPI cards render their delta states.
- Action performed: inspect the KPI variation displays.
- Observable result: each KPI shows both an absolute variation and a relative variation between the two periods.
- Oracle: PASS if each KPI family shows a visible absolute delta and a visible relative delta, and both use the same comparison basis; FAIL if either delta is missing, inconsistent, or visually ambiguous; BLOCKED if the dashboard does not render comparable delta values for a required KPI family.
- Evidence to capture: KPI delta labels, numeric values, and a DOM or screenshot capture of the comparison cards.
- Automation status: automated, because the presence and formatting of the deltas are browser-observable.

### EVAL-005
- Related REQ and AC identifiers: REQ-006, AC-005
- Evaluation type: visual-manual
- Preconditions and fixture/state required: the main comparison visualization is rendered with two comparable periods and enough data points to judge alignment.
- Action performed: visually inspect the main chart and compare the two series by calendar position.
- Observable result: the two periods can be read as equivalent calendar positions without manual date translation or visible off-by-one shifts.
- Oracle: PASS if a reviewer can confirm that the comparison is aligned by equivalent calendar position; FAIL if the chart is misaligned, visually misleading, or requires manual re-mapping to compare periods; BLOCKED if the chart does not render or does not expose enough information to judge alignment.
- Evidence to capture: screenshot of the chart and a short reviewer note stating the observed alignment.
- Automation status: manual, because the approved spec does not define a reliable local oracle for chart alignment beyond visual judgment.

### EVAL-006
- Related REQ and AC identifiers: REQ-007, AC-006
- Evaluation type: visual-manual
- Preconditions and fixture/state required: the dashboard renders rankings and narrative text for a case where the two periods differ.
- Action performed: read the ranking outputs and the narrative summary.
- Observable result: the output emphasizes contribution to the change and not only the raw current-period volume.
- Oracle: PASS if the rankings or narrative clearly highlight change drivers, direction, or contribution to the delta; FAIL if the output only reports absolute volume or ignores the change contribution; BLOCKED if the inspected state does not show a measurable difference between periods.
- Evidence to capture: screenshot of the ranking and narrative area plus the reviewer note.
- Automation status: manual, because contribution emphasis is a semantic judgment that is not reliably captured by a deterministic local check in the approved spec.

### EVAL-007
- Related REQ and AC identifiers: REQ-008, AC-007
- Evaluation type: interaction
- Preconditions and fixture/state required: a reproducible filter or period state exists that leaves no comparison data or no prior-year base.
- Action performed: select the empty-state fixture or the filter combination that removes the comparison base.
- Observable result: the dashboard shows an empty or informative state instead of a fabricated comparison.
- Oracle: PASS if the UI explicitly explains the absence of comparable data and suppresses misleading KPI/chart values; FAIL if it shows stale values, zeroes presented as real data, or any misleading comparison; BLOCKED if the approved data snapshot does not provide a reproducible empty-state condition.
- Evidence to capture: screenshot of the empty state and the rendered explanatory text.
- Automation status: automated, because empty-state behavior is observable in the browser once the fixture/state is reproducible.

### EVAL-008
- Related REQ and AC identifiers: REQ-009, REQ-012, AC-008
- Evaluation type: data-quality
- Preconditions and fixture/state required: read-only Supabase validation has been run against every required source table and the results are available as evidence.
- Action performed: inspect the table-level validation results before any KPI consumption.
- Observable result: every required source table has a clear PASS or FAIL result.
- Oracle: PASS if every required table is recorded with an explicit PASS or FAIL and any FAIL prevents the result from being treated as reliable; FAIL if any required table is unlabeled, skipped, or used despite a failure; BLOCKED if the required Supabase evidence is unavailable.
- Evidence to capture: table validation log, query output, and the recorded PASS/FAIL status for each required table.
- Automation status: manual, because the evidence comes from Supabase MCP tool output and must be reviewed as source-of-truth validation evidence rather than as a browser-only state.

### EVAL-009
- Related REQ and AC identifiers: REQ-009, REQ-012, AC-009
- Evaluation type: data-quality
- Preconditions and fixture/state required: join validation evidence is available with row counts captured before and after each candidate join.
- Action performed: compare row counts around each join and inspect the join result for duplication.
- Observable result: join cardinality does not increase row counts unexpectedly and does not duplicate sales records.
- Oracle: PASS if every validated join preserves the expected sales row count or otherwise matches an approved cardinality rule; FAIL if any join inflates the row count, duplicates sales records, or passes validation despite duplication; BLOCKED if before/after join counts cannot be established.
- Evidence to capture: before/after row-count comparison, join validation output, and the offending join name if a failure occurs.
- Automation status: manual, because the check depends on Supabase validation evidence and row-count reasoning outside the browser.

### EVAL-010
- Related REQ and AC identifiers: REQ-010, REQ-012, AC-010
- Evaluation type: privacy
- Preconditions and fixture/state required: the dashboard is rendered with its embedded analytical data and interactive controls visible.
- Action performed: scan rendered text, labels, tooltips, legends, filters, tables, and embedded data keys/values for prohibited personal data.
- Observable result: no names, surnames, email addresses, birth dates, postal codes, or equivalent identifiers appear anywhere in the rendered or embedded analytical data.
- Oracle: PASS if none of the prohibited personal fields or obvious natural-person identifiers are present in the DOM or embedded data; FAIL if any prohibited field appears; BLOCKED if the rendered state cannot be inspected or the embedded analytical data is inaccessible.
- Evidence to capture: DOM text snapshot, embedded data key/value scan, and a prohibited-term search report.
- Automation status: automated, because the approved spec explicitly forbids these values and the absence check can be performed programmatically against the rendered output.

### EVAL-011
- Related REQ and AC identifiers: REQ-011, AC-011
- Evaluation type: static
- Preconditions and fixture/state required: the production HTML artifact is present in the workspace or build output.
- Action performed: inspect the HTML source and linked assets for CSV references, runtime database URLs, or credential placeholders.
- Observable result: the dashboard remains a single self-contained HTML artifact without runtime CSV loading or a live Supabase connection.
- Oracle: PASS if the production HTML contains no CSV fetches/imports, no runtime Supabase database endpoint, and no credential placeholders; FAIL if any runtime CSV or database dependency is present; BLOCKED if the artifact cannot be read.
- Evidence to capture: source scan results, dependency grep output, and any link/asset inventory used during the scan.
- Automation status: automated, because the required check is a source-level static inspection.

### EVAL-012
- Related REQ and AC identifiers: REQ-011, AC-011
- Evaluation type: data-quality
- Preconditions and fixture-state required: read-only Supabase validation evidence exists for the snapshot that is embedded in the dashboard.
- Action performed: verify that the embedded snapshot is traceable to the validated Supabase read-only evidence.
- Observable result: the dashboard data can be traced back to validated Supabase evidence rather than CSV files or invented values.
- Oracle: PASS if the provenance evidence points to read-only Supabase outputs and matches the embedded snapshot; FAIL if the provenance is missing, contradictory, or references CSV/runtime DB data; BLOCKED if provenance evidence is unavailable.
- Evidence to capture: snapshot provenance note, Supabase validation references, and any manifest or checksum used to link the snapshot to the source evidence.
- Automation status: manual, because provenance is an evidence-review task that depends on Supabase MCP outputs and implementation records rather than on browser automation.

## Coverage matrix

| AC | Related REQ | Eval coverage | Type coverage | Notes |
|---|---|---|---|---|
| AC-001 | REQ-001, REQ-002 | EVAL-001 | DOM, automated | Base period and same-span prior-year comparison. |
| AC-002 | REQ-003 | EVAL-002 | interaction, automated | Symmetric application of non-temporal filters. |
| AC-003 | REQ-004 | EVAL-003 | DOM, automated | Five KPI families shown for both periods. |
| AC-004 | REQ-005 | EVAL-004 | DOM, automated | Absolute and relative deltas visible and consistent. |
| AC-005 | REQ-006 | EVAL-005 | visual-manual, manual | Chart alignment by equivalent calendar position requires reviewer judgment. |
| AC-006 | REQ-007 | EVAL-006 | visual-manual, manual | Ranking/narrative contribution emphasis requires reviewer judgment. |
| AC-007 | REQ-008 | EVAL-007 | interaction, automated | Empty or no-comparison state must be informative. |
| AC-008 | REQ-009, REQ-012 | EVAL-008 | data-quality, manual | Every required table must have explicit PASS/FAIL evidence. |
| AC-009 | REQ-009, REQ-012 | EVAL-009 | data-quality, manual | Join cardinality must not duplicate sales records. |
| AC-010 | REQ-010, REQ-012 | EVAL-010 | privacy, automated | No prohibited personal identifiers in rendered or embedded data. |
| AC-011 | REQ-011 | EVAL-011, EVAL-012 | static, automated; data-quality, manual | One eval covers absence of runtime dependencies; one covers snapshot provenance. |

## Notes

- No approved AC in this spec requires an `external-manual` eval, because Confluence publication is not part of the approved requirement set.
- Manual evals are intentionally limited to cases where the approved spec does not provide a deterministic local oracle.
- If later implementation work changes an observable behavior, the spec must be updated and re-approved before this eval plan is revised.
