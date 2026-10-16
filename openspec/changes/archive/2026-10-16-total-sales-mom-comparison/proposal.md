# Proposal

## Why

Sales managers reading the Total Sales — Revenue (€) card only see a single absolute figure for the filtered selection, with no sense of whether sales are improving or declining month over month. Adding a current-vs-previous-month comparison turns the card into an actionable signal without requiring a separate report.

## What Changes

- Total Sales — Revenue (€) compares the latest available month in the current selection (current month) against the immediately preceding calendar month (previous month).
- The same non-date business filters (channel, user type, promotion) apply to both periods; only the month changes.
- The card shows, in addition to the current total: the previous-month total in euros, the euro difference (current − previous), and the percentage change, or `N/A` when the previous month's sales are zero.
- No other KPI card, chart, or filter changes.

## Capabilities

### New Capabilities
- `total-sales-kpi`: defines the Total Sales — Revenue (€) card's month-over-month comparison behavior (current total, previous total, euro difference, percentage change).

### Modified Capabilities
- (none — this is the first spec covering this card's behavior)

## Impact

- Affected code: the Total Sales — Revenue (€) KPI card markup and its rendering logic in `dashboard.html`.
- No new dependencies, no backend or Supabase schema changes, no changes to other KPI cards or charts.
