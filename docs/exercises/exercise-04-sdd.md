# Exercise 4 — Propose and Apply a Change with OpenSpec

[← Back to README](../../README.md) · [← Exercise 3](exercise-03-skills-mcp-instructions.md)

## Objective

Introduce **Specification-Driven Development (SDD)** using [OpenSpec](https://github.com/Fission-AI/OpenSpec), the industry tool for this workflow, so an idea does not move directly from planning to implementation. A reviewed, correct change becomes the verifiable contract between them.

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
Explore (optional, skipped in this exercise)
  ↓
Propose (OpenSpec generates proposal + specs + tasks)
  ↓
Review and correct the plan
  ↓
Implementation
  ↓
Verify + Evaluation (Harness/Evals)
  ↓
Archive (specs become living documentation)
```

> In this exercise, work through a reviewed, correct OpenSpec change and implement it. Verification, the harness, evals, and archiving are added in the next exercise.

OpenSpec's own [loop](https://openspec.dev/docs/quickstart#the-loop-at-a-glance) starts with `/opsx-explore`, a thinking-only mode that investigates the codebase and sharpens a fuzzy idea before proposing anything. This exercise skips it on purpose: the idea in Part 1 is already fully scoped (exact formulas, exact edge case) so every learner proposes the same change and gets a comparable result. Use `/opsx-explore` in your own work whenever the idea is still fuzzy — OpenSpec's own guidance is to go straight to `/opsx-propose` when you already know what you want to build, which is the case here.

## Part 0 — Validate OpenSpec and initialize the project (one time)

OpenSpec is a CLI that generates and manages the spec artifacts for you, instead of writing a single spec file by hand. It should already be installed from [Setup and Workshop Preparation](../setup.md).

Confirm it:

```bash
openspec --version
```

If that command fails, go back to [Setup and Workshop Preparation](../setup.md) and install it before continuing.

From the repository root, initialize it for GitHub Copilot:

```bash
openspec init --tools github-copilot
```

This creates:

```text
openspec/
├── config.yaml     # project settings and context for the agent
├── specs/          # living specs — empty until the first change is archived
└── changes/
    └── archive/    # completed changes land here
```

It also adds `.github/prompts/opsx-*.prompt.md`, so VS Code Copilot Chat shows new commands: `/opsx-propose`, `/opsx-apply`, `/opsx-archive`, and others. Restart VS Code if they don't appear right away.

## Part 1 — Start from a concrete idea

Use the same idea throughout the flow so the focus remains on learning SDD:

```text
As a sales manager, I want Total Sales to compare current-month sales with previous-month sales and show the change in euros and percentage terms.
```

For the result to be reproducible with historical data, in this exercise **current month** means the last available month within the selection and **previous month** means the immediately preceding calendar month. The date selector sets the reference month; both periods share the other business filters. If previous month sales are zero, show the percentage as `N/A` to avoid an invalid division.

## Part 2 — Propose the change

In Copilot Chat, run:

```text
/opsx-propose

As a sales manager, I want Total Sales to compare current-month sales with
previous-month sales and show the change in euros and percentage terms.

Current month means the last available month within the current selection;
previous month means the immediately preceding calendar month. Apply the
same non-date business filters to both periods.

Show:
- current month sales;
- previous month sales;
- euro difference: current - previous;
- percentage change: (current - previous) / previous * 100;
- N/A when previous sales are zero.

Inspect the current dashboard and do not invent data or fields. Scope this
change to the Total Sales card only.
```

OpenSpec creates `openspec/changes/total-sales-mom-comparison/` with:

- `proposal.md` — why this change is needed and what it affects;
- `specs/<capability>/spec.md` — requirements and scenarios, written as `### Requirement:` / `#### Scenario:` blocks with WHEN/THEN;
- `tasks.md` — the implementation checklist derived from the spec;
- `design.md` — only when the change actually needs one (new dependency, cross-cutting change, security/performance complexity). A single KPI card usually doesn't, and OpenSpec may skip it; that's expected, not a missing artifact.

Nothing is implemented yet.

## Part 3 — Review and correct the plan

Read the three generated files, in this order, and correct what's wrong — either by editing the Markdown directly or by asking the agent to revise it:

- `proposal.md`: is this the right problem, scoped to the Total Sales card only, without expanding beyond it?
- `specs/<capability>/spec.md`: the highest-value read. Does every scenario map to exactly one of these four behaviors, with none missing and none invented?
  - current month sales in euros;
  - previous month sales in euros;
  - euro difference (current − previous);
  - percentage change, or `N/A` when previous is zero — this behavior typically needs two scenarios under the same requirement: the normal calculation and the zero-previous edge case;
- `tasks.md`: do the tasks cover the specs above, and nothing more?

Reject and ask the agent to fix the plan if you find invented fields, a missing `previous = 0` edge case, scope creep beyond the Total Sales card, or any conflict with `AGENTS.md` / `.github/instructions/dashboard.instructions.md`.

There is no separate "Approved" field to flip: a plan counts as approved once you stop correcting it and are ready to move to implementation.

## Part 4 — Implement the change

In Copilot Chat:

```text
/opsx-apply
```

The agent works through `openspec/changes/total-sales-mom-comparison/tasks.md`, checking off each task as it lands. Confirm it also:

- follows `AGENTS.md` and `.github/instructions/dashboard.instructions.md`;
- implements only the tasks in the reviewed change, in the existing Total Sales card;
- uses stable DOM identifiers for the four displayed values;
- preserves the self-contained dashboard.

If a session is interrupted or runs out of context, re-run `/opsx-apply` — it resumes at the first unchecked task.

## Exercise result

The result is a reviewed `openspec/changes/total-sales-mom-comparison/` folder with a correct `proposal.md`, a `specs/` with one requirement per behavior above (the percentage-change requirement may carry two scenarios), and a `tasks.md` that covers them and nothing more, fully checked off. The Total Sales card shows the four new values. Verification and evaluation begin in the next exercise.

---

Continue to [Exercise 5 — Verify, Evaluate with a Harness, and Archive](exercise-05-verify-harness-archive.md).
