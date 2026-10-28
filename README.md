# Step-by-step Guide — Agent-based Sales Dashboard

This repository contains the step-by-step guide for a practical workshop. You do not work inside it: you start from an empty folder on your machine and create the dashboard, agent instructions, and integrations progressively during the exercises. The setup scripts and the sample data are downloaded from the [latest release](https://github.com/carlos-peiro-ntt/agentsdata/releases/latest).

The goal is to start from zero and iterate on a simple business dashboard to understand the difference between:

- requesting a solution with a prompt;
- providing real data;
- defining persistent instructions in `AGENTS.md`;
- adding specialized skills;
- connecting external tools through MCP;
- planning and executing a complete delivery.

> The guide shows commands for **Windows 10/11 with PowerShell** and for **WSL, Linux, and macOS with Bash/Zsh**. Linux commands assume an Ubuntu/Debian-based distribution.

## Before the Course

Complete these steps on your own before the live session. They only install tools and prepare an empty folder; the exercises themselves are done together during the course.

> [!IMPORTANT]
> **Do not clone, fork, or download this repository.** Its files are the final snapshot of the workshop, published only so you can compare your result after the course. Everything you need is in this guide and in the release downloads.

### 1. Install the prerequisites

Download the setup script for your system from your browser:

| System | Download |
| --- | --- |
| macOS, Linux, or WSL | [setup.sh](https://github.com/carlos-peiro-ntt/agentsdata/releases/latest/download/setup.sh) |
| Windows | [setup.ps1](https://github.com/carlos-peiro-ntt/agentsdata/releases/latest/download/setup.ps1) |

Run it from your Downloads folder. It installs any missing prerequisite and verifies everything; see [Setup and Workshop Preparation](docs/setup.md) for details and manual steps.

```bash
# macOS or Linux
bash ~/Downloads/setup.sh

# WSL (the browser saves files to the Windows Downloads folder)
bash /mnt/c/Users/<windows-user>/Downloads/setup.sh
```

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File "$HOME\Downloads\setup.ps1"
```

Add `--check` (Bash) or `-Check` (PowerShell) to only verify without installing. The run must end with every check `OK`.

Then open VS Code, sign in to GitHub Copilot, and check that you can send a message in the chat.

### 2. Prepare your working folder

Create an empty folder for the workshop and open it in VS Code. Every exercise happens inside this folder; it does not need Git or any file from this repository.

```bash
# macOS, Linux, or WSL
mkdir -p ~/agentsdata-workshop
code ~/agentsdata-workshop
```

```powershell
# Windows
New-Item -ItemType Directory -Force "$HOME\agentsdata-workshop"
code "$HOME\agentsdata-workshop"
```

You can also create the folder from your file explorer and open it with **File → Open Folder** in VS Code. From now on, "project folder" refers to this folder.

### Ready checklist

- [ ] The setup script ends with every check `OK`.
- [ ] GitHub Copilot chat answers in VS Code.
- [ ] An empty project folder is open in VS Code.

> [!WARNING]
> **Stop here.** Do not start the exercises in advance: they are done step by step during the live course, where the sample data is introduced and the tokens are shared.

## During the Course

Work through the exercises in order, following the instructor. Each one builds on the files created by the previous step.

1. [Exercise 1 — Create the First Dashboard](docs/exercises/exercise-01-dashboard.md) — prompt-only generation, then generation from real CSV data.
2. [Exercise 2 — From Prompt to AGENTS.md](docs/exercises/exercise-02-agents-md.md) — create `AGENTS.md`.
3. [Exercise 3 — Skills, MCP, Instructions, Planning, and Implementation](docs/exercises/exercise-03-skills-mcp-instructions.md) — install skills, configure MCP servers, add the dashboard instruction, plan and implement the Supabase-backed dashboard.
4. [Exercise 4 — Propose and Apply a Change with OpenSpec](docs/exercises/exercise-04-openspec-propose-apply.md) — initialize [OpenSpec](https://github.com/Fission-AI/OpenSpec), turn an idea into a reviewed change under `openspec/changes/`, and implement it with `/opsx-apply`.
5. [Exercise 5 — Verify, Evaluate with a Harness, and Archive](docs/exercises/exercise-05-verify-harness-archive.md) — verify the implemented change, validate it with `evals/harness.js`, then archive it.

## Data Progression

The workshop moves through three data stages, and each exercise states which one applies:

1. No data — the agent has to invent values.
2. CSV files downloaded as [`resources.zip`](https://github.com/carlos-peiro-ntt/agentsdata/releases/latest/download/resources.zip) during Exercise 1 and extracted into `resources/` in your project folder — real but temporary sample data, used only to learn the flow. These files are removed once Supabase becomes the source of truth.
3. Supabase (via MCP, read-only) — the authoritative source for the rest of the workshop. The Supabase tables mirror the same schema and names as the earlier CSV files. The token is provided during the live course.
