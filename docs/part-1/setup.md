# Setup and Workshop Preparation

[← Back to README](../../README.md)

## Prerequisites

### 0.1 Requirements

Complete this guide on your own **before the course**. It only installs tools and prepares an empty project folder; the exercises are done together during the live session.

Before the workshop you need:

- Internet access;
- permission to install applications;
- a GitHub account;
- access to GitHub Copilot, or a ChatGPT account with access to Codex if you follow the Codex path.

The Supabase and Confluence tokens are shared during the course; you do not need them for this setup. Tokens are secrets. Do not paste them into chat, store them in project files, or include them in commits or screenshots.

> [!IMPORTANT]
> Do not clone, fork, or download the workshop repository. You only need the files listed in this guide.

### Quick setup (recommended)

The setup scripts install the core prerequisites (VS Code, Node.js, Git, uv/uvx, and GitHub Copilot), create the workshop project folder, and install the pinned OpenSpec and skills packages locally. The Codex extension is optional. They never replace an existing Node.js installation. Download the scripts for your system from your browser:

| System | Setup script | Secrets script (used in Exercise 3) |
| --- | --- | --- |
| macOS, Linux, or WSL | [setup.sh](https://github.com/carlos-peiro-ntt/agentsdata/releases/latest/download/setup.sh) | [setup-secrets.sh](https://github.com/carlos-peiro-ntt/agentsdata/releases/latest/download/setup-secrets.sh) |
| Windows | [setup.ps1](https://github.com/carlos-peiro-ntt/agentsdata/releases/latest/download/setup.ps1) | [setup-secrets.ps1](https://github.com/carlos-peiro-ntt/agentsdata/releases/latest/download/setup-secrets.ps1) |

Run the setup script from your Downloads folder and keep the secrets script there too; do not move either into your project folder.

**macOS, Linux (Debian/Ubuntu), or WSL — Bash**

```bash
bash ~/Downloads/setup.sh
```

On WSL, the browser saves files to the Windows Downloads folder: run `bash /mnt/c/Users/<windows-user>/Downloads/setup.sh`.

macOS requires [Homebrew](https://brew.sh/). On Linux the script uses `apt` and `sudo`. On WSL it does not install VS Code; install it on Windows with the **WSL** extension.

**Windows — PowerShell**

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Downloads\setup.ps1"
```

Requires `winget`. Node.js installation may require an administrator PowerShell.

To only verify, without installing anything:

```bash
bash ~/Downloads/setup.sh --check
```

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Downloads\setup.ps1" -Check
```

The script ends with an OK/FAIL summary and exits with an error if any check fails. Close and reopen the terminal after a first install. GitHub Copilot is the default agent; sign in manually. Codex is optional: the setup detects whether it is already installed and reports it as `WARN` instead of `FAIL` when absent.

If the script reports a failure, do not run the tools manually in advance. Reopen the terminal, apply the relevant troubleshooting step below, and rerun the script.

### 0.2 What the script prepares

The script installs or verifies the workshop prerequisites, creates `~/agentsdata-workshop`, writes its pinned `package.json`, and installs OpenSpec and the skills CLI locally:

- VS Code and the GitHub Copilot extension; Codex is optional;
- Node.js `22.20.0` or newer and npm;
- Git;
- `uv` and `uvx` with Python `3.12`;
- the pinned project-local npm dependencies, installed from the shared lockfile.

The dashboard is opened directly as a file; it does not require a local web server.

### 0.3 Verify the setup

Close and reopen the terminal after the first installation. The script should end with every check marked `OK`.

For a new installation or reinstall:

```bash
bash ~/Downloads/setup.sh
```

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Downloads\setup.ps1"
```

To verify an existing installation without changing it:

```bash
bash ~/Downloads/setup.sh --check
```

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\Downloads\setup.ps1" -Check
```

npm executes the project-local tools through `npm exec`; OpenSpec and the skills CLI are not installed globally.

### 0.4 Sign in and open the project

Open VS Code and sign in to the agent you will use:

- GitHub Copilot: open chat and send a test message;
- Codex: open the Codex panel, sign in with ChatGPT, and send a test message.

Open the workshop folder created by the script:

```bash
code ~/agentsdata-workshop
```

```powershell
code "$HOME\agentsdata-workshop"
```

Every exercise happens inside this folder. It does not need Git or files from this repository.

### Troubleshooting

#### Windows: uvx/PyYAML reports missing Microsoft C++ Build Tools

If `uvx --python 3.12 mcp-atlassian==0.24.8 --help` reports `Microsoft Visual C++ 14.0 or greater is required` or fails while compiling PyYAML, install Microsoft C++ Build Tools manually. This is a Windows fallback; the setup script does not install them automatically.

Open PowerShell as administrator and run:

```powershell
winget install --exact --id Microsoft.VisualStudio.2022.BuildTools `
  --source winget `
  --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended" `
  --accept-package-agreements `
  --accept-source-agreements
```

Alternatively, open Visual Studio Installer, select **Build Tools for Visual Studio 2022**, and include **Desktop development with C++** and the **Windows SDK**.

Close all PowerShell windows and fully quit VS Code. Reopen VS Code or a terminal, then verify:

```powershell
uv python find 3.12
uvx --python 3.12 mcp-atlassian==0.24.8 --help
powershell -ExecutionPolicy Bypass -File "$HOME\Downloads\setup.ps1" -Check
```

#### Windows: npm is blocked in PowerShell

npm creates both `.ps1` and `.cmd` shims. If PowerShell says an npm shim cannot be loaded because scripts are disabled, use the `.cmd` shim explicitly:

```powershell
npm.cmd --version
npm.cmd exec -- openspec --version
npm.cmd exec -- skills --help
```

From `agentsdata-workshop`, direct local shims are also supported:

```powershell
& ".\node_modules\.bin\openspec.cmd" --version
& ".\node_modules\.bin\skills.cmd" --help
```

`npm.cmd exec` resolves project-local tools and does not require `node_modules\.bin` to be added to `PATH`. Check resolution with:

```powershell
Get-Command npm.cmd
Get-Command openspec -All
npm prefix
Test-Path ".\node_modules\.bin\openspec.cmd"
```

#### Windows: uvx is not found

Close and reopen the terminal, or load the uv path in the current session:

```powershell
$env:Path = "$HOME\.local\bin;$env:Path"
uvx --python 3.12 mcp-atlassian==0.24.8 --help
```

If the command still fails, fully restart VS Code and rerun the setup script.

> [!WARNING]
> **Stop here.** Your preparation is complete. Do not start the exercises in advance: they are done step by step during the live course, where the sample data is introduced and the tokens are shared.

---

Continue with [Exercise 1 — Create the First Dashboard](exercise-01-dashboard.md) only when the course starts.
