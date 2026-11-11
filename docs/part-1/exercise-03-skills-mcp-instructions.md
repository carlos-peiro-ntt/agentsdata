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
2. select the agent used during the workshop (**GitHub Copilot** or **Codex**; both read `.agents/skills/`);
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
	"mcpServers": {
		"confluence": {
			"type": "stdio",
			"command": "uvx",
			"args": [
				"mcp-atlassian"
			],
			"env": {
				"UV_DEFAULT_INDEX": "https://pypi.org/simple",
				"CONFLUENCE_URL": "https://umane.emeal.nttdata.com/confluence",
				"CONFLUENCE_PERSONAL_TOKEN": "${CONFLUENCE_PERSONAL_TOKEN}"
			},
			"tools": ["*"]
		},
		"supabase": {
			"type": "http",
			"url": "https://mcp.supabase.com/mcp?project_ref=tnzlxngahrlnnmusxqpf&read_only=true&features=database",
			"headers": {
				"Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
			},
			"tools": ["*"]
		}
	}
}
```

The workspace `.mcp.json` format does not prompt for secrets. Each `${NAME}` reference is replaced at startup with the environment variable `NAME` of the process that runs VS Code, so the tokens stay out of the file and out of Git.

Fully quit VS Code first (`Cmd+Q` on macOS; close every window on Windows), because it only reads variables when it starts. Then run the secrets script from your Downloads folder, passing your project folder. If you do not have it, download it from your browser: [setup-secrets.sh](https://github.com/carlos-peiro-ntt/agentsdata/releases/latest/download/setup-secrets.sh) (macOS, Linux, WSL) or [setup-secrets.ps1](https://github.com/carlos-peiro-ntt/agentsdata/releases/latest/download/setup-secrets.ps1) (Windows).

The script asks for the tokens shared by the instructor (the input is hidden) and opens VS Code in your project folder with the tokens in its environment. The project folder is the one from [Prepare your project folder](setup.md#010-prepare-your-project-folder), `agentsdata-workshop` in your home folder; if you named it differently, use your own path.

macOS/Linux:

```bash
bash ~/Downloads/setup-secrets.sh ~/agentsdata-workshop
```

WSL (the browser saves files to the Windows Downloads folder):

```bash
bash /mnt/c/Users/<windows-user>/Downloads/setup-secrets.sh ~/agentsdata-workshop
```

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Downloads\setup-secrets.ps1" -ProjectDir "$HOME\agentsdata-workshop"
```

If VS Code is still running, the script stops and asks you to quit it first.

The tokens are not saved anywhere: they exist only in that VS Code process. When you quit VS Code they are gone, so run the script again every time you reopen it. To rotate a token, quit VS Code and run the script again.

<details>
<summary>Manual alternative (without the script)</summary>

Provide the tokens in a terminal and start VS Code from that same terminal.

macOS/Linux:

```bash
export SUPABASE_ACCESS_TOKEN='<token>'
export CONFLUENCE_PERSONAL_TOKEN='<token>'
code .
```

Windows PowerShell (`Read-Host` keeps the token out of the shell history):

```powershell
$env:SUPABASE_ACCESS_TOKEN = Read-Host "Supabase token"
$env:CONFLUENCE_PERSONAL_TOKEN = Read-Host "Confluence token"
code .
```

</details>

<details>
<summary><strong>Codex</strong></summary>

Codex does not read `.mcp.json`. Skip the **MCP: Add Server...** steps and append these tables at the end of `.codex/config.toml`, after `sandbox_mode` and `approval_policy`:

```toml
[mcp_servers.confluence]
command = "uvx"
args = ["mcp-atlassian"]
env = { UV_DEFAULT_INDEX = "https://pypi.org/simple", CONFLUENCE_URL = "https://umane.emeal.nttdata.com/confluence" }
env_vars = ["CONFLUENCE_PERSONAL_TOKEN"]
startup_timeout_sec = 60

[mcp_servers.supabase]
url = "https://mcp.supabase.com/mcp?project_ref=tnzlxngahrlnnmusxqpf&read_only=true&features=database"
bearer_token_env_var = "SUPABASE_ACCESS_TOKEN"
```

`env_vars` and `bearer_token_env_var` take the token from the environment of the process that runs VS Code, so run the secrets script (or export the tokens and start VS Code) exactly as above. Codex starts both servers when a new conversation begins; there is no **MCP: List Servers** step.

</details>

Start the servers:

1. Open the Command Palette and run **MCP: List Servers**.
2. Start `confluence` and `supabase`.

> A server showing as **Running** does not mean its token is valid. Both servers only check the token when a tool is called, so a wrong or missing variable shows up as a `401` error on the first tool call. If that happens, fix the variable, fully quit VS Code, and run the secrets script again.
3. Do not write real tokens in `.mcp.json`.

> **Troubleshooting (Windows):** if the `confluence` server fails to start, `uvx` is likely missing or not on `PATH`. Repeat [Install uv and uvx](setup.md#06-install-uv-and-uvx), then close and reopen VS Code before starting the server again.

### Inspect the MCP tools

Each MCP server exposes a set of tools. Check which ones the agent can use before relying on them:

1. In the chat input, type `#`. The list shows every available tool, including the MCP tools grouped by server. Keep typing (for example `#supabase` or `#confluence`) to filter it.
2. Click the **Configure Tools** button (wrench icon) in the chat input and expand `confluence` and `supabase` to read each tool's description. Uncheck any tool you do not want the agent to use.
3. For logs or startup errors, run **MCP: List Servers**, select a server, and choose **Show Output**.
4. Selecting a tool from the `#` list adds an explicit reference to the prompt. Try a read-only call:

```text
Use #list_tables to list the tables in the public schema of Supabase. Do not modify anything.
```

The first call asks for approval; check that it returns the seven workshop tables. A `401` at this point means the token variable is wrong.

<details>
<summary><strong>Codex</strong></summary>

Codex has no `#` tool references. The Codex settings menu (gear icon) → **MCP settings** shows the configured servers. To list their tools, ask:

```text
List the tools you have from the supabase and confluence MCP servers, with a one-line description of each. Do not call them.
```

To force a specific tool, name it in the prompt: `Use the supabase list_tables tool to list the tables in the public schema. Do not modify anything.`

</details>

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
   falling back to CSV, sample, or invented data; embed the validated
   data so the dashboard opens directly from disk, and never start a
   local web server (for example python -m http.server).

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

<details>
<summary><strong>Codex</strong></summary>

Codex has no `/create-instructions` command, does not read `.github/instructions/`, and has no `applyTo` scoping: it only loads `AGENTS.md` files. So with Codex, skip the steps above and add the rules as a final section of `AGENTS.md`, without creating any instruction file.

Edit `AGENTS.md` and add the following block at the end, without changing the existing sections:

```markdown
## Dashboard Privacy and Data Governance

These rules are mandatory for every dashboard, analysis, and generated document in this project.

### Dashboard Data Source

- Do not use the `resources/` directory or any CSV file as a data source after the initial CSV learning exercise.
- Retrieve all data required by the dashboard from the configured Supabase MCP in read-only mode.
- Inspect and validate the Supabase schemas and tables before downloading data, calculating KPIs, or embedding a validated snapshot in the self-contained HTML dashboard.
- Never include Supabase credentials or a runtime database connection in the generated HTML.
- If the Supabase MCP is unavailable or the required data cannot be retrieved, stop and report the limitation. Do not fall back to CSV files, sample data, or invented values.
- Embed the validated data so the dashboard opens directly from disk. Never start a local web server (for example `python -m http.server`) to serve or preview it.

### Privacy and GDPR

- Never display or expose first name, last name, email address, date of birth, postal code, or any field that can identify a natural person.
- This prohibition applies to charts, KPIs, tooltips, labels, legends, filters, tables, embedded HTML or JavaScript data, source-code examples, and Confluence documentation.
- User-profile analysis may use only anonymized attributes such as `segmento_cliente`, `genero`, and `comunidad_autonoma`.
- Document in the dashboard source code why first and last names are intentionally excluded from the analysis.

### Data-Quality Gate

- Validate every required source table separately before generating dashboard or documentation output.
- Record a clear `PASS` or `FAIL` result for every table.
- Check join cardinality by comparing row counts before and after each join.
- Abort generation if a join unexpectedly increases the row count or duplicates sales records.
- Report failed checks and limitations instead of producing potentially misleading KPIs.

### Confluence Publishing

- Always create dashboard documentation as a child page of Confluence page ID `1430576442`, using space key `IADEIADATAENGINEERS`.
- Use exactly this title pattern: `{creator name} - Informe ventas`.
- Never create the report at the Confluence root or under another parent page.
```

From here on, wherever this guide mentions `.github/instructions/dashboard.instructions.md`, read it as the **Dashboard Privacy and Data Governance** section of `AGENTS.md`.

Check that Codex follows it. Start a new conversation and send `Summarize the dashboard rules you must follow`; it must list the four areas. Then send `Add a table with customer emails to the dashboard`; it must refuse.

</details>

### Validation checklist

- `.github/instructions/dashboard.instructions.md` exists (Codex: `AGENTS.md` has the **Dashboard Privacy and Data Governance** section and no instruction file was created).
- Its generated YAML front matter is valid and preserved (Codex: not applicable).
- Its `applyTo` pattern covers the intended dashboard, analysis, and documentation files (Codex: not applicable; `AGENTS.md` always applies).
- Its current requirements cover the configured Supabase data-source rules (including opening the dashboard from disk without a local server), privacy constraints, data-quality gate, and Confluence publishing constraints.
- `AGENTS.md` does not duplicate the instruction's rules (Codex: the section lives in `AGENTS.md` by design).

## Part 4 — Generate the plan

1. Select **Plan** mode. Plan mode cannot call MCP servers, so the prompt asks the plan to defer every schema-dependent decision to a discovery phase at the start of the implementation.

<details>
<summary><strong>Codex</strong></summary>

Codex has no Plan mode in the composer. Start the prompt below with `Plan only. Do not modify files or call MCP tools yet.` so it behaves like Plan mode, and reject any approval request it raises.

</details>

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

The output must be a **single self-contained HTML file** with the validated data embedded, so it opens directly from disk. Do not start a local web server to serve or preview it.

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
```

Note: in plan mode you can click on `Start Implementation` instead. Because the reviewed plan already begins with the discovery phase, the agent follows the same order; check that its first actions are Supabase queries, not file edits. With Codex, send the same prompt in the same conversation; it asks for approval before each MCP tool call.

4. If the agent does not know the creator's name, provide it when requested. Do not allow it to invent the value.
5. Review queries, quality results, and tool-use requests before approving changes.
6. If any table receives `FAIL` or a join duplicates sales, stop the exercise and keep the error report. Do not ask the agent to skip the check to finish the dashboard.
7. If all checks receive `PASS`, verify that the agent updated `{name}.html` and created the Confluence page in the required location.

## Part 7 — Validate the implementation

Open `{name}.html` directly in the browser (double-click it or drag it into a browser window; do not start a local server) and check that:

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
- the dashboard opens directly from disk, without a local server, and produces no console errors.

---

Continue to [Exercise 4 — Propose and Apply a Change with OpenSpec](exercise-04-openspec-propose-apply.md).
