# Step-by-step Guide — Agent-based Sales Dashboard

This repository is the starting point for a practical workshop. When cloned, it contains only this guide: the dashboard, data, agent instructions, and integrations will be created progressively during the exercises.

The goal is to start from zero and iterate on a simple business dashboard to understand the difference between:

- requesting a solution with a prompt;
- providing real data;
- defining persistent instructions in `AGENTS.md`;
- adding specialized skills;
- connecting external tools through MCP;
- planning and executing a complete delivery.

> The guide shows commands for **Windows 10/11 with PowerShell** and for **WSL, Linux, and macOS with Bash/Zsh**. Linux commands assume an Ubuntu/Debian-based distribution.

## How to Follow This Workshop

Work through the linked documents in order. Each one builds on the files created by the previous step.

1. [Setup and Workshop Preparation](docs/setup.md) — install prerequisites and clone the repository.
2. [Exercise 1 — Create the First Dashboard](docs/exercises/exercise-01-dashboard.md) — prompt-only generation, then generation from real CSV data.
3. [Exercise 2 — From Prompt to Persistent Instructions](docs/exercises/exercise-02-agent-instructions.md) — create `AGENTS.md`.
4. [Exercise 3 — Skills, MCP, Planning, and Implementation](docs/exercises/exercise-03-skills-mcp.md) — install skills, configure MCP servers, add the dashboard instruction, plan and implement the Supabase-backed dashboard.
5. [Exercise 4 — From Plan to Specification with SDD](docs/exercises/exercise-04-sdd.md) — turn an approved plan into a spec under `specs/`.
6. [Exercise 5 — Guided Implementation and Harness/Evals](docs/exercises/exercise-05-implementation-evals.md) — implement the spec and validate it with `evals/harness.html`.

## Data Progression

The workshop moves through three data stages, and each exercise states which one applies:

1. No data — the agent has to invent values.
2. CSV files in `resources/` — real but temporary sample data, used only to learn the flow. These files are removed once Supabase becomes the source of truth.
3. Supabase (via MCP, read-only) — the authoritative source for the rest of the workshop. The Supabase tables mirror the same schema and names as the earlier CSV files. The token is provided during the live course.

## Repository Structure at the End of the Course

- `{name}.html` — the standalone, self-contained sales dashboard.
- `AGENTS.md` — persistent project instructions and entry point for agents.
- `.github/instructions/dashboard.instructions.md` — the single source of truth for dashboard privacy, data-quality, and Confluence publishing rules.
- `.agents/skills/` — installed skills (`frontend-design`, `kpi-dashboard-design`).
- `.vscode/mcp.json` — MCP server configuration (Supabase, Confluence).
- `specs/dashboard-evolution.md` — the approved specification for the Total Sales comparison feature.
- `evals/harness.html` — the evaluation harness validating the spec's requirements and acceptance criteria.

## Essential Commands

Serve the repository locally to open the dashboard or the harness in a browser:

```bash
# macOS, Linux, or WSL
python3 -m http.server 8000

# Windows
py -m http.server 8000
```

Then open `http://localhost:8000/{name}.html` or `http://localhost:8000/evals/harness.html`.
