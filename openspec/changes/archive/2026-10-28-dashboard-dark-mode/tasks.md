# Tasks

## 1. Theme State and Palette

- [x] 1.1 Add an accessible theme toggle and initialize theme state from a saved explicit choice or, when none exists, the system preference; verify first-visit light/dark behavior, keyboard operation, assistive-technology state, persistence after reload, live system changes without an override, and graceful operation when storage is unavailable.
- [x] 1.2 Define light and dark CSS color tokens and apply them to dashboard surfaces, text, controls, status indicators, chart labels, gridlines, and series; verify both palettes meet the specified WCAG 2.2 AA contrast thresholds and preserve status meaning.

## 2. Print and Integration Verification

- [x] 2.1 Add print styling that forces the light palette without changing the saved screen preference; verify print preview from both screen themes and confirm the screen theme remains unchanged afterward.
- [x] 2.2 Run `node evals/harness.js` and verify all five KPI evaluations pass; confirm the existing KPI IDs, calculations, filters, and dashboard data are unchanged.
- [x] 2.3 Inspect the complete dashboard in both themes at desktop and mobile widths, including all charts and status indicators, and verify no theme-dependent fixed colors remain.