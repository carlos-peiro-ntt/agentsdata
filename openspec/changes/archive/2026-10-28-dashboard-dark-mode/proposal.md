# Proposal

## Why

The sales dashboard currently uses a light palette, so it is uncomfortable to use when the operating system is set to dark mode and offers no way for a sales manager to choose a theme. A coherent dark theme will make the dashboard usable in both environments while preserving the meaning and readability of its sales indicators.

## What Changes

- Add a dark theme that follows the operating system preference on first visit.
- Add an accessible control to switch between light and dark themes and remember the manager's explicit choice across visits.
- Keep printed output in the light theme, regardless of the active screen theme.
- Apply theme colors consistently to dashboard surfaces, text, controls, chart labels and gridlines, and semantic status indicators.
- Preserve dashboard data, calculations, filters, and existing KPI identifiers.

## Capabilities

### New Capabilities
- `dashboard-theme`: system-aware light and dark themes, explicit persistent selection, and light-theme printing.

### Modified Capabilities

None. The existing `total-sales-kpi` requirements are unchanged.

## Impact

- `dashboard.html`: theme control, theme initialization and persistence, CSS palette, SVG chart colors, and print styling.
- No external dependencies or data-source changes.
- The existing KPI harness and KPI DOM identifiers remain unchanged.