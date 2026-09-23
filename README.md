# Guía paso a paso — Dashboard de ventas con agentes

Este repositorio es el punto de partida de un taller práctico. Al clonarlo solo tendrás esta guía: el dashboard, los datos, las instrucciones del agente y las integraciones se crearán progresivamente durante los ejercicios.

El objetivo es partir de cero e iterar sobre un dashboard sencillo de negocio para entender la diferencia entre:

- pedir una solución con un prompt;
- aportar datos reales;
- definir instrucciones persistentes en `AGENTS.md`;
- añadir skills especializadas;
- conectar herramientas externas mediante MCP;
- planificar y ejecutar una entrega completa.

> La guía muestra comandos para **Windows 10/11 con PowerShell** y para **WSL, Linux y macOS con Bash/Zsh**. Los comandos de Linux asumen una distribución basada en Ubuntu/Debian.

---

## 0. Instalación previa

### 0.1 Requisitos

Antes del taller necesitas:

- acceso a Internet;
- permisos para instalar aplicaciones;
- una cuenta de GitHub con acceso al repositorio;
- acceso a GitHub Copilot o al agente de desarrollo que se utilizará;
- el token de Supabase facilitado para el curso;
- el token de Confluence facilitado para el curso.

Los tokens son secretos. No los pegues en el chat, no los guardes en archivos del repositorio y no los incluyas en commits o capturas.

### 0.2 Abrir una terminal

#### Windows — PowerShell

Abre **Inicio**, busca **PowerShell** y ejecuta:

```powershell
winget --version
```

Si `winget` no está disponible, instala o actualiza **App Installer** desde Microsoft Store.

Si quieres trabajar con WSL, abre PowerShell como administrador e instala Ubuntu:

```powershell
wsl --install
wsl --status
```

Reinicia Windows cuando se solicite y abre **Ubuntu** desde Inicio.

#### macOS — Terminal

Abre **Terminal** y comprueba que Homebrew está instalado:

```bash
brew --version
```

Si no está disponible, instálalo siguiendo las instrucciones de [brew.sh](https://brew.sh/).

#### Linux o WSL — Bash

Abre una terminal y comprueba el sistema:

```bash
uname -a
cat /etc/os-release
```

### 0.3 Instalar Git

**Windows — PowerShell**

```powershell
winget install --id Git.Git -e --source winget
```

**macOS — Terminal**

```bash
brew install git
```

**Linux o WSL — Bash**

```bash
sudo apt update
sudo apt install -y git
```

Cierra y abre la terminal de nuevo. Comprueba la instalación en cualquier sistema:

```bash
git --version
```

### 0.4 Instalar Visual Studio Code

**Windows — PowerShell**

```powershell
winget install --id Microsoft.VisualStudioCode -e
```

**macOS — Terminal**

```bash
brew install --cask visual-studio-code
```

**Linux — Ubuntu/Debian**

```bash
sudo snap install --classic code
```

En **WSL**, instala VS Code en Windows y añade la extensión **WSL** de Microsoft; no instales otra copia dentro de la distribución.

Reinicia la terminal y comprueba en cualquier sistema:

```bash
code --version
```

### 0.5 Instalar Python

Python se utilizará para servir el dashboard en local.

**Windows — PowerShell**

```powershell
winget install 9NQ7512CXL7T
```

Cierra y abre PowerShell. Después ejecuta:

```powershell
py install 3.12
py -3.12 --version
```

**macOS — Terminal**

```bash
brew install python@3.12
python3 --version
```

**Linux o WSL — Bash**

```bash
sudo apt update
sudo apt install -y python3 python3-pip
python3 --version
```

### 0.6 Instalar Node.js, npm y npx

`npx` se utilizará para instalar skills.

**Windows — PowerShell**

```powershell
winget install --id OpenJS.NodeJS.LTS -e
```

**macOS — Terminal**

```bash
brew install node
```

**Linux o WSL — Bash**

```bash
sudo apt update
sudo apt install -y nodejs npm
```

Reinicia la terminal y valida en cualquier sistema:

```bash
node --version
npm --version
npx --version
```

### 0.7 Instalar uv y uvx

`uvx` se utilizará para ejecutar el MCP de Confluence.

**Windows — PowerShell**

1. Ejecuta en la terminal:

   ```console
   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

2. Añade temporalmente `uv` y `uvx` al `PATH` de la sesión actual:

   ```console
   $env:Path = "$HOME\.local\bin;$env:Path"
   ```

3. Comprueba que `uvx` está disponible:

   ```console
   uvx mcp-atlassian --help
   ```

4. Cierra y vuelve a abrir Visual Studio Code para aplicar la instalación en una nueva sesión.

### 0.8 Instalar las extensiones de VS Code

1. Abre Visual Studio Code.
2. Pulsa `Ctrl+Shift+X` en Windows/Linux o `⇧⌘X` en macOS.
3. Busca e instala **GitHub Copilot**.
4. Inicia sesión con tu cuenta de GitHub.
5. Opcionalmente, instala **Codex – OpenAI's coding agent**.
6. Abre el chat y comprueba que puedes enviar mensajes.

### 0.9 Comprobación final

**Windows — PowerShell**

```powershell
git --version
code --version
py --version
node --version
npx --version
uvx --version
```

**macOS, Linux o WSL — Bash/Zsh**

```bash
git --version
code --version
python3 --version
node --version
npx --version
uvx --version
```

No continúes hasta que todos los comandos respondan sin errores.

---

## 1. Preparar el taller

### 1.1 Clonar el repositorio

**Windows — PowerShell**

```powershell
cd $HOME\Documents
git clone https://github.com/carlos-peiro-ntt/agentsdata.git
cd agentsdata
code .
```

**macOS, Linux o WSL — Bash/Zsh**

```bash
cd ~/Documents
git clone https://github.com/carlos-peiro-ntt/agentsdata.git
cd agentsdata
code .
```

Si `~/Documents` no existe, clona el repositorio desde cualquier carpeta de trabajo disponible.

### 1.2 Confirmar el punto de partida

Abre la terminal integrada de VS Code.

**Windows — PowerShell**

```powershell
git status
Get-ChildItem -Force
```

**macOS, Linux o WSL — Bash/Zsh**

```bash
git status
ls -la
```

El repositorio parte sin una aplicación implementada. Esta guía será el hilo conductor para crear todos los archivos durante los ejercicios.

---

## 2. Ejercicio 1 — Crear el primer dashboard

### Objetivo

Comparar el resultado de un prompt sin contexto con el resultado obtenido cuando el agente dispone de datos reales.

### Parte 1 — Generación sin datos

1. Abre el chat de VS Code.
2. Selecciona el modo **Ask**.
3. Envía:

```text
Genera un dashboard de ventas en HTML para negocio.
```

4. Revisa la respuesta del agente.
5. Si propone crear archivos, revisa los cambios antes de aceptarlos.
6. Comprueba qué información ha tenido que inventar al no disponer de datos.

#### Puntos para comentar

- Ask continúa siendo un modo basado en agentes, pero dispone de acciones más restringidas.
- Sin datos, la generación es rápida, pero los valores y KPIs pueden ser ficticios.
- Codex y OpenCode no siempre exponen un modo llamado **Ask**. En ese caso, pide explícitamente: `Analiza y propón una solución sin modificar archivos`.

### Parte 2 — Incorporar los CSV

1. Recibe del formador la carpeta `resources` con los CSV del ejercicio.
2. Copia la carpeta en la raíz del repositorio.
3. Comprueba que los archivos están disponibles:

**Windows — PowerShell**

```powershell
Get-ChildItem .\resources
```

**macOS, Linux o WSL — Bash/Zsh**

```bash
ls -la ./resources
```

4. Vuelve al chat y envía:

```text
Genera un dashboard de ventas en HTML para negocio con los archivos CSV cargados en la carpeta resources.
```

5. Revisa qué archivos quiere leer y modificar el agente.
6. Acepta los cambios cuando hayas comprobado que utiliza los CSV.
7. Sirve el dashboard:

**Windows — PowerShell**

```powershell
py -m http.server 8000
```

**macOS, Linux o WSL — Bash/Zsh**

```bash
python3 -m http.server 8000
```

8. Abre `http://localhost:8000/{name}.html`.
9. Detén el servidor con `Ctrl+C` al terminar.

### Validación del ejercicio

Comprueba que:

- se ha creado `{name}.html`;
- los datos proceden de `resources`;
- el dashboard carga mediante HTTP;
- no se muestran datos personales;
- los KPIs no son valores escritos manualmente.

---

## 3. Ejercicio 2 — De prompt a instrucciones persistentes

### Objetivo

Crear `AGENTS.md` como manual de instrucciones del proyecto y comprobar cómo cambia el comportamiento del agente.

> `AGENTS.md` no es un agente. Es un documento vivo que proporciona contexto, reglas y convenciones a los agentes que trabajan en el repositorio.

Nombres habituales según la herramienta:

- Codex, Copilot y OpenCode: `AGENTS.md`.
- Claude: `CLAUDE.md`.

### Parte 1 — Crear `AGENTS.md`

1. Cambia al modo **Agent**.
2. Ejecuta:

```text
/init
```

3. Abre el `AGENTS.md` generado.
4. Revisa qué conocimiento ha extraído del repositorio.

`/init` puede utilizarse de dos formas:

- en un repositorio vacío, para establecer las reglas iniciales;
- en un repositorio con contenido, para capturar conocimiento implícito de su estructura y código.

### Parte 2 — Añadir el contexto de negocio

Edita `AGENTS.md` e incorpora el siguiente contenido, adaptándolo sin duplicar secciones existentes:

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

### Parte 3 — Mejorar el dashboard

1. Guarda `AGENTS.md`.
2. Mantén seleccionado el modo **Agent**.
3. Envía:

```text
Mejora este dashboard.
```

4. Revisa si el agente aplica automáticamente las reglas de `AGENTS.md`.
5. Abre de nuevo el dashboard y compara el resultado con el ejercicio anterior.

### Validación del ejercicio

Comprueba que:

- existe `AGENTS.md`;
- el agente valida la calidad antes de presentar conclusiones;
- los KPIs se orientan a negocio;
- el dashboard sigue siendo un HTML independiente;
- no se han añadido dependencias externas sin autorización.

> Todavía no hemos usado el modo Plan. Hasta este punto hemos trabajado directamente con Ask y Agent.

---

## 4. Ejercicio 3 — Skills, MCP, planificación e implementación

### Objetivo

Añadir conocimiento especializado, conectar fuentes externas y recorrer el ciclo completo de planificación, gobierno, implementación y validación del dashboard.

### Parte 1 — Instalar las skills

Ejecuta desde la raíz del repositorio. Los comandos son iguales en todos los sistemas.

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/wshobson/agents --skill kpi-dashboard-design
```

Cuando el instalador pregunte:

1. selecciona instalación en el proyecto;
2. selecciona el agente utilizado durante el taller;
3. revisa el origen de la skill;
4. confirma la instalación.

Comprueba el resultado:

**Windows — PowerShell**

```powershell
Get-ChildItem .agents\skills -Recurse -Filter SKILL.md
Get-Content skills-lock.json
```

**macOS, Linux o WSL — Bash/Zsh**

```bash
find .agents/skills -name SKILL.md -print
cat skills-lock.json
```

Skills utilizadas:

- `frontend-design`: diseño visual, interfaz, responsive y accesibilidad;
- `kpi-dashboard-design`: selección de KPIs, jerarquía, visualizaciones y consistencia de métricas.

### Parte 2 — Configurar los MCP

1. Crea la carpeta `.vscode`:

**Windows — PowerShell**

```powershell
New-Item -ItemType Directory -Force .vscode
```

**macOS, Linux o WSL — Bash/Zsh**

```bash
mkdir -p .vscode
```

2. Crea `.vscode/mcp.json` con este contenido:

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

3. Pulsa `Ctrl+Shift+P`.
4. Ejecuta **MCP: List Servers**.
5. Inicia `confluence` y `supabase`.
6. Introduce los tokens cuando VS Code los solicite.
7. No sustituyas `${input:...}` por tokens reales en el archivo.

### Parte 3 — Actualizar `AGENTS.md`

El repositorio ha evolucionado. Actualiza su documento vivo enviando este prompt en modo Agent:

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

Revisa el resultado antes de aceptarlo. `AGENTS.md` debe actuar como punto de entrada y enlazar los recursos, no copiar todo su contenido.

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
- Use an **MCP server** when you need external system capabilities the workspace can't provide locally: publishing or updating Confluence pages, executing SQL against the project's Supabase instance, or other networked services defined in `.vscode/mcp.json`.
- Prefer skills for thinking, pattern selection, and small code edits; prefer MCPs for authoritative actions (publish, update, run queries) and for accessing remote data or services.

### Linking Out

- Skills (full docs): [.agents/skills/](.agents/skills/)
- MCP configuration: [.vscode/mcp.json](.vscode/mcp.json)
- Lockfile for skills: [skills-lock.json](skills-lock.json)

Keep `AGENTS.md` as the human-friendly overview and starting point; do not duplicate long how-to content that already exists in the `SKILL.md` files or the MCP configuration. If you add new skills or servers, update this file with a short summary and a link to the authoritative resource.
```

### Parte 4 — Añadir las reglas del dashboard

> En este taller, `AGENTS.md` es el punto de entrada de instrucciones persistentes del proyecto. Las reglas detalladas del dashboard se mantienen en `rules/dashboard.md` para que sean reutilizables y fáciles de mantener.

1. Crea `rules/dashboard.md` e incorpora este contenido:

```markdown
# Dashboard Privacy and Data Governance

These rules are mandatory for every dashboard, analysis, and generated document.

## Dashboard Data Source

- Do not use the `resources/` directory or any CSV file as a data source. Those files are no longer available at this stage of the workshop.
- Retrieve all data required by the dashboard from the configured Supabase MCP in read-only mode.
- Inspect and validate the Supabase schemas and tables before downloading the required data and embedding the validated snapshot in the self-contained HTML dashboard.
- Never include Supabase credentials or a runtime database connection in the generated HTML.
- If the Supabase MCP is unavailable or the required data cannot be retrieved, stop and report the limitation. Do not fall back to CSV files, sample data, or invented values.

## Privacy and GDPR

- Never display or expose first name, last name, email address, date of birth, postal code, or any field that can identify a natural person.
- This prohibition applies to charts, KPIs, tooltips, labels, legends, filters, tables, embedded HTML/JavaScript data, source-code examples, and Confluence documentation.
- User-profile analysis may use only anonymized attributes such as `segmento_cliente`, `genero`, and `comunidad_autonoma`.
- Document in the dashboard source code why first and last names are intentionally excluded from the analysis.

## Data-Quality Gate

- Validate every required source table separately before generating dashboard or documentation output.
- Record a clear `PASS` or `FAIL` result for every table.
- Check join cardinality by comparing row counts before and after each join.
- Abort generation if a join unexpectedly increases the row count or duplicates sales records.
- Report failed checks and limitations instead of producing potentially misleading KPIs.

## Confluence Publishing

- Always create dashboard documentation as a child page of Confluence page ID `1430576442`, space_key `IADEIADATAENGINEERS`.
- Use exactly this title pattern: `{creator name} - Informe ventas`.
- Never create the report at the Confluence root or under another parent page.
```

2. Añade a `AGENTS.md` una referencia obligatoria y un resumen de las restricciones no negociables:

```markdown
## Mandatory Dashboard Rules

All dashboard, analysis, and documentation work must follow [rules/dashboard.md](rules/dashboard.md). Read that file completely before generating or modifying any dashboard output.

Non-negotiable constraints:

- Use the configured Supabase MCP in read-only mode as the only data source; never use CSVs, sample data, or invented values.
- Never expose personal or identifying information.
- Apply the required table-level data-quality checks and join-cardinality gate before calculating KPIs.
- Follow the required Confluence parent page, space, and title pattern.
- Stop and report the limitation if data retrieval or validation fails.
```

### Parte 5 — Generar el plan

1. Modo **Plan**.
2. Envía:

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

### Parte 6 — Validar el plan

Comprueba que:

- `AGENTS.md` obliga a leer y seguir `rules/dashboard.md`;
- `rules/dashboard.md` contiene las reglas detalladas de privacidad, calidad y Confluence;
- los campos personales prohibidos están enumerados explícitamente en `rules/dashboard.md`;
- cada tabla debe obtener `PASS` o `FAIL`;
- un join que duplique ventas obliga a abortar;
- Confluence usa el padre `1430576442`, space_key `IADEIADATAENGINEERS` y el título `{creator name} - Informe ventas`;
- el plan regenerado usa solo `segmento_cliente`, `genero` y `comunidad_autonoma` para el perfil;
- el plan incluye el comentario que justifica excluir nombre y apellidos;
- el plan mantiene `{name}.html` como archivo autocontenido;
- el plan actualiza Confluence con controles y limitaciones;
- el plan regenerado todavía no se ha implementado.

### Parte 7 — Ejecutar el plan

1. Vuelve al modo **Agent**.
2. Comprueba que los MCP de `supabase` y `confluence` siguen iniciados.
3. Mantén disponible el plan revisado y envía:

```text
Implement the approved revised plan now.

Follow every instruction in AGENTS.md and rules/dashboard.md, and use the configured skills and MCP servers. Apply the data-quality gate before generating any dashboard or Confluence output. If a required table fails validation or a join unexpectedly increases the sales row count, stop the implementation and report the failure and its limitations instead of producing misleading KPIs.

If all required checks pass:

- Update the standalone, self-contained dashboard file {name}.html.
- Use only anonymized user attributes and do not expose personal data anywhere in the HTML, JavaScript, visualizations, filters, tooltips, source examples, or documentation.
- Add the source-code comment required by rules/dashboard.md explaining why first and last names are excluded.
- Create the Confluence report as a child of page 1430576442, space_key IADEIADATAENGINEERS with the exact title `{creator name} - Informe ventas`.
- Document the source tables, joins, KPI definitions, PASS/FAIL results, filters, assumptions, data-quality findings, and known limitations.
- Validate the completed dashboard locally and report the files and external resources created or updated.
```

4. Si el agente no conoce el nombre del creador, indícaselo cuando lo solicite. No permitas que invente ese valor.
5. Revisa las consultas, los resultados de calidad y las solicitudes de uso de herramientas antes de aprobar cambios.
6. Si alguna tabla obtiene `FAIL` o un join duplica ventas, detén el ejercicio y conserva el informe del error. No pidas al agente que omita el control para terminar el dashboard.
7. Si todos los controles obtienen `PASS`, revisa que el agente haya actualizado `{name}.html` y creado la página de Confluence en la ubicación requerida.

### Parte 8 — Validar la implementación

Sirve el repositorio desde una terminal local.

**Windows — PowerShell**

```powershell
python -m http.server 8000
```

**macOS, Linux o WSL — Bash/Zsh**

```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000/{name}.html` en el navegador y comprueba que:

- los cinco KPIs y los cinco gráficos se muestran sin errores;
- todos los filtros actualizan simultáneamente KPIs y gráficos;
- el banner de **Data Quality Status** refleja los resultados reales;
- no aparecen datos personales en la interfaz, tooltips ni código fuente;
- el diseño es responsive y mantiene una lectura clara;
- la consola del navegador no muestra errores de carga, parsing o JavaScript.

Después, abre la página creada en Confluence y verifica que:

- es hija de la página `1430576442`, space_key `IADEIADATAENGINEERS`;
- usa exactamente el título `{creator name} - Informe ventas`;
- documenta fuentes, joins, KPIs, filtros, resultados `PASS`/`FAIL` y limitaciones;
- no contiene datos personales.

Detén el servidor local con `Ctrl+C` cuando termines.

### Validación final del ejercicio

Comprueba que:

- la implementación corresponde al plan revisado, no al plan inicial;
- todas las tablas requeridas tienen un resultado `PASS` antes de calcular KPIs;
- ningún join aumenta inesperadamente el número de ventas;
- `{name}.html` sigue siendo un único archivo autocontenido;
- el dashboard utiliza únicamente atributos de usuario anonimizados;
- el código explica por qué se excluyen nombre y apellidos;
- la página de Confluence está bajo el padre y con el título obligatorios;
- el dashboard funciona al servirse por HTTP y no genera errores en la consola.

---

## 5. Ejercicio 4 — De plan a especificación con SDD

### Objetivo

Introducir **Specification-Driven Development (SDD)** para que una idea no pase directamente del plan a la implementación. La especificación aprobada se convierte en el contrato verificable entre ambos.

**Antes**

```text
Idea
  ↓
Plan
  ↓
Implementación
```

**Ahora**

```text
Idea
  ↓
Plan
  ↓
Spec
  ↓
Implementación
  ↓
Evaluación (Harness/Evals)
```

> En este ejercicio se trabajará únicamente hasta la aprobación de la spec. La implementación, el harness y los evals se incorporarán en el siguiente ejercicio.

### Parte 1 — Partir de una idea concreta

Usaremos la misma idea durante todo el flujo para que el foco esté en aprender SDD:

```text
Como responsable comercial, quiero que Total Sales compare las ventas del mes actual con las del mes anterior y muestre la variación en euros y en porcentaje.
```

Para que el resultado sea reproducible con datos históricos, en este ejercicio **mes actual** significa el último mes disponible dentro de la selección y **mes anterior** el mes natural inmediatamente anterior. El selector de fecha fija el mes de referencia; ambos periodos comparten los demás filtros de negocio. Si el mes anterior vale cero, el porcentaje se mostrará como `N/A` para evitar una división inválida.

### Parte 2 — Generar y revisar el plan

En modo **Plan**, envía este prompt breve:

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

Read AGENTS.md and rules/dashboard.md. Inspect the current dashboard
and do not invent data or fields.

Return only:
- affected area;
- calculation rules;
- edge cases;
- validation steps.
```

Comprueba que el plan no amplía el alcance. Todavía no se implementa nada.

### Parte 3 — Generar la spec

Pide al agente que convierta la idea y el plan en una spec pequeña:

```text
Create specs/dashboard-evolution.md from the agreed idea and plan.

Read AGENTS.md and rules/dashboard.md. Describe observable behavior,
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

### Parte 4 — Revisar y aprobar la spec

Revisa solo estas condiciones:

- aparecen las nueve secciones, una vez y en ese orden;
- existen exactamente cuatro requisitos y cuatro criterios, con relación uno a uno;
- las fórmulas y el caso `previous = 0` son verificables;
- no quedan `TBD`, preguntas bloqueantes ni conflictos con las reglas del repositorio.

Si la spec cumple la lista, cambia su estado de `Draft` a `Approved` y su versión de `0.1.0` a `1.0.0`. Este cambio debe ser explícito; no se considera aprobada solo porque exista el archivo.

### Resultado del ejercicio

El resultado es `specs/dashboard-evolution.md` en estado `Approved`, versión `1.0.0`, con nueve secciones, cuatro `REQ` y cuatro `AC`. La implementación comienza en el ejercicio siguiente.

---

## 6. Ejercicio 5 — Implementación guiada y Harness/Evals

### Objetivo

Implementar la spec aprobada y comprobar sus cuatro pares `REQ/AC` con un **harness** sencillo y reproducible.

El flujo completo queda así:

```text
Idea → Plan → Spec aprobada → Implementación → Harness
                                             ↓
                         FAIL → Corrección → Reintento → PASS
```

El harness será un único `evals/harness.html`, con HTML y JavaScript nativo. Cargará el dashboard desde el mismo servidor local y no usará paquetes ni servicios externos.

### Parte 1 — Traducir la spec a cuatro comprobaciones

Antes de implementar, identifica qué observará el harness:

| Eval | Contrato | Comprobación |
| --- | --- | --- |
| EVAL-001 | REQ-001 / AC-001 | Existe y es correcto el total del mes actual. |
| EVAL-002 | REQ-002 / AC-002 | Existe y es correcto el total del mes anterior. |
| EVAL-003 | REQ-003 / AC-003 | La diferencia en euros es `actual - anterior`. |
| EVAL-004 | REQ-004 / AC-004 | El porcentaje aplica la fórmula acordada o muestra `N/A` si el anterior es cero. |

No añadas más evals. Así se ve con claridad que el harness deriva de la spec y no de la implementación.

### Parte 2 — Implementar la spec aprobada

Vuelve al modo **Agent** y envía:

```text
Implement the approved specification in specs/dashboard-evolution.md.

Confirm first that:
- Status is Approved;
- Version is 1.0.0;
- there are no blocking TBD items.

Follow AGENTS.md and rules/dashboard.md.

Implement only REQ-001 through REQ-004 in the existing Total Sales card.
Use stable DOM identifiers for the four displayed values.

Preserve the self-contained dashboard.
Do not modify the approved spec.
Do not create the harness yet.

Report:
- implemented REQ identifiers;
- modified files;
- validation performed.
```

### Parte 3 — Crear el harness

Con la implementación disponible, envía:

```text
Create evals/harness.html using only HTML and JavaScript.

Read:
- specs/dashboard-evolution.md;
- the implemented dashboard;
- AGENTS.md;
- rules/dashboard.md.

Do not modify the spec or dashboard.

Create exactly four evaluations:

- EVAL-001 validates REQ-001 / AC-001.
- EVAL-002 validates REQ-002 / AC-002.
- EVAL-003 validates REQ-003 / AC-003.
- EVAL-004 validates REQ-004 / AC-004.

The harness must:
- load the dashboard in an iframe;
- show EVAL, REQ, AC, PASS/FAIL and evidence;
- provide Run all and Retry failed buttons;
- keep the attempt history;
- show transitions such as FAIL → PASS;
- calculate expected values independently;
- treat harness errors as FAIL;
- show a final summary such as 4/4 PASS.

Do not add more evals, dependencies, exports, charts,
MANUAL states or BLOCKED states.
```

### Parte 4 — Ejecutar el harness

Sirve el repositorio desde su raíz:

**Windows — PowerShell**

```powershell
python -m http.server 8000
```

**macOS, Linux o WSL — Bash/Zsh**

```bash
python3 -m http.server 8000
```

Abre `http://localhost:8000/evals/harness.html` y pulsa **Run all**. El resultado debe mostrar únicamente cuatro filas y un resumen global.

### Parte 5 — Corregir y ejecutar regresión

Si algún eval obtiene `FAIL`:

1. Lee el `REQ/AC` y la evidencia de esa fila.
2. Corrige solo la implementación que incumple la spec; no rebajes el criterio.
3. Pulsa **Retry failed**. El historial debe conservar el primer `FAIL` y añadir el nuevo resultado.
4. Cuando pase, pulsa **Run all** para comprobar que no hubo regresiones.

Para demostrar el ciclo durante el curso, si la primera ejecución devuelve `4/4 PASS`, renombra temporalmente uno de los IDs estables que lee el harness y ejecuta **Run all**. Restaura el ID según la spec y pulsa **Retry failed**. El historial debe mostrar claramente `FAIL → PASS`.

### Validación final del curso

Comprueba que:

- la spec continúa `Approved` y no cambió para hacer pasar los tests;
- existen exactamente cuatro filas y cada una enlaza un `REQ` con su `AC`;
- el resultado final es `4/4 PASS`;
- si hubo un fallo, el historial muestra el reintento y su corrección;
- el dashboard sigue siendo autocontenido y funciona sin el harness.

La cadena final del curso es:

```text
Idea → Plan → Spec aprobada → Implementación → Harness → Corrección → Reintento
```