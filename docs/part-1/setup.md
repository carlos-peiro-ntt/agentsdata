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

The setup scripts install any missing prerequisite (VS Code, Node.js, uv/uvx, OpenSpec, the GitHub Copilot extensions, and the Codex extension) and then verify everything. Download the scripts for your system from your browser:

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

The script ends with an OK/FAIL summary and exits with an error if any check fails. Close and reopen the terminal after a first install. Signing in to GitHub Copilot and Codex (steps 4 and 7 in [0.8](#08-install-vs-code-extensions)) and handling tokens remain manual.

If the script fails or you prefer to install each tool yourself, follow the manual steps below.

### 0.2 Open a terminal

#### Windows — PowerShell

Open **Start**, search for **PowerShell**, and run:

```powershell
winget --version
```

If `winget` is unavailable, install or update **App Installer** from Microsoft Store.

If you want to work with WSL, open PowerShell as administrator and install Ubuntu:

```powershell
wsl --install
wsl --status
```

Restart Windows when requested and open **Ubuntu** from Start.

#### macOS — Terminal

Open **Terminal** and check that Homebrew is installed:

```bash
brew --version
```

If it is unavailable, install it by following the instructions at [brew.sh](https://brew.sh/).

#### Linux or WSL — Bash

Open a terminal and check the system:

```bash
uname -a
cat /etc/os-release
```

### 0.3 Install Visual Studio Code

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

In **WSL**, install VS Code on Windows and add Microsoft's **WSL** extension; do not install a second copy inside the distribution.

Restart the terminal and check on any system:

```bash
code --version
```

### 0.4 Python (not required)

You do not need to install Python. `uv` (step [0.6](#06-install-uv-and-uvx)) downloads its own Python when it runs the Confluence MCP, and the dashboard is opened directly as a file, without a local web server.

### 0.5 Install Node.js, npm, and npx

`npx` will be used to install skills.

**Windows — PowerShell**

Administrator permissions are required for this installation. Open PowerShell as administrator before running:

```powershell
winget install --id OpenJS.NodeJS.LTS -e
```

**macOS — Terminal**

```bash
brew install node
```

**Linux or WSL — Bash**

```bash
sudo apt update
sudo apt install -y nodejs npm
```

Restart the terminal and validate on any system:

```bash
node --version
npm --version
npx --version
```

### 0.6 Install uv and uvx

`uvx` will be used to run the Confluence MCP. `uvx` is included with `uv`.

**Windows — PowerShell**

Run:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Close and reopen the terminal, then check:

```powershell
uvx --version
uvx mcp-atlassian --help
```

If `uvx` is not found, add it to the current session's `PATH`:

```powershell
$env:Path = "$HOME\.local\bin;$env:Path"
```

**macOS — Terminal**

```bash
brew install uv
```

Then check:

```bash
uvx --version
uvx mcp-atlassian --help
```

**Linux or WSL — Bash**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Close and reopen the terminal, then check:

```bash
uvx --version
uvx mcp-atlassian --help
```

If `uvx` is not found, load the updated environment:

```bash
source $HOME/.local/bin/env
```

`uvx` caches the first `mcp-atlassian` version it downloads. To update it to the latest release, run once:

```bash
uvx --refresh mcp-atlassian --help
```

> **Why stdio and not an HTTP connection to Confluence?** Atlassian's hosted remote MCP only supports Confluence Cloud; the workshop Confluence is on-premises (Data Center), so each participant runs `mcp-atlassian` locally and the agent talks to it through stdin/stdout (**stdio**). `mcp-atlassian` can also run as a **streamable-http** server (`--transport streamable-http`), which agents reach through a URL; that only pays off if a team hosts one shared instance inside the corporate network.

### 0.7 Install OpenSpec

OpenSpec will be used for Specification-Driven Development in Exercises 4 and 5. The commands set the public npm registry explicitly, so they also work if your npm is configured with a private or corporate registry.

**Windows — PowerShell**

```powershell
npm install -g @fission-ai/openspec@latest --registry=https://registry.npmjs.org/
```

**macOS — Terminal**

```bash
brew install openspec
```

**Linux or WSL — Bash**

```bash
npm install -g @fission-ai/openspec@latest --registry=https://registry.npmjs.org/
```

Check the installation on any system:

```bash
openspec --version
```

### 0.8 Install VS Code extensions

1. Open Visual Studio Code.
2. Press `Ctrl+Shift+X` on Windows/Linux or `⇧⌘X` on macOS.
3. Search for and install **GitHub Copilot** (recent VS Code versions already include it).
4. Sign in with your GitHub account.
5. Open chat and check that you can send messages.
6. Search for and install **Codex – OpenAI's coding agent** (`openai.chatgpt`).
7. Open the Codex panel from the Activity Bar, sign in with your ChatGPT account, and check that you can send a message.

The exercises show the GitHub Copilot steps by default; when Codex differs, a collapsible **Codex** block explains the alternative.

### 0.9 Final check

**Windows — PowerShell**

```powershell
code --version
node --version
npx --version
uvx --version
openspec --version
```

**macOS, Linux, or WSL — Bash/Zsh**

```bash
code --version
node --version
npx --version
uvx --version
openspec --version
```

Do not continue until all commands respond without errors.

### 0.10 Prepare your project folder

Create an empty folder for the workshop and open it in VS Code. Every exercise happens inside this folder; it does not need Git.

**Windows — PowerShell**

```powershell
New-Item -ItemType Directory -Force "$HOME\agentsdata-workshop"
code "$HOME\agentsdata-workshop"
```

**macOS, Linux, or WSL — Bash/Zsh**

```bash
mkdir -p ~/agentsdata-workshop
code ~/agentsdata-workshop
```

You can also create the folder from your file explorer and open it with **File → Open Folder** in VS Code. The guide calls it the "project folder".

> [!WARNING]
> **Stop here.** Your preparation is complete. Do not start the exercises in advance: they are done step by step during the live course, where the sample data is introduced and the tokens are shared.

---

Continue with [Exercise 1 — Create the First Dashboard](exercise-01-dashboard.md) only when the course starts.
