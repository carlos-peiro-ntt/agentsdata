# 1. Metadata

- Status: Approved
- Version: 1.0.0
- Feature: Monthly Total Sales comparison

# 2. Problem

The Total Sales revenue KPI currently presents an aggregate value without a direct comparison between the selected reporting period and the immediately previous calendar month. Business users need to see the current month's sales and the month-over-month movement in a consistent euro-based view.

# 3. Context

The dashboard is a standalone sales dashboard that presents validated, embedded sales data. Users can select years and months, as well as channel, user type, and promotion filters. The latest available month within the selected date periods is the reference month. The comparison must use the same non-date filters for both months and must respect the dashboard's data-quality and privacy rules.

# 4. Goals and Non-goals

## Goals

- Make current-month Total Sales visible in euros.
- Make immediately previous calendar-month Total Sales visible in euros.
- Show the euro difference and percentage change between both months.
- Keep the comparison understandable when the previous month has no sales.

## Non-goals

- Changing other KPI definitions or dashboard visualizations.
- Adding new data sources, fields, or personal information.
- Changing the existing year, month, channel, user type, or promotion filter options.

# 5. Scope

The change covers the Total Sales revenue KPI and its comparison details. The current period is the latest chronological available month within the selected date periods. The previous period is the immediately preceding calendar month, including a December-to-January year transition. Completed sales revenue is used for both periods, with the same selected channel, user type, and promotion filters applied to each.

# 6. Requirements

- REQ-001: The dashboard shall show Total Sales for the current month in euros.
- REQ-002: The dashboard shall show Total Sales for the previous month in euros.
- REQ-003: The dashboard shall show the difference between current-month and previous-month Total Sales in euros, calculated as current minus previous.
- REQ-004: The dashboard shall show the percentage change from previous-month to current-month Total Sales, calculated as the euro difference divided by previous-month sales times 100, or show `N/A` when previous-month sales are zero.

# 7. Acceptance Criteria

## AC-001: Current-month Total Sales

Given a date selection with at least one available month
When the Total Sales KPI is displayed
Then it shows the Total Sales for the latest available selected month in euros.

## AC-002: Previous-month Total Sales

Given a current reference month and the existing non-date filters
When the Total Sales comparison is displayed
Then it shows Total Sales for the immediately previous calendar month in euros using the same non-date filters.

## AC-003: Euro Difference

Given current-month and previous-month Total Sales values
When the comparison is displayed
Then it shows the euro difference as current-month sales minus previous-month sales.

## AC-004: Percentage Change

Given current-month and previous-month Total Sales values
When the comparison is displayed
Then it shows percentage change as the euro difference divided by previous-month sales times 100, or shows `N/A` when previous-month sales are zero.

# 8. Constraints

- Use only validated dashboard data sourced through the configured read-only Supabase workflow and embedded in the standalone dashboard; do not use CSV files, sample data, invented values, or a runtime database connection.
- Apply the selected channel, user type, and promotion filters identically to current and previous months.
- Preserve the dashboard's privacy rules and do not expose names, email addresses, birth dates, postal codes, or other identifying fields.
- If no available month remains under the date selection, the Total Sales comparison must present a clear no-data state rather than inventing a reporting period.
- If previous-month sales are zero, the euro difference remains calculable and the percentage must be `N/A`.

# 9. Evolution

This draft defines the first version of the monthly Total Sales comparison. Future revisions may refine presentation or add approved comparison periods, but any change must preserve the validated data source, privacy protections, existing filter semantics, and the four calculations defined here.