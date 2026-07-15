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

8. Abre `http://localhost:8000/index.html`.
9. Detén el servidor con `Ctrl+C` al terminar.

### Validación del ejercicio

Comprueba que:

- se ha creado `index.html`;
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

## 4. Ejercicio 3 — Skills, MCP y modo Plan

### Objetivo

Añadir conocimiento especializado, conectar fuentes externas y planificar una entrega completa antes de implementarla.

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

### Parte 4 — Crear el plan

1. Cambia al modo **Plan**.
2. Envía:

```text
# Generate an Interactive HTML Sales Dashboard

Generate an interactive HTML sales dashboard for the business, reading data from Supabase through the configured MCP. Automatically document the report in Confluence using the corresponding MCP.

## Exercise Deliverables

- Update the current HTML dashboard in `index.html`.
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
- Use the configured **Confluence MCP** to create the documentation as a **child page of the existing page with ID `1430576442`**. Do not create it at the Confluence root or under a different parent.
- Title the new child page using exactly this pattern: `{creator name} - Informe venta`. If the creator name is not available from the repository or conversation, ask for it before implementation.
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

3. Revisa el plan generado.
4. Confirma que incluye:
   - consulta de las tablas de Supabase;
   - validación de datos antes de calcular KPIs;
   - uso de las skills instaladas;
   - actualización de `index.html`;
   - creación de la documentación en Confluence;
   - protección de datos personales.
5. No pases a implementación hasta que el plan sea correcto.

### Parte 5 — Ejecutar el plan

1. Cambia de Plan a **Agent**.
2. Pide al agente que implemente el plan aprobado.
3. Revisa y autoriza los accesos a Supabase y Confluence.
4. Revisa los cambios realizados en `index.html`.
5. Ejecuta el dashboard:

**Windows — PowerShell**

```powershell
py -m http.server 8000
```

**macOS, Linux o WSL — Bash/Zsh**

```bash
python3 -m http.server 8000
```

6. Abre `http://localhost:8000/index.html`.
7. Abre la página generada en Confluence.

### Validación del ejercicio

Comprueba que:

- Supabase se ha utilizado en modo de solo lectura;
- todos los filtros actualizan todos los KPIs y gráficos;
- existen los cinco KPIs solicitados;
- están presentes los cinco gráficos solicitados;
- el banner de calidad es visible;
- no aparecen identificadores personales;
- `index.html` es autocontenido;
- la página de Confluence documenta fuentes, métricas y limitaciones.

---

## 5. Cierre del taller

Revisa los archivos creados durante los ejercicios:

```bash
git status --short
```

El recorrido esperado es:

```text
README.md
   ↓
resources/ + index.html
   ↓
AGENTS.md
   ↓
.agents/skills/ + skills-lock.json
   ↓
.vscode/mcp.json
   ↓
Dashboard final + documentación en Confluence
```

Antes de compartir o subir cambios, confirma que ningún archivo contiene tokens, credenciales o datos personales.

## Resolución rápida de problemas

### Un comando no se reconoce

Cierra VS Code y la terminal, abre una nueva y vuelve a probar. Las instalaciones modifican `PATH` y una terminal abierta no siempre recoge los cambios.

### El dashboard no carga los CSV

No abras `index.html` con doble clic. Ejecútalo mediante:

**Windows — PowerShell**

```powershell
py -m http.server 8000
```

**macOS, Linux o WSL — Bash/Zsh**

```bash
python3 -m http.server 8000
```

### Un MCP devuelve `401` o `403`

Reinicia el servidor desde **MCP: List Servers** y vuelve a introducir el token. Si el error continúa, comprueba que el token no haya caducado y que tengas permisos en el entorno correspondiente.

### Confluence tarda en arrancar

La primera ejecución de `uvx mcp-atlassian` puede tardar mientras descarga la herramienta. Consulta la salida del servidor desde **MCP: List Servers**.
