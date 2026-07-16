# Dashboard Evolution Spec - Combo Filters and Year Calendar

## 1. Metadata
- Title: Dashboard Evolution Spec - Combo Filters and Year Calendar
- Status: Approved
- Version: 0.1.0
- Owner role or team: Retail Analytics Dashboard Team
- Last updated: 2026-07-16

## 2. Problem
- Who is affected: Business users reviewing retail sales performance, especially users who segment results by channel, user type, promotion, month, and year.
- Current pain or limitation: The current filter experience uses chip lists for every dimension, which is harder to scan and less scalable. The year control is not calendar-based, so it does not match the requested interaction model.
- Business impact: Slower analysis, lower usability on dense dashboards, and less intuitive time-based exploration when stakeholders compare performance across periods.

## 3. Context
- Current dashboard behavior: The dashboard is a standalone HTML page with embedded validated sales data from Supabase. It renders KPIs, trend charts, and breakdown charts that all react to filter state. The current year filter is chip-based and all other filters are also chip-based multi-select controls.
- Relevant validated data sources and dependencies: The dashboard depends on the embedded Supabase-derived snapshot already validated in the repository. It must continue to respect the validated fact grain and anonymous operational attributes only. No new data source is introduced by this evolution.
- Privacy and data-quality considerations: Personal identifiers must remain excluded. The dashboard must continue to avoid names, emails, birth dates, postal codes, or any identifying field. Any filter labels, summaries, and empty states must remain privacy-safe. The existing data-quality gate remains mandatory, including table validation, join-cardinality checks, and truthful reporting of limitations.

## 4. Goals and Non-goals
- Goals:
  - Provide a more intuitive filter experience using combo-style controls.
  - Make the year filter behave like a calendar-based selector.
  - Preserve the existing business metrics, charts, and embedded-data architecture.
  - Keep the dashboard privacy-safe and validation-driven.
- Non-goals:
  - Introducing new tables, new business formulas, or new KPI definitions.
  - Publishing Confluence documentation in this change.
  - Replacing the standalone HTML architecture.
  - Introducing runtime database access or external dependencies.
  - Expanding scope into new analytics or new dimensions not already present in the validated dataset.

## 5. Scope
- In scope:
  - Filter interaction model for year and the other existing dimensions.
  - Filter labels, summaries, empty states, and reset behavior.
  - Responsive usability for the updated filter controls.
  - Behavior needed so KPIs and charts continue to synchronize with selections.
- Out of scope:
  - New metrics, new charts, or new source data.
  - Changes to Supabase schemas or joins.
  - Confluence publication.
  - Any personal-data analysis or exposure.

## 6. Requirements
- REQ-001: The dashboard must present the existing non-year filters as combo-style controls that support selecting multiple values.
- REQ-002: The year filter must be presented as a calendar-based control rather than a chip list.
- REQ-003: The year control must allow the user to select a valid year value only from the available validated dataset years.
- REQ-004: The filter experience must preserve the ability to reset all filters to the default full-selection state.
- REQ-005: The dashboard must update KPIs, charts, and selection summaries whenever any filter selection changes.
- REQ-006: The dashboard must continue to render a truthful data-quality status derived from validated embedded data.
- REQ-007: The dashboard must continue to exclude all personal identifiers from the UI, filter labels, summaries, charts, and embedded page content.
- REQ-008: The dashboard must support empty-state behavior when a filter combination returns no matching rows.
- REQ-009: The dashboard must remain usable on desktop and mobile viewports after the filter redesign.
- REQ-010: The filter UI must not expose values or controls that require unvalidated schema fields or invented business rules.
- REQ-011: The dashboard must keep the existing business KPI set and chart set unless a validated dependency requires a narrowly scoped adjustment to preserve behavior.
- REQ-012: The dashboard must preserve the standalone, self-contained HTML delivery model.
- REQ-013: When a single year is selected, the comparative trend must render only the selected year as the active series and must not overlay a prior-year comparison.

## 7. Acceptance Criteria
- AC-001 maps to REQ-001: Given the dashboard loads with validated embedded data, when a user opens the filter area, then each non-year filter appears as a combo-style control supporting multiple selections.
- AC-002 maps to REQ-002 and REQ-003: Given the dashboard loads, when a user interacts with the year filter, then the control behaves as a calendar-based year picker and only allows years present in the validated dataset.
- AC-003 maps to REQ-004: Given the user has changed one or more filters, when the user activates reset, then all filters return to the default full-selection state and the dashboard refreshes accordingly.
- AC-004 maps to REQ-005: Given any filter value changes, when the selection is applied, then all KPIs, charts, and the selection summary update to reflect the new filtered dataset.
- AC-005 maps to REQ-006: Given the dashboard loads successfully, when the quality banner is shown, then it reports a truthful validation status derived from the embedded snapshot and not from invented values.
- AC-006 maps to REQ-007: Given any filter interaction, when the dashboard renders labels or summaries, then no personal identifiers are shown anywhere in the interface.
- AC-007 maps to REQ-008: Given a filter combination with no matching rows, when the dashboard renders, then the affected chart regions show an explicit empty state instead of broken visuals or fabricated values.
- AC-008 maps to REQ-009: Given the dashboard is viewed on a narrow viewport, when the filter bar and charts render, then controls remain readable and operable without horizontal overflow that blocks use.
- AC-009 maps to REQ-010: Given the dashboard is built from the current validated dataset, when filter options are generated, then all labels correspond to validated values already present in the embedded snapshot.
- AC-010 maps to REQ-011: Given the new filter model is active, when a user compares dashboard behavior before and after the change, then the existing KPI and chart set remains recognizable and functionally equivalent.
- AC-011 maps to REQ-012: Given the dashboard is delivered, when it is opened locally, then it remains self-contained and does not require runtime database connectivity.
- AC-012 maps to REQ-013: Given the year filter is set to a single year, when the comparative trend renders, then only the selected year is plotted and no prior-year series is shown.

## 8. Constraints
- Architecture: The dashboard must remain a standalone HTML file with embedded validated data.
- Data source: Supabase remains the only authoritative source. CSVs, sample data, and invented values are prohibited.
- Privacy: No names, emails, birth dates, postal codes, or other identifying fields may appear anywhere in the dashboard.
- Data quality: The dashboard must preserve the existing data-quality gate, including separate table validation and join-cardinality checks.
- UX: The filter controls must be business-readable, responsive, and usable with keyboard and pointer input.
- Compatibility: The page must continue to function in a browser without requiring a build step.
- Publishing: No Confluence publishing is included in this scope.
- Validation: Any failed source validation or data-quality check blocks approval of the evolution.

## 9. Evolution
- Expected extension points:
  - Additional filter controls may be added later if they are supported by validated data and documented business need.
  - The calendar-style year selector may later evolve into richer time navigation if the dataset and use case justify it.
- Backward-compatibility expectations:
  - Existing KPI definitions, chart meanings, and privacy constraints must remain stable unless a future version explicitly revises them.
  - Current embedded-data behavior should remain the default delivery model.
- Versioning and change-log policy:
  - Major user-facing interaction changes should increment the minor version.
  - Validation or copy-only changes should increment the patch version.
  - Breaking changes to filter semantics require a new approved spec version.
- Explicitly deferred capabilities:
  - Confluence publication.
  - New metrics or formulas.
  - Runtime Supabase connectivity.
  - New dimensions or analyses outside the validated sales snapshot.

## 10. Open Questions and Decisions
- Unresolved question: Should the comparative trend continue to show the selected year against the prior year when a single year is selected, or should it switch to a single-series view?
  - Blocking: Yes.
- Unresolved question: Should the combo controls default to all values selected or to a narrower default selection?
  - Blocking: No.
- Confirmed decision: The dashboard remains self-contained HTML with embedded validated data.
- Confirmed decision: No personal identifiers may be introduced.
- Confirmed decision: No new data source or Confluence publication is part of this change.
- Confirmed decision: The comparative trend must show only the selected year when a single year is selected.

## 11. Traceability
| Problem | Goal | Requirement | Acceptance Criterion | Validation method |
|---|---|---|---|---|
| Chip-based filters are harder to scan and use | Make filters easier to understand and operate | REQ-001 | AC-001 | Browser inspection of filter controls and interaction tests |
| Year selection is not calendar-based | Provide a calendar-style year selector | REQ-002, REQ-003 | AC-002 | Verify year control only allows validated years |
| Users need predictable reset behavior | Preserve easy recovery from filter changes | REQ-004 | AC-003 | Click reset and confirm all selections return to default |
| Dashboard must remain synchronized | Keep KPIs and charts aligned with selections | REQ-005 | AC-004 | Change filters and confirm all visible summaries update |
| Trust depends on truthful validation | Preserve data-quality transparency | REQ-006 | AC-005 | Check quality banner against validated embedded data |
| Privacy exposure must stay blocked | Continue excluding personal identifiers | REQ-007 | AC-006 | Inspect labels, summaries, and embedded content for PII |
| Empty selections must be handled safely | Provide explicit no-data behavior | REQ-008 | AC-007 | Apply restrictive filters and confirm empty states render |
| Mobile usability matters | Keep the dashboard usable on smaller screens | REQ-009 | AC-008 | Resize viewport and verify no unusable overflow |
| Options must be authoritative | Avoid invented values or schema drift | REQ-010 | AC-009 | Compare generated options to embedded validated values |
| Core dashboard meaning must remain stable | Preserve existing KPI/chart semantics | REQ-011 | AC-010 | Compare pre/post interaction behavior on the same snapshot |
| Self-contained delivery must continue | Avoid runtime connectivity | REQ-012 | AC-011 | Open locally without database dependency |
| Year trend should not imply a hidden comparison | Keep the selected year as the only active series | REQ-013 | AC-012 | Select one year and confirm no prior-year series is rendered |

## Readiness for approval
- Blockers: None.
- Non-blocking TBDs: Default selection state for combo controls.
- Approved for implementation; implementation work remains pending.
