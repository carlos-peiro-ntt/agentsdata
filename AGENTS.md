# AGENTS.md

## Project Overview

This repository contains a standalone retail sales dashboard in html that loads data from the Supabase MCP. The main goal is to build and iterate on a business-facing sales dashboard without introducing unnecessary dependencies.

## Business Context

This project is a retail sales analytics dashboard for business users.

The primary goal is to help business stakeholders understand sales performance through reliable KPIs, interactive visualizations, and actionable insights.

## Agent Guidance

When working on this project:

- Prioritize business insights over visual complexity.
- Validate data quality before calculating or presenting KPIs.
- Clearly identify the Supabase tables used for each metric.
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

## Local Validation

- For browser-only changes, validate by serving the repo with a local HTTP server and opening the dashboard in a browser.
- If JavaScript is edited, check the browser console for snapshot loading, parsing, or rendering errors.
- There are no project build or test scripts in this repository by default.

## Agent Ecosystem

This repository includes lightweight agent **skills** for design and dashboard guidance, plus configured **MCP servers** that provide external capabilities. Use this page as the single entry point when deciding how an agent should act on the project.

### Available Skills

- **frontend-design**: Visual and interaction design guidance for distinctive UIs. See [.agents/skills/frontend-design/SKILL.md](.agents/skills/frontend-design/SKILL.md) for full instructions and examples. Use this skill when making aesthetic, typographic, or layout decisions for HTML/CSS/JS changes.
- **kpi-dashboard-design**: Patterns and best practices for selecting KPIs, layout, and metric governance. See [.agents/skills/kpi-dashboard-design/SKILL.md](.agents/skills/kpi-dashboard-design/SKILL.md) for details. Use this skill when choosing metrics, designing dashboard cards, or documenting calculation methodology.

Notes:
- The skills contain the canonical, detailed guidance — prefer reading the related `SKILL.md` before applying design or KPI changes.
- A skills list and locks are available in `skills-lock.json` at the repository root.

### Configured MCP Servers

The repository configures the following MCP servers in `.vscode/mcp.json`:

- **confluence** (Atlassian MCP server): provides Confluence access for creating/updating documentation and pages. Configuration and credentials are in [.vscode/mcp.json](.vscode/mcp.json).
- **supabase** (Supabase MCP endpoint): provides read-only database capabilities (project-specific) for querying data and inspecting schemas. See [.vscode/mcp.json](.vscode/mcp.json) for the configured endpoints and auth inputs.

Notes:
- The `.vscode/mcp.json` file contains the authoritative server connection settings and input prompts; do not duplicate those details here — follow the MCP configuration when using servers.

### When to Use a Skill vs an MCP

- Use a **skill** when the task is domain knowledge or pattern-based and can be satisfied by local guidance (design choices, KPI selection, dashboard UX, writing copy, small code examples). Skills hold curated best-practices and should be the first stop for project-specific guidance.
- Use an **MCP server** when you need external system capabilities the workspace can't provide locally: publishing or updating Confluence pages, executing SQL against the project's Supabase instance, or other networked services defined in `.vscode/mcp.json`.
- Prefer skills for thinking, pattern selection, and small code edits; prefer MCPs for authoritative actions (publish, update, run queries) and for accessing remote data or services.

### Linking Out

- Skills (full docs): [.agents/skills/](.agents/skills/)
- MCP configuration: [.vscode/mcp.json](.vscode/mcp.json)
- Lockfile for skills: [skills-lock.json](skills-lock.json)

Keep `AGENTS.md` as the human-friendly overview and starting point; do not duplicate long how-to content that already exists in the `SKILL.md` files or the MCP configuration. If you add new skills or servers, update this file with a short summary and a link to the authoritative resource.

## Mandatory Dashboard Rules

All dashboard, analysis, and documentation work must follow [rules/dashboard.md](rules/dashboard.md). Read that file completely before generating or modifying any dashboard output.

Non-negotiable constraints:

- Use the configured Supabase MCP in read-only mode as the only data source; never use CSVs, sample data, or invented values.
- Never expose personal or identifying information.
- Apply the required table-level data-quality checks and join-cardinality gate before calculating KPIs.
- Follow the required Confluence parent page, space, and title pattern.
- Stop and report the limitation if data retrieval or validation fails.
