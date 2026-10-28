# Exercise 3 — Skills, MCP, Instructions, Planning, and Implementation

[← Back to README](../../README.md) · [← Exercise 2](exercise-02-agents-md.md)

## Objective

Add specialized knowledge, connect external sources, and complete the dashboard's planning, governance, implementation, and validation cycle.

## Part 1 — Install the skills

Open a terminal in VS Code (**Terminal → New Terminal**); it starts at the project folder. Run:

```bash
npx --registry=https://registry.npmjs.org/ skills add https://github.com/anthropics/skills --skill frontend-design
npx --registry=https://registry.npmjs.org/ skills add https://github.com/wshobson/agents --skill kpi-dashboard-design
```

When the installer asks:

1. select installation in the project;
2. select the agent used during the workshop;
3. review the skill's origin;
4. confirm the installation.

Check in the VS Code Explorer that `.agents/skills/frontend-design/SKILL.md`, `.agents/skills/kpi-dashboard-design/SKILL.md`, and `skills-lock.json` exist.

Skills used:

- `frontend-design`: visual design, interface, responsive behavior, and accessibility;
- `kpi-dashboard-design`: KPI selection, hierarchy, visualizations, and metric consistency.

## Part 2 — Configure the MCP servers

First let VS Code create the MCP configuration file with a placeholder server:

1. Open the Command Palette (`Ctrl+Shift+P` on Windows/Linux, `⇧⌘P` on macOS).
2. Run **MCP: Add Server...**.
3. Select **Command (stdio)**.
4. Enter `echo` as the command. It is only a placeholder.
5. Enter `dummy` as the server ID.
6. Select **Workspace** so the configuration is saved in the project folder.

VS Code creates and opens `.mcp.json` with the `dummy` server.

Replace the whole content of `.mcp.json` with:

```json
{
	"inputs": [
		{
			"type": "promptString",
			"id": "supabase-access-token",
			"description": "Supabase access token for the course",
			"password": true
		},
		{
			"type": "promptString",
			"id": "confluence-token",
			"description": "Confluence Bearer Token",
			"password": true
		}
	],
	"mcpServers": {
		"confluence": {
			"type": "stdio",
			"command": "uvx",
			"args": [
				"mcp-atlassian==0.21.1"
			],
			"env": {
				"UV_DEFAULT_INDEX": "https://pypi.org/simple",
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

The `inputs` section declares the secrets the servers need. Each `${input:<id>}` reference is replaced at startup by the value of the input with that `id`: VS Code prompts for it the first time a server starts, hides it because of `"password": true`, and stores it securely outside the repository. This keeps the tokens out of the file and out of Git.

Start the servers:

1. Open the Command Palette and run **MCP: List Servers**.
2. Start `confluence` and `supabase`.
3. Enter the tokens provided by the instructor when VS Code requests them.
4. Do not replace `${input:...}` with real tokens in the file.

> **Troubleshooting (Windows):** if the `confluence` server fails to start, `uvx` is likely missing or not on `PATH`. Repeat [Install uv and uvx](../setup.md#07-install-uv-and-uvx), then close and reopen VS Code before starting the server again.

## Part 3 — Add the dashboard instruction

In this workshop, `AGENTS.md` remains the project entry point, while `.github/instructions/dashboard.instructions.md` is the single source of truth for the detailed dashboard governance requirements.

1. Run `/create-instructions` and send it this request:

```text
/create-instructions

Create a workspace instruction file for this project.

Name: Dashboard Privacy and Data Governance
Scope: workspace (.github/instructions/)
Filename: dashboard.instructions.md

Description for discovery (use-when style):
"Use when creating or modifying the sales dashboard, calculating KPIs,
querying dashboard data, handling user attributes, or publishing
dashboard documentation."

applyTo: ["**/*.html", "**/*.js", "**/*.md"]

Body content — mandatory rules for every dashboard, analysis, and
generated document in this project:

1. Dashboard Data Source: Supabase MCP read-only is the only source;
   no CSV/resources/ after the learning exercise; validate schemas
   and tables before use; never embed credentials or a live DB
   connection; stop and report if Supabase is unavailable instead of
   falling back to CSV, sample, or invented data.

2. Privacy and GDPR: never expose first/last name, email, date of
   birth, postal code, or other identifying fields anywhere (charts,
   KPIs, tooltips, labels, filters, tables, embedded JS data, source
   examples, Confluence docs); user-profile analysis limited to
   segmento_cliente, genero, comunidad_autonoma; document in source
   code why names are excluded.

3. Data-Quality Gate: validate each required table separately with a
   PASS/FAIL result; check join cardinality before/after each join;
   abort if a join duplicates sales or inflates row count; report
   failures instead of producing misleading KPIs.

4. Confluence Publishing: create documentation only as a child of
   page ID 1430576442, space key IADEIADATAENGINEERS, with title
   exactly "{creator name} - Informe ventas"; never publish at root
   or under another parent.
```

2. Create `.github/instructions/dashboard.instructions.md` with the generated output.
3. Preserve the generated YAML front matter.
4. Do not copy its content into `README.md` or `AGENTS.md`. Copilot applies the instruction automatically to every file that matches its `applyTo` pattern, so `AGENTS.md` keeps the general project rules and the instruction keeps the dashboard-specific ones.

### Validation checklist

- `.github/instructions/dashboard.instructions.md` exists.
- Its generated YAML front matter is valid and preserved.
- Its `applyTo` pattern covers the intended dashboard, analysis, and documentation files.
- Its current requirements cover the configured Supabase data-source rules, privacy constraints, data-quality gate, and Confluence publishing constraints.
- `AGENTS.md` does not duplicate the instruction's rules.

## Part 4 — Generate the plan

1. Select **Plan** mode. Plan mode cannot call MCP servers, so the prompt asks the plan to defer every schema-dependent decision to a discovery phase at the start of the implementation.
2. Send:

```text
# Generate an Interactive HTML Sales Dashboard

Generate an interactive HTML sales dashboard for the business, reading data from Supabase through the configured MCP. Automatically document the report in Confluence using the corresponding MCP.

## Planning Constraints

- You cannot access the MCP servers while planning. Do not assume table schemas, columns, relationships, or values.
- Make the first implementation phase a **discovery phase** using the Supabase MCP: inspect the schemas, relationships, and row counts of the required tables and run the data-quality gate. Only after that, define joins and KPI calculations.
- Mark every decision that depends on discovery as pending (joins, column mappings for returns, registered vs. guest users, and promotions).
- If discovery contradicts the plan, the implementation must stop and report the differences before writing code.
- Before creating the Confluence page, the implementation must confirm that its parent page exists.

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
- Use the configured **Confluence MCP** to create the documentation page. If the creator name needed for the page title is not available from the project or conversation, ask for it before implementation.
- The Confluence page must document the data sources and joins, KPI definitions, filters, data-quality findings, assumptions, and known limitations.

## Dashboard Technical Requirements

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

## Part 5 — Validate the plan

Check that:

- the plan starts the implementation with a Supabase discovery phase and the data-quality gate;
- the plan does not invent columns or joins, and marks discovery-dependent decisions as pending;
- the plan stops the implementation if discovery contradicts it;
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

## Part 6 — Execute the plan

1. Return to **Agent** mode.
2. Check that the `supabase` and `confluence` MCP servers are still running.
3. Keep the reviewed plan available and send:

```text
Implement the approved plan.

Start with the discovery phase: use the Supabase MCP to inspect the schemas, relationships, and row counts of the required tables, and run the data-quality gate before writing any code. Resolve the pending decisions from the plan with what you find. If the actual schema contradicts the plan, stop and report the differences before continuing.
```

Note: in plan mode you can click on `Start Implementation` instead. Because the reviewed plan already begins with the discovery phase, the agent follows the same order; check that its first actions are Supabase queries, not file edits.

4. If the agent does not know the creator's name, provide it when requested. Do not allow it to invent the value.
5. Review queries, quality results, and tool-use requests before approving changes.
6. If any table receives `FAIL` or a join duplicates sales, stop the exercise and keep the error report. Do not ask the agent to skip the check to finish the dashboard.
7. If all checks receive `PASS`, verify that the agent updated `{name}.html` and created the Confluence page in the required location.

## Part 7 — Validate the implementation

Open `{name}.html` in the browser the way the agent indicates and check that:

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

## Final exercise validation

Check that:

- the implementation matches the reviewed plan, not the initial plan;
- the discovery phase ran before any code was written, and pending decisions were resolved from the actual schema;
- all required tables have a `PASS` result before KPIs are calculated;
- no join unexpectedly increases the number of sales;
- `{name}.html` remains one self-contained file;
- the dashboard uses only anonymized user attributes;
- the code explains why first and last names are excluded;
- the Confluence page is under the required parent and has the required title;
- the dashboard opens in the browser and produces no console errors.

---

Continue to [Exercise 4 — Propose and Apply a Change with OpenSpec](exercise-04-openspec-propose-apply.md).
