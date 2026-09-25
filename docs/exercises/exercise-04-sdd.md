# Exercise 4 — From Plan to Specification with SDD

[← Back to README](../../README.md) · [← Exercise 3](exercise-03-skills-mcp.md)

## Objective

Introduce **Specification-Driven Development (SDD)** so an idea does not move directly from planning to implementation. The approved specification becomes the verifiable contract between them.

**Before**

```text
Idea
  ↓
Plan
  ↓
Implementation
```

**Now**

```text
Idea
  ↓
Plan
  ↓
Spec
  ↓
Implementation
  ↓
Evaluation (Harness/Evals)
```

> In this exercise, work only through approval of the spec. Implementation, the harness, and evals will be added in the next exercise.

## Part 1 — Start from a concrete idea

Use the same idea throughout the flow so the focus remains on learning SDD:

```text
As a sales manager, I want Total Sales to compare current-month sales with previous-month sales and show the change in euros and percentage terms.
```

For the result to be reproducible with historical data, in this exercise **current month** means the last available month within the selection and **previous month** means the immediately preceding calendar month. The date selector sets the reference month; both periods share the other business filters. If previous month sales are zero, show the percentage as `N/A` to avoid an invalid division.

## Part 2 — Generate and review the plan

In **Plan** mode, send this short prompt:

```text
Plan this dashboard change without editing files.

Update Total Sales to compare the latest available month in the date
selection with the immediately previous calendar month.

Treat the selected month as the reference period and apply the same
non-date business filters to both periods.

Show:
- current month sales;
- previous month sales;
- euro difference: current - previous;
- percentage change: (current - previous) / previous * 100;
- N/A when previous sales are zero.

Read AGENTS.md and .github/instructions/dashboard.instructions.md. Inspect the current dashboard
and do not invent data or fields.

Return only:
- affected area;
- calculation rules;
- edge cases;
- validation steps.
```

Check that the plan does not expand the scope. Nothing is implemented yet.

## Part 3 — Generate the spec

Ask the agent to convert the idea and plan into a small spec:

```text
Create specs/dashboard-evolution.md from the agreed idea and plan.

Read AGENTS.md and .github/instructions/dashboard.instructions.md. Describe observable behavior,
not implementation details. Do not modify the dashboard.

Use exactly these nine sections:

1. Metadata
2. Problem
3. Context
4. Goals and Non-goals
5. Scope
6. Requirements
7. Acceptance Criteria
8. Constraints
9. Evolution

Use exactly four requirements and four mapped acceptance criteria:

- REQ-001 / AC-001: show Total Sales for the current month in euros.
- REQ-002 / AC-002: show Total Sales for the previous month in euros.
- REQ-003 / AC-003: show current minus previous in euros.
- REQ-004 / AC-004: show percentage change, or N/A when previous is zero.

Use Given/When/Then for every AC.

Set:
- Status: Draft
- Version: 0.1.0

Do not add more REQ or AC, invent data, or leave blocking TBD items.
Do not implement anything yet.
```

## Part 4 — Review and approve the spec

Review only these conditions:

- the nine sections appear once and in that order;
- exactly four requirements and four criteria exist, with a one-to-one relationship;
- the formulas and the `previous = 0` case are verifiable;
- no `TBD`, blocking questions, or conflicts with repository rules remain.

If the spec meets the list, change its status from `Draft` to `Approved` and its version from `0.1.0` to `1.0.0`. This change must be explicit; the file is not considered approved merely because it exists.

## Exercise result

The result is `specs/dashboard-evolution.md` in `Approved` status, version `1.0.0`, with nine sections, four `REQ`s, and four `AC`s. Implementation begins in the next exercise.

---

Continue to [Exercise 5 — Guided Implementation and Harness/Evals](exercise-05-implementation-evals.md).
