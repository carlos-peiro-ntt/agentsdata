# Exercise 3 — Skills, MCP, Planning, and Implementation

[← Back to README](../../README.md) · [← Exercise 2](exercise-02-agent-instructions.md)

## Objective

Add specialized knowledge, connect external sources, and complete the dashboard's planning, governance, implementation, and validation cycle.

## Part 1 — Install the skills

Run from the repository root. The commands are the same on all systems.

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/wshobson/agents --skill kpi-dashboard-design
```

When the installer asks:

1. select installation in the project;
2. select the agent used during the workshop;
3. review the skill's origin;
4. confirm the installation.

Check the result:

**Windows — PowerShell**

```powershell
Get-ChildItem .agents\skills -Recurse -Filter SKILL.md
Get-Content skills-lock.json
```

**macOS, Linux, or WSL — Bash/Zsh**

```bash
find .agents/skills -name SKILL.md -print
cat skills-lock.json
```

Skills used:

- `frontend-design`: visual design, interface, responsive behavior, and accessibility;
- `kpi-dashboard-design`: KPI selection, hierarchy, visualizations, and metric consistency.

## Part 2 — Configure the MCP servers

1. Create the `.vscode` folder:

**Windows — PowerShell**

```powershell
New-Item -ItemType Directory -Force .vscode
```

**macOS, Linux, or WSL — Bash/Zsh**

```bash
mkdir -p .vscode
```

2. Create `.vscode/mcp.json` with this content:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "supabase-access-token",
      "description": "Supabase Access Token para el curso",
      "password": true
    },
    {
      "type": "promptString",
      "id": "confluence-token",
      "description": "Confluence Bearer Token",
      "password": true
    }
  ],
  "servers": {
    "confluence": {
      "type": "stdio",
      "command": "uvx",
      "args": [
        "mcp-atlassian"
      ],
      "env": {
        "CONFLUENCE_URL": "https://umane.emeal.nttdata.com/confluence",
        "CONFLUENCE_PERSONAL_TOKEN": "${input:confluence-token}"
      }
    },
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=tnzlxngahrlnnmusxqpf&read_only=true&features=database",
      "headers": {
        "Authorization": "Bearer ${input:supabase-access-token}"
      }
    }
  }
}
```

3. Press `Ctrl+Shift+P`.
4. Run **MCP: List Servers**.
5. Start `confluence` and `supabase`.
6. Enter the tokens when VS Code requests them.
7. Do not replace `${input:...}` with real tokens in the file.

> **Troubleshooting (Windows):** if the `confluence` server fails to start, `uvx` is likely missing or not on `PATH`. Repeat [Install uv and uvx](../setup.md#07-install-uv-and-uvx), then close and reopen VS Code before starting the server again.

## Part 3 — Update `AGENTS.md`

The repository has evolved. Update its living document by sending this prompt in Agent mode:

```text
Review the repository and update AGENTS.md to reflect the current agent ecosystem.

The repository now includes additional agent skills and MCP servers.

Update AGENTS.md so it:

- Preserves the existing business context and project guidance.
- Documents the available skills and when they should be used.
- Documents the available MCP servers and the capabilities they provide.
- References the location of these resources in the repository.
- Explains when an agent should prefer using a skill versus an MCP.
- Avoids duplicating the documentation already contained in the skills or MCP configuration.
- Keeps AGENTS.md as the main entry point for future agents working on this project.
```

Review the result before accepting it. `AGENTS.md` should act as the entry point and link to resources, not copy all their content.

```markdown
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
- Use an **MCP server** when you need external system capabilities the workspace cannot provide locally: publishing or updating Confluence pages, executing SQL against the project's Supabase instance, or other networked services defined in `.vscode/mcp.json`.
- Prefer skills for thinking, pattern selection, and small code edits; prefer MCPs for authoritative actions (publish, update, run queries) and for accessing remote data or services.

### Linking Out

- Skills (full docs): [.agents/skills/](.agents/skills/)
- MCP configuration: [.vscode/mcp.json](.vscode/mcp.json)
- Lockfile for skills: [skills-lock.json](skills-lock.json)

Keep `AGENTS.md` as the human-friendly overview and starting point; do not duplicate long how-to content that already exists in the `SKILL.md` files or the MCP configuration. If you add new skills or servers, update this file with a short summary and a link to the authoritative resource.
```

## Part 4 — Add the dashboard instruction

In this workshop, `AGENTS.md` remains the project entry point, while `.github/instructions/dashboard.instructions.md` is the single source of truth for the detailed dashboard governance requirements.

1. Run `/create-instruccion`.
2. Create `.github/instructions/dashboard.instructions.md` with the generated output.
3. Preserve the generated YAML front matter.
4. Keep the instruction authoritative for the current dashboard governance requirements. Do not reproduce its full content in `README.md` or `AGENTS.md`; link to and follow the instruction instead.

### Validation checklist

- `.github/instructions/dashboard.instructions.md` exists.
- Its generated YAML front matter is valid and preserved.
- Its `applyTo` pattern covers the intended dashboard, analysis, and documentation files.
- Its current requirements cover the configured Supabase data-source rules, privacy constraints, data-quality gate, and Confluence publishing constraints.
- `AGENTS.md` points to the instruction as the single source of truth while remaining the project entry point.

## Part 5 — Generate the plan

1. Select **Plan** mode.
2. Send:

```text
# Generate an Interactive HTML Sales Dashboard

Generate an interactive HTML sales dashboard for the business, reading data from Supabase through the configured MCP. Automatically document the report in Confluence using the corresponding MCP.

## Exercise Deliverables

- Update the current HTML dashboard {name}.html.
- Create a Confluence page documenting the dashboard.

## Required MCP Sources and Destinations

- Use the configured **Supabase MCP** in read-only mode.
- Read the required data from these tables in the `public` schema:
  - `fact_ventas`
  - `dim_articulos`
  - `dim_canal`
  - `dim_fecha`
  - `dim_usuarios`
  - `dim_promociones`
  - `fact_promociones_articulos`
- Inspect the table schemas and relationships before defining joins or calculating KPIs. Do not invent columns, relationships, or values.
- Use the configured **Confluence MCP** to create the documentation as a **child page of the existing page with ID `1430576442`**, space_key `IADEIADATAENGINEERS`. Do not create it at the Confluence root or under a different parent.
- Title the new child page using exactly this pattern: `{creator name} - Informe ventas`. If the creator name is not available from the repository or conversation, ask for it before implementation.
- The Confluence page must document the data sources and joins, KPI definitions, filters, data-quality findings, assumptions, and known limitations.

## Dashboard Technical Requirements

- Follow the installed skills and the repository instructions in `AGENTS.md`.

The output must be a **single self-contained HTML file**.

### Interactive Filters

All filters must update every KPI and chart simultaneously.

Include:
- **Date range**
  - Multi-select Year
  - Multi-select Month
- Sales channel
- User type (Registered / Guest)
- Applied promotion

## KPI Cards (5)

- **Total Sales — Revenue (€)**
- **Total Sales — Units**
- **Returns — Revenue (€)**
- **Returns — Units**
- **% of Sales from Registered Users**

## Charts

### Comparative Trend

- Multi-line chart
- One line per selected year
- X-axis: Months (1–12)

### Sales by Channel

- Donut chart

### Sales by Product Category

- Horizontal bar chart (Top 8)

### Sales by User Type

- Donut chart (Registered vs. Guest)

### Sales by Promotion

- Vertical bar chart

## Visual Design (Governed by the Skills)

- White background
- Clean, highly readable typography
- Corporate palette using blues, grays, and greens
- No fuchsia, magenta, or neon colors
- Fully responsive and center-aligned layout
- Titles, legends, and labels must be clearly readable
- Include a visible **Data Quality Status** banner in the dashboard.
```

## Part 6 — Validate the plan

Check that:

- `AGENTS.md` requires reading and following `.github/instructions/dashboard.instructions.md`;
- `.github/instructions/dashboard.instructions.md` contains the detailed privacy, data-quality, and Confluence rules;
- the prohibited personal fields are explicitly listed in `.github/instructions/dashboard.instructions.md`;
- every table must receive `PASS` or `FAIL`;
- a join that duplicates sales requires aborting;
- Confluence uses parent `1430576442`, space_key `IADEIADATAENGINEERS`, and title `{creator name} - Informe ventas`;
- the regenerated plan uses only `segmento_cliente`, `genero`, and `comunidad_autonoma` for the profile;
- the plan includes the comment justifying the exclusion of first and last names;
- the plan keeps `{name}.html` as a self-contained file;
- the plan updates Confluence with controls and limitations;
- the regenerated plan has not yet been implemented.

## Part 7 — Execute the plan

1. Return to **Agent** mode.
2. Check that the `supabase` and `confluence` MCP servers are still running.
3. Keep the reviewed plan available and send:

```text
Implement the approved revised plan now.

Follow every instruction in AGENTS.md and .github/instructions/dashboard.instructions.md, and use the configured skills and MCP servers. Apply the data-quality gate before generating any dashboard or Confluence output. If a required table fails validation or a join unexpectedly increases the sales row count, stop the implementation and report the failure and its limitations instead of producing misleading KPIs.

If all required checks pass:

- Update the standalone, self-contained dashboard file {name}.html.
- Use only anonymized user attributes and do not expose personal data anywhere in the HTML, JavaScript, visualizations, filters, tooltips, source examples, or documentation.
- Add the source-code comment required by .github/instructions/dashboard.instructions.md explaining why first and last names are excluded.
- Create the Confluence report as a child of page 1430576442, space_key IADEIADATAENGINEERS with the exact title `{creator name} - Informe ventas`.
- Document the source tables, joins, KPI definitions, PASS/FAIL results, filters, assumptions, data-quality findings, and known limitations.
- Validate the completed dashboard locally and report the files and external resources created or updated.
```

4. If the agent does not know the creator's name, provide it when requested. Do not allow it to invent the value.
5. Review queries, quality results, and tool-use requests before approving changes.
6. If any table receives `FAIL` or a join duplicates sales, stop the exercise and keep the error report. Do not ask the agent to skip the check to finish the dashboard.
7. If all checks receive `PASS`, verify that the agent updated `{name}.html` and created the Confluence page in the required location.

## Part 8 — Validate the implementation

Serve the repository from a local terminal.

**Windows — PowerShell**

```powershell
python -m http.server 8000
```

**macOS, Linux, or WSL — Bash/Zsh**

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/{name}.html` in the browser and check that:

- the five KPIs and five charts display without errors;
- all filters update KPIs and charts simultaneously;
- the **Data Quality Status** banner reflects the actual results;
- no personal data appears in the interface, tooltips, or source code;
- the design is responsive and remains easy to read;
- the browser console shows no loading, parsing, or JavaScript errors.

Then open the page created in Confluence and verify that:

- it is a child of page `1430576442`, space_key `IADEIADATAENGINEERS`;
- it uses exactly the title `{creator name} - Informe ventas`;
- it documents sources, joins, KPIs, filters, `PASS`/`FAIL` results, and limitations;
- it contains no personal data.

Stop the local server with `Ctrl+C` when finished.

## Final exercise validation

Check that:

- the implementation matches the reviewed plan, not the initial plan;
- all required tables have a `PASS` result before KPIs are calculated;
- no join unexpectedly increases the number of sales;
- `{name}.html` remains one self-contained file;
- the dashboard uses only anonymized user attributes;
- the code explains why first and last names are excluded;
- the Confluence page is under the required parent and has the required title;
- the dashboard works when served over HTTP and produces no console errors.

---

Continue to [Exercise 4 — From Plan to Specification with SDD](exercise-04-sdd.md).
