# Step-by-step Guide — Agent-based Sales Dashboard

This repository is the starting point for a practical workshop. When cloned, it contains only this guide and the setup scripts: the sample data is provided by the instructor during Exercise 1, and the dashboard, agent instructions, and integrations will be created progressively during the exercises.

The goal is to start from zero and iterate on a simple business dashboard to understand the difference between:

- requesting a solution with a prompt;
- providing real data;
- defining persistent instructions in `AGENTS.md`;
- adding specialized skills;
- connecting external tools through MCP;
- planning and executing a complete delivery.

> The guide shows commands for **Windows 10/11 with PowerShell** and for **WSL, Linux, and macOS with Bash/Zsh**. Linux commands assume an Ubuntu/Debian-based distribution.

## Getting Started

Create your own copy of this repository with **Use this template → Create a new repository** on GitHub (do not clone or fork this repository directly), then clone your copy.

```bash
git clone https://github.com/<your-user>/<your-repo>.git
cd <your-repo>
```

For example, if your GitHub user is `jdoe` and you named the new repository `agentsdata-course`:

```bash
git clone https://github.com/jdoe/agentsdata-course.git
cd agentsdata-course
```

Copy your own URL from the green **Code** button of your new repository (**HTTPS** tab) and use your repository name in `cd`.

Run the setup script from the repository root. It installs any missing prerequisite and verifies everything; see [Setup and Workshop Preparation](docs/setup.md) for details and manual steps.

```bash
# macOS, Linux, or WSL
bash scripts/setup.sh
```

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
```

Add `--check` (Bash) or `-Check` (PowerShell) to only verify without installing.

## How to Follow This Workshop

Work through the linked documents in order. Each one builds on the files created by the previous step.

1. [Setup and Workshop Preparation](docs/setup.md) — install prerequisites with `scripts/setup.sh` (macOS/Linux/WSL) or `scripts/setup.ps1` (Windows).
2. [Exercise 1 — Create the First Dashboard](docs/exercises/exercise-01-dashboard.md) — prompt-only generation, then generation from real CSV data.
3. [Exercise 2 — From Prompt to Persistent Instructions](docs/exercises/exercise-02-agent-instructions.md) — create `AGENTS.md`.
4. [Exercise 3 — Skills, MCP, Planning, and Implementation](docs/exercises/exercise-03-skills-mcp.md) — install skills, configure MCP servers, add the dashboard instruction, plan and implement the Supabase-backed dashboard.
5. [Exercise 4 — From Plan to Specification with OpenSpec](docs/exercises/exercise-04-sdd.md) — initialize [OpenSpec](https://github.com/Fission-AI/OpenSpec), turn an idea into a reviewed change under `openspec/changes/`, and implement it with `/opsx-apply`.
6. [Exercise 5 — Guided Implementation, Verify, and Harness/Evals](docs/exercises/exercise-05-implementation-evals.md) — verify the implemented change, validate it with `evals/harness.js`, then archive it.

## Data Progression

The workshop moves through three data stages, and each exercise states which one applies:

1. No data — the agent has to invent values.
2. CSV files provided by the instructor during Exercise 1 and copied into `resources/` — real but temporary sample data, used only to learn the flow. These files are removed once Supabase becomes the source of truth.
3. Supabase (via MCP, read-only) — the authoritative source for the rest of the workshop. The Supabase tables mirror the same schema and names as the earlier CSV files. The token is provided during the live course.
