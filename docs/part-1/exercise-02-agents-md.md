# Exercise 2 — From Prompt to AGENTS.md

[← Back to README](../../README.md) · [← Exercise 1](exercise-01-dashboard.md)

## Objective

Create `AGENTS.md` as the project instruction manual and check how it changes the agent's behavior.

> `AGENTS.md` is not an agent. It is a living document that provides context, rules, and conventions to agents working in the project.

Common names by tool:

- Codex, Copilot, and OpenCode: `AGENTS.md`.
- Claude: `CLAUDE.md`.

## Part 1 — Create `AGENTS.md`

1. Switch to **Agent** mode.

<details>
<summary><strong>Codex</strong></summary>

Allow Codex to write in the project. In `.codex/config.toml` (or `~/.codex/config.toml` if you used it in Exercise 1), change the sandbox and start a new Codex conversation:

```toml
sandbox_mode = "workspace-write"
approval_policy = "on-request"
```

If `/init` does not appear when you type `/` in the Codex composer, send instead: `Create an AGENTS.md for this project describing its structure, conventions, and how to work in it.`

</details>

2. Run:

```text
/init
```

3. Open the generated `AGENTS.md`.
4. Review what knowledge it extracted from the project folder.

`/init` can be used in two ways:

- in an empty project, to establish initial rules;
- in a project with content, to capture implicit knowledge from its structure and code.

## Part 2 — Add business context

Edit `AGENTS.md` and add the following content, adapting it without duplicating existing sections:

```markdown
## Business Context

This project is a retail sales analytics dashboard for business users.

The primary goal is to help business stakeholders understand sales performance through reliable KPIs, interactive visualizations, and actionable insights.

## Agent Guidance

When working on this project:

- Prioritize business insights over visual complexity.
- Validate data quality and report limitations before presenting KPIs or recommendations.
- Clearly identify the data source (files or tables) used for each metric.
- Prefer simple, business-readable dashboards with interactive filtering.
- Keep the current standalone HTML architecture unless a different technical approach is explicitly requested.
- The dashboard must open directly from disk with its data embedded. Do not start a local web server (for example `python -m http.server`) to serve or preview it.
- Avoid introducing external dependencies unless explicitly approved.

## Business Metrics & KPI Context

The dashboard represents commercial performance for a retail business.

The KPI layer should cover:
- Revenue
- Margin %
- Average Ticket
- Sales by Channel
- Sales by Category
- Conversion
- Units Sold

These metrics are business requirements, not merely visual suggestions.
When improving the dashboard, review whether the KPI layer includes the
relevant metrics, presents them clearly, and keeps them consistent with the
available data source.

Do not invent values. Use the repository’s current data access mechanism,
whether local files, APIs, MCP tools, or another configured source.
```

## Part 3 — Improve the dashboard

1. Save `AGENTS.md`.
2. Keep **Agent** mode selected (Codex: keep `workspace-write`).
3. Send:

```text
Improve this dashboard.
```

4. Check whether the agent automatically applies the `AGENTS.md` rules.
5. Reopen the dashboard directly from disk and compare the result with the previous exercise.

## Exercise validation

Check that:

- `AGENTS.md` exists;
- the agent validates quality before presenting conclusions;
- the KPIs are business-oriented;
- the dashboard remains an independent HTML file;
- no external dependencies were added without authorization.

> We have not used Plan mode yet. Up to this point, we have worked directly with Ask and Agent.

---

Continue to [Exercise 3 — Skills, MCP, Instructions, Planning, and Implementation](exercise-03-skills-mcp-instructions.md).
