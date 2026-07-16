# 1. Metadata
- Title: Year-over-Year Period Comparison
- Status: Approved
- Version: 1.0.0
- Owner role or team: Commercial Analytics / Sales BI
- Last updated: 2026-07-16

# 2. Problem
- Who is affected: sales managers, business analysts, and dashboard users who make decisions about sales.
- Current pain or limitation: the current dashboard shows the active period, but it does not provide a clear comparison with an equivalent prior block to contextualize meaningful changes.
- Business impact: it is difficult to quickly detect growth, decline, or stabilization in sales; this slows commercial interpretation and can lead to decisions without a consistent time reference.

# 3. Context
- Current dashboard behavior: the current dashboard is a self-contained HTML file with filters, KPIs, rankings by channel and category, business narrative, a quality panel, and a recent sales table. The current version computes metrics on the active slice and does not provide an explicit temporal comparison.
- Relevant validated data sources and dependencies: the evolution must be based on a validated snapshot from Supabase in read-only mode. The final specification depends on inspecting the real schema to confirm tables, keys, relationships, and cardinalities. No unverified table name, column name, or join should be assumed.
- Privacy and data-quality considerations: names, surnames, email, date of birth, postal code, and any personal identifier must not be shown or inferred. Each source table must be validated independently, and each join must pass a cardinality check before the result is used. If a join duplicates sales or breaks the expected integrity, generation must be blocked.
- Supabase schema notes from the read-only inspection: the validated `public` schema contains `public.dim_articulos`, `public.dim_canal`, `public.dim_fecha`, `public.dim_promociones`, `public.dim_usuarios`, `public.fact_promociones_articulos`, and `public.fact_ventas`. The primary keys and foreign keys are confirmed, and the observed row counts preserve one-row cardinality through the sales join path.
- Confirmed schema conclusions from the validated snapshot: `public.fact_ventas` is the main sales fact table, its primary key is `id_linea_venta`, and it joins to `public.dim_canal` through `id_canal`, to `public.dim_fecha` through `id_fecha`, to `public.dim_promociones` through `id_promocion`, to `public.dim_articulos` through `id_articulo`, and to `public.dim_usuarios` through `id_usuario`. The canonical date field for comparison is `fact_ventas.fecha_venta`, which aligns with `dim_fecha.fecha` through `id_fecha`.
- Confirmed bridge-table behavior: `public.fact_promociones_articulos` is a promotion/article bridge with primary key `id_promocion_articulo` and unique promotion/article pairs. It can be used for validation and source mapping, but it must not expand the sales fact rows in the KPI path unless a cardinality gate explicitly allows it.
- Confirmed privacy-safe segmentation fields: `public.dim_usuarios` contains PII fields such as `nombre`, `apellidos`, `email_hash`, `fecha_nacimiento`, and `codigo_postal`, which must remain excluded. The usable anonymized fields for the dashboard are `segmento_cliente`, `genero`, `comunidad_autonoma`, and `tipo_usuario`.

# 4. Goals and Non-goals
- Goals: compare the selected period with the same period in the previous year; keep active filters applied symmetrically; show absolute and relative variations; prioritize quick commercial reading; avoid PII exposure; prevent unvalidated data from producing misleading KPIs.
- Non-goals: forecasting; automatic alerts; exports; publishing to Confluence in this iteration; individual-level analysis; runtime connection to Supabase in the final experience; reintroducing CSV as an operational source.

# 5. Scope
- In scope: calendar-based period selection; comparison with an equivalent block from the previous year; comparative KPIs; the main visualization aligned by equivalent calendar date; rankings and narratives oriented toward change; empty, error, and missing-comparison states; quality and privacy validation.
- Out of scope: new KPIs not already present in the current dashboard; architecture changes outside the self-contained HTML file; publishing; runtime database connection; personalization by identifiable user; predictive models; historical analysis beyond the agreed year-over-year comparison.

# 6. Requirements
- REQ-001: The dashboard must allow selecting a calendar period as the base of analysis.
- REQ-002: The dashboard must compare the selected period with an equivalent block from the same date range in the previous year.
- REQ-003: Active non-temporal filters must be applied symmetrically to the selected period and the compared period.
- REQ-004: The dashboard must show net sales, orders, average ticket, gross margin, and units for both periods.
- REQ-005: The dashboard must show absolute and relative variations between both periods.
- REQ-006: The main visualization must make it possible to read the comparison by equivalent calendar date.
- REQ-007: Business rankings and narratives must reflect change and contribution to the variation, not just absolute volume.
- REQ-008: The dashboard must show empty or informative states when there is no comparison base, no data remains after filters, or the prior period is missing.
- REQ-009: The dashboard must validate each source table separately and each join by cardinality before using the data.
- REQ-010: The dashboard must not expose or infer personally identifiable information anywhere in the interface or generated content.
- REQ-011: The final data source must come from validated Supabase; CSV and runtime database connections are not allowed in the final delivery.
- REQ-012: If any quality or privacy validation fails, the result must be blocked or degraded with a clear warning, not with a silently incorrect metric.

# 7. Acceptance Criteria
- AC-001: Given that a calendar period with valid data exists, When the user opens the dashboard, Then they see the selected period as the base and an equivalent compared period from the previous year. Map: REQ-001, REQ-002.
- AC-002: Given active non-temporal filters, When the user changes a filter, Then the selected period and the compared period are recalculated with the same filter applied. Map: REQ-003.
- AC-003: Given a period with valid data, When the dashboard renders, Then it shows net sales, orders, average ticket, gross margin, and units for both periods. Map: REQ-004.
- AC-004: Given two comparable periods, When the dashboard calculates the comparison, Then it shows absolute and relative variation in a visible and consistent way. Map: REQ-005.
- AC-005: Given that the user is looking at the main visualization, When both periods contain data, Then they can interpret the evolution by equivalent calendar date without manual calculations. Map: REQ-006.
- AC-006: Given business rankings and narratives, When there is a difference between periods, Then the output prioritizes contribution to change and not just current volume. Map: REQ-007.
- AC-007: Given that there is no data for the compared period or the filters leave the set empty, When the dashboard renders, Then an empty or informative state is shown and not a false comparison. Map: REQ-008.
- AC-008: Given that a source table fails a validation, When the snapshot is prepared, Then the table is marked as FAIL and the result is not presented as reliable without a warning. Map: REQ-009, REQ-012.
- AC-009: Given a join that duplicates sales or alters cardinality, When the set is validated, Then the process detects the problem and blocks use of the result. Map: REQ-009, REQ-012.
- AC-010: Given that a view tries to show PII, When the dashboard is reviewed, Then no names, surnames, email, date of birth, postal code, or other personal identifiers appear. Map: REQ-010.
- AC-011: Given the final delivery, When the data source is validated, Then the dashboard uses only a validated snapshot from Supabase and does not depend on CSV or runtime connection. Map: REQ-011.

# 8. Constraints
- Architecture: the delivery must remain a self-contained HTML dashboard.
- Data source: the final data must come from validated Supabase in read-only mode; the final experience must not depend on CSV or a runtime connection to the database.
- Privacy: showing or deriving PII is prohibited anywhere in the interface, narrative, filtering, or auxiliary content.
- Data quality: each source table must be validated separately; each join must pass a cardinality check before it is accepted.
- UX: the comparison must be understandable for business users, readable in Spanish, and provide clear loading, empty, missing-comparison, and failure states.
- Compatibility: behavior must remain compatible with modern browsers and with the current usage pattern of the dashboard.
- Publishing: this specification does not enable publishing to Confluence; any publication must follow the repository rule about parent page, space, and title.

# 9. Evolution
- Expected extension points: month-over-month comparison, year-to-date, custom windows, breakdown by channel or segment, root-cause narratives, and highlighting of change drivers.
- Backward-compatibility expectations: existing KPIs and filters must remain recognizable; if the comparison base is missing, the dashboard must degrade clearly without breaking the main reading flow.
- Versioning and change-log policy: visible changes in comparison behavior must bump the minor version; text, formatting, or error-state fixes must bump the patch version; changes in KPI definitions must be documented explicitly.
- Explicitly deferred capabilities: forecasting, alerts, exports, person-level analysis, runtime connection to Supabase, and publication to Confluence.

# 10. Open Questions and Decisions
- Confirmed decisions:
  - The comparison will be against the same period in the previous year.
  - The comparison will use calendar date and an equivalent block.
  - Active filters will be applied symmetrically to the selected period and the compared period.
  - The final source will not be CSV.
  - The final delivery must not use a runtime connection to Supabase.
- Open questions:
  - NON-BLOCKING TBD: define the exact period selector format as long as it preserves the calendar comparison and equivalent block.
- How to resolve the remaining TBD: finalize the exact period selector format during implementation, provided it preserves the approved calendar comparison and equivalent block behavior.

## Readiness for approval
There are no blocking TBD items remaining. The remaining period-selector detail is non-blocking and can be finalized during implementation as long as it preserves the approved calendar comparison behavior.

# 11. Traceability
| Problem | Goal | Requirement | Acceptance Criterion | Validation method |
|---|---|---|---|---|
| There is no comparative temporal reading | Compare the current period with an equivalent earlier block | REQ-001, REQ-002 | AC-001 | Review the period selection and the compared block in the dashboard |
| Filters can alter the comparative reading inconsistently | Apply the same filter context to both periods | REQ-003 | AC-002 | Change filters and verify that both windows are recalculated |
| Current KPIs do not show the context of the prior period | Show metrics for both periods | REQ-004 | AC-003 | Verify double and consistent KPIs for both periods |
| Without explicit variation, meaningful changes are not detected | Show deltas and direction | REQ-005 | AC-004 | Review absolute and relative variation in the KPIs |
| The trajectory cannot be interpreted without calendar alignment | Make the comparison evolution readable | REQ-006 | AC-005 | Inspect the main visualization aligned by equivalent date |
| Rankings only show volume | Emphasize contribution to change | REQ-007 | AC-006 | Compare ordering and narrative text when periods change |
| An empty period can lead to false conclusions | Show empty or informative states | REQ-008 | AC-007 | Test filters with no data or no comparison period |
| Incorrect joins can duplicate sales | Block unreliable results | REQ-009, REQ-012 | AC-008, AC-009 | Validate tables and cardinality before generating the snapshot |
| Risk of exposing personal information | Avoid PII | REQ-010 | AC-010 | Review UI, text, filters, and tooltips |
| The delivery must not depend on unauthorized sources | Use only validated Supabase | REQ-011 | AC-011 | Confirm the final source and absence of CSV/runtime DB |

Readiness for approval: there are no blocking TBD items remaining. The only open detail is the exact period selector format, which is non-blocking as long as it preserves the approved comparison behavior.