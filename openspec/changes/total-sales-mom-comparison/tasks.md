# Tasks

## 1. Compute current and previous month totals

- [ ] 1.1 Determine the latest month in the active filter selection and compute its completed sales revenue, applying the same non-date filters as the rest of the dashboard; verify by checking the computed value against a manual sum of the snapshot rows for that month
- [ ] 1.2 Compute the completed sales revenue for the immediately preceding calendar month using the same non-date filters; verify the same way

## 2. Compute the euro difference and percentage change

- [ ] 2.1 Compute the euro difference as current minus previous and verify it equals current month total minus previous month total
- [ ] 2.2 Compute the percentage change as (current - previous) / previous * 100, returning `N/A` when the previous total is zero; verify both the normal case and the zero-previous edge case

## 3. Display the four values with stable identifiers

- [ ] 3.1 Add stable DOM identifiers for the current total, previous total, euro difference, and percentage change in the Total Sales — Revenue (€) card and verify each renders the computed value when the dashboard loads in a browser
- [ ] 3.2 Confirm the card keeps the dashboard self-contained with no new external dependencies, and verify by inspecting the file for added `<script src>` or `<link>` tags

## Workflow follow-up

- Build `evals/harness.html`, one evaluation per scenario in `specs/total-sales-kpi/spec.md`, and get it to a full PASS before archiving.
- Archive the change with `openspec archive total-sales-mom-comparison` once the harness passes.
