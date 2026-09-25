# Exercise 2 — From Prompt to Persistent Instructions

[← Back to README](../../README.md) · [← Exercise 1](exercise-01-dashboard.md)

## Objective

Create `AGENTS.md` as the project instruction manual and check how it changes the agent's behavior.

> `AGENTS.md` is not an agent. It is a living document that provides context, rules, and conventions to agents working in the repository.

Common names by tool:

- Codex, Copilot, and OpenCode: `AGENTS.md`.
- Claude: `CLAUDE.md`.

## Part 1 — Create `AGENTS.md`

1. Switch to **Agent** mode.
2. Run:

```text
/init
```

3. Open the generated `AGENTS.md`.
4. Review what knowledge it extracted from the repository.

`/init` can be used in two ways:

- in an empty repository, to establish initial rules;
- in a repository with content, to capture implicit knowledge from its structure and code.

## Part 2 — Add business context

Edit `AGENTS.md` and add the following content, adapting it without duplicating existing sections:

```markdown
## Business Context

This project is a retail sales analytics dashboard for business users.

The primary goal is to help business stakeholders understand sales performance through reliable KPIs, interactive visualizations, and actionable insights.

## Agent Guidance

When working on this project:

- Prioritize business insights over visual complexity.
- Validate data quality before calculating or presenting KPIs.
- Clearly identify the source CSVs used for each metric.
- Report data-quality limitations before making recommendations.
- Prefer simple, business-readable dashboards with interactive filtering.
- Keep the current standalone HTML architecture unless a different technical approach is explicitly requested.
- Avoid introducing external dependencies unless explicitly approved.

## Business KPIs

When relevant, prioritize metrics such as:

- Revenue
- Margin %
- Average Ticket
- Sales by Channel
- Sales by Category
- Conversion
- Units Sold

## Data Quality

Before presenting results:

- Validate null or missing values.
- Check referential integrity across dimension tables.
- Detect anomalous values, including unusual price drops and potential stock issues.
- Explain any limitations that may affect the reliability of the analysis.
```

## Part 3 — Improve the dashboard

1. Save `AGENTS.md`.
2. Keep **Agent** mode selected.
3. Send:

```text
Mejora este dashboard.
```

4. Check whether the agent automatically applies the `AGENTS.md` rules.
5. Reopen the dashboard and compare the result with the previous exercise.

## Exercise validation

Check that:

- `AGENTS.md` exists;
- the agent validates quality before presenting conclusions;
- the KPIs are business-oriented;
- the dashboard remains an independent HTML file;
- no external dependencies were added without authorization.

> We have not used Plan mode yet. Up to this point, we have worked directly with Ask and Agent.

---

Continue to [Exercise 3 — Skills, MCP, Planning, and Implementation](exercise-03-skills-mcp.md).
