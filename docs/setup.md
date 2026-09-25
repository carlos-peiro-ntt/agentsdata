# Setup and Workshop Preparation

[← Back to README](../README.md)

## Prerequisites

### 0.1 Requirements

Before the workshop you need:

- Internet access;
- permission to install applications;
- a GitHub account with access to the repository;
- access to GitHub Copilot or the development agent used in the workshop;
- the Supabase token provided for the course;
- the Confluence token provided for the course.

Tokens are secrets. Do not paste them into chat, store them in repository files, or include them in commits or screenshots.

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

### 0.3 Install Git

**Windows — PowerShell**

```powershell
winget install --id Git.Git -e --source winget
```

**macOS — Terminal**

```bash
brew install git
```

**Linux or WSL — Bash**

```bash
sudo apt update
sudo apt install -y git
```

Close and reopen the terminal. Check the installation on any system:

```bash
git --version
```

### 0.4 Install Visual Studio Code

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

### 0.5 Install Python

Python will be used to serve the dashboard locally.

**Windows — PowerShell**

```powershell
winget install 9NQ7512CXL7T
```

Close and reopen PowerShell. Then run:

```powershell
py install 3.12
py -3.12 --version
```

**macOS — Terminal**

```bash
brew install python@3.12
python3 --version
```

**Linux or WSL — Bash**

```bash
sudo apt update
sudo apt install -y python3 python3-pip
python3 --version
```

### 0.6 Install Node.js, npm, and npx

`npx` will be used to install skills.

**Windows — PowerShell**

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

### 0.7 Install uv and uvx

`uvx` will be used to run the Confluence MCP.

**Windows — PowerShell**

1. Run in the terminal:

   ```console
   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

2. Temporarily add `uv` and `uvx` to the current session's `PATH`:

   ```console
   $env:Path = "$HOME\.local\bin;$env:Path"
   ```

3. Check that `uvx` is available:

   ```console
   uvx mcp-atlassian --help
   ```

4. Close and reopen Visual Studio Code so the installation applies to a new session.

### 0.8 Install VS Code extensions

1. Open Visual Studio Code.
2. Press `Ctrl+Shift+X` on Windows/Linux or `⇧⌘X` on macOS.
3. Search for and install **GitHub Copilot**.
4. Sign in with your GitHub account.
5. Optionally, install **Codex – OpenAI's coding agent**.
6. Open chat and check that you can send messages.

### 0.9 Final check

**Windows — PowerShell**

```powershell
git --version
code --version
py --version
node --version
npx --version
uvx --version
```

**macOS, Linux, or WSL — Bash/Zsh**

```bash
git --version
code --version
python3 --version
node --version
npx --version
uvx --version
```

Do not continue until all commands respond without errors.

---

## Prepare the Workshop

### 1.1 Clone the repository

**Windows — PowerShell**

```powershell
cd $HOME\Documents
git clone https://github.com/carlos-peiro-ntt/agentsdata.git
cd agentsdata
code .
```

**macOS, Linux, or WSL — Bash/Zsh**

```bash
cd ~/Documents
git clone https://github.com/carlos-peiro-ntt/agentsdata.git
cd agentsdata
code .
```

If `~/Documents` does not exist, clone the repository from any available working directory.

### 1.2 Confirm the starting point

Open the VS Code integrated terminal.

**Windows — PowerShell**

```powershell
git status
Get-ChildItem -Force
```

**macOS, Linux, or WSL — Bash/Zsh**

```bash
git status
ls -la
```

The repository starts without an implemented application. This guide is the thread for creating all files during the exercises.

---

Continue to [Exercise 1 — Create the First Dashboard](exercises/exercise-01-dashboard.md).
