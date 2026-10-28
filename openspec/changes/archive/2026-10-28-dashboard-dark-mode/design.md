# Design

## Context

See proposal.md - Why. `dashboard.html` is a standalone page with root-level CSS color variables, additional literal colors in component styles, and JavaScript-rendered SVG and chart palettes. The page has no theme state or external UI dependencies. Its data and KPI calculations are separate from presentation and must remain unchanged.

## Goals / Non-Goals

**Goals:**
- Make the initial theme follow the system preference, with an explicit saved choice taking precedence.
- Keep theme state accessible and ensure all page and chart colors respond consistently.
- Meet WCAG 2.2 AA contrast targets: 4.5:1 for normal text and 3:1 for large text and meaningful graphical controls or indicators.
- Use a light palette for print without changing the saved screen preference.

**Non-Goals:**
- Change dashboard data, metrics, filters, or KPI DOM identifiers.
- Add a third theme, a settings page, or a new dependency.
- Persist preferences outside the current browser profile.

## Decisions

1. **Resolve theme before first paint.** Initialize the root `data-theme` from a valid saved choice; otherwise use `prefers-color-scheme`. Run this small initialization before dashboard content renders to avoid a flash of the wrong palette. While no choice is saved, respond to system preference changes in the open page.
   - Alternative: CSS-only system theming. Rejected because it cannot support a manual override.

2. **Persist only explicit choices in local storage.** A native button toggles the theme, exposes its active state accessibly, and stores the selected value. Validate stored values and fall back to the system preference if storage is unavailable or invalid.
   - Alternative: always save an initial system-derived value. Rejected because it would stop following later system changes without the manager choosing a theme.

3. **Use CSS custom properties as the palette contract.** Define light and dark tokens for surfaces, text, borders, controls, semantic statuses, chart grid/labels, and chart series. Replace literal theme-dependent colors in components and JavaScript-generated visualizations with these tokens. Keep series distinguishable and status colors semantically consistent in both palettes.
   - Alternative: duplicate chart renderers for each theme. Rejected because it duplicates presentation logic and risks divergence.

4. **Override theme tokens for print.** A print media rule supplies the light palette and suitable print backgrounds regardless of the screen `data-theme`; it does not modify the stored preference. Hide the theme control in print if it would otherwise appear as an irrelevant action.
   - Alternative: switch the document state before printing. Rejected because it introduces transient state and restoration behavior unnecessarily.

## Risks / Trade-offs

- **A token can pass contrast on one surface but fail on another** -> Check text, controls, chart labels, gridlines, status indicators, and focus states against their actual backgrounds in both palettes; verify the specified WCAG 2.2 AA thresholds.
- **Browser storage may be blocked** -> Catch storage access failures and keep the selected theme for the current page session without preventing dashboard startup.
- **Print engines handle backgrounds differently** -> Use print-friendly foreground/background colors and verify the browser print preview with the screen theme both light and dark.
- **A hard-coded color may be missed** -> Search the HTML/CSS/JavaScript for remaining theme-dependent literals and inspect every chart and status component in both themes.

## Migration Plan

No data migration or deployment step is required. Existing users receive a theme based on their system preference on first use; subsequent manual choices are stored locally. Clearing the dashboard's local storage removes the override and restores system-following behavior.