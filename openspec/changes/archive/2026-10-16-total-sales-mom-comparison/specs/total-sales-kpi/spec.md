# Spec Delta

## Purpose

Defines how the Total Sales — Revenue (€) card compares current-month sales against the previous calendar month, including the euro difference and percentage change shown to sales managers.

## ADDED Requirements

### Requirement: Current month total
The Total Sales — Revenue (€) card SHALL display the sum of completed sales revenue, in euros, for the latest available month within the current filter selection, applying the same non-date business filters as the rest of the dashboard.

#### Scenario: Current month total is shown
- **WHEN** a sales manager applies channel, user type, and promotion filters and selects a date range
- **THEN** the card shows the total completed sales revenue in euros for the latest month within that range, filtered by the same non-date filters

### Requirement: Previous month total
The Total Sales — Revenue (€) card SHALL display the sum of completed sales revenue, in euros, for the calendar month immediately preceding the current month, applying the same non-date business filters as the current month.

#### Scenario: Previous month total is shown
- **WHEN** the current month is determined for the active filter selection
- **THEN** the card shows the total completed sales revenue in euros for the immediately preceding calendar month, using the same non-date filters

### Requirement: Euro difference
The Total Sales — Revenue (€) card SHALL display the euro difference between the current month total and the previous month total, computed as current minus previous.

#### Scenario: Euro difference is current minus previous
- **WHEN** both the current month total and the previous month total are available
- **THEN** the card shows their difference in euros, equal to current month total minus previous month total

### Requirement: Percentage change
The Total Sales — Revenue (€) card SHALL display the percentage change from the previous month to the current month, computed as (current − previous) / previous × 100, or `N/A` when the previous month total is zero.

#### Scenario: Percentage change is calculated
- **WHEN** the previous month total is greater than zero
- **THEN** the card shows the percentage change computed as (current month total − previous month total) divided by previous month total, multiplied by 100

#### Scenario: Percentage change is N/A when previous is zero
- **WHEN** the previous month total is zero
- **THEN** the card shows `N/A` instead of a percentage, avoiding a division by zero
