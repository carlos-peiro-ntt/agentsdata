#!/usr/bin/env bash
# Workshop setup for macOS, Debian/Ubuntu Linux, and WSL.
# Usage: bash setup.sh [--check]
set -uo pipefail

GUIDE_URL="https://github.com/carlos-peiro-ntt/agentsdata/blob/main/docs/part-1/setup.md"
CHECK_ONLY=0
PROJECT_DIR="$HOME/agentsdata-workshop"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --check) CHECK_ONLY=1 ;;
    --project-dir)
      [[ $# -ge 2 ]] || { echo "--project-dir requires a path" >&2; exit 2; }
      PROJECT_DIR="$2"; shift ;;
    -h|--help) echo "Usage: bash setup.sh [--check] [--project-dir /path/to/folder]"; exit 0 ;;
    *) echo "Unknown option: $1" >&2; echo "Usage: bash setup.sh [--check] [--project-dir /path/to/folder]" >&2; exit 2 ;;
  esac
  shift
done

EXTENSIONS=(GitHub.copilot GitHub.copilot-chat)
CODEX_EXTENSION=openai.chatgpt
MIN_NODE_MAJOR=22
MIN_NODE_MINOR=20
PYTHON_VERSION="3.12"
MCP_ATLASSIAN_VERSION="0.24.8"
# Must match the release that publishes this script and the npm manifests.
WORKSHOP_RELEASE="workshop-v1"
RELEASE_URL="https://github.com/carlos-peiro-ntt/agentsdata/releases/download/$WORKSHOP_RELEASE"

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mWARN:\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }
has()  { command -v "$1" >/dev/null 2>&1; }

detect_os() {
  case "$(uname -s)" in
    Darwin) echo macos ;;
    Linux)
      if grep -qi microsoft /proc/version 2>/dev/null; then echo wsl; else echo linux; fi ;;
    *) echo unsupported ;;
  esac
}

OS="$(detect_os)"
[[ "$OS" == unsupported ]] && die "Unsupported OS: $(uname -s). On Windows, run setup.ps1 from PowerShell."

load_uv_env() {
  if [[ -f "$HOME/.local/bin/env" ]]; then
    # shellcheck disable=SC1091
    source "$HOME/.local/bin/env"
  fi
  case ":$PATH:" in *":$HOME/.local/bin:"*) ;; *) export PATH="$HOME/.local/bin:$PATH" ;; esac
}

APT_UPDATED=0
apt_install() {
  if [[ $APT_UPDATED -eq 0 ]]; then
    info "Updating apt package index"
    sudo apt-get update || die "apt-get update failed"
    APT_UPDATED=1
  fi
  info "Installing (apt): $*"
  sudo apt-get install -y "$@" || warn "apt-get install failed for: $*"
}

brew_install() {
  info "Installing (brew): $*"
  brew install "$@" || warn "brew install failed for: $*"
}

install_uv() {
  info "Installing uv"
  curl -LsSf https://astral.sh/uv/install.sh | sh || warn "uv installation failed"
  load_uv_env
}

install_macos() {
  has brew || die "Homebrew is required. Install it from https://brew.sh/ and run this script again."
  has code    || brew_install --cask visual-studio-code
  has node    || brew_install node
  has git     || brew_install git
  has uvx     || brew_install uv
}

install_linux() {
  has apt-get || die "Only Debian/Ubuntu (apt) is supported. Follow the manual steps in $GUIDE_URL"
  has curl    || apt_install curl
  has node    || apt_install nodejs npm
  has git     || apt_install git
  has npm     || apt_install npm
  if ! has code; then
    if [[ "$OS" == wsl ]]; then
      warn "VS Code not found. Install it on Windows with the WSL extension; do not install it inside WSL."
    elif has snap; then
      info "Installing VS Code (snap)"
      sudo snap install --classic code || warn "VS Code installation failed"
    else
      warn "snap not available. Install VS Code manually: https://code.visualstudio.com/"
    fi
  fi
  has uvx || install_uv
}

# Recent VS Code versions bundle Copilot as a built-in extension that --list-extensions does not report.
copilot_builtin() {
  local bin dir
  bin="$(command -v code)" || return 1
  bin="$(realpath "$bin" 2>/dev/null || readlink -f "$bin" 2>/dev/null || echo "$bin")"
  dir="$(dirname "$bin")"
  for d in "$dir/../extensions/copilot" "$dir/../resources/app/extensions/copilot" \
           /snap/code/current/usr/share/code/resources/app/extensions/copilot; do
    [[ -d "$d" ]] && return 0
  done
  return 1
}

install_extensions() {
  has code || { warn "Skipping VS Code extensions: 'code' is not on PATH."; return; }
  if copilot_builtin; then
    info "GitHub Copilot is built into this VS Code version"
    return
  fi
  local installed ext
  installed="$(code --list-extensions 2>/dev/null)"
  for ext in "${EXTENSIONS[@]}"; do
    if ! grep -qix "$ext" <<<"$installed"; then
      info "Installing VS Code extension $ext"
      code --install-extension "$ext" || warn "Failed to install $ext"
    fi
  done
}

RESULTS=()
FAILED=0
record() {
  RESULTS+=("$(printf '%-6s %-22s %s' "$1" "$2" "$3")")
  [[ "$1" == FAIL ]] && FAILED=1
}

check_cmd() {
  local name="$1"; shift
  local out
  if out="$("$@" 2>&1)" && [[ -n "$out" ]]; then
    record OK "$name" "${out%%$'\n'*}"
  else
    record FAIL "$name" "not found or not working"
  fi
}

check_node_version() {
  has node || return
  local major minor
  major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null)"
  minor="$(node -p 'process.versions.node.split(".")[1]' 2>/dev/null)"
  if [[ -n "$major" && -n "$minor" ]] && {
    [[ "$major" -lt $MIN_NODE_MAJOR ]] ||
    [[ "$major" -eq $MIN_NODE_MAJOR && "$minor" -lt $MIN_NODE_MINOR ]];
  }; then
    record FAIL "node >= ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}" "found $(node --version); update Node manually"
  else
    record OK "node >= ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}" "$(node --version)"
  fi
}

prepare_project() {
  mkdir -p "$PROJECT_DIR" || die "Cannot create project folder: $PROJECT_DIR"
  local file
  info "Downloading pinned npm manifests ($WORKSHOP_RELEASE)"
  for file in package.json package-lock.json; do
    curl -fsSL "$RELEASE_URL/$file" -o "$PROJECT_DIR/$file" || die "Could not download $RELEASE_URL/$file"
  done
  info "Installing workshop dependencies in $PROJECT_DIR"
  (cd "$PROJECT_DIR" && npm ci --registry=https://registry.npmjs.org/) || die "Workshop npm dependencies failed"
}

check_extensions() {
  if ! has code; then
    record FAIL "VS Code extensions" "'code' not available"
    return
  fi
  local installed
  if copilot_builtin; then
    record OK "GitHub Copilot" "built into VS Code"
  else
    installed="$(code --list-extensions 2>/dev/null)"
    local installed_ext
    local copilot_ok=0
    for installed_ext in "${EXTENSIONS[@]}"; do
      if grep -qix "$installed_ext" <<<"$installed"; then copilot_ok=1; fi
    done
    if [[ $copilot_ok -eq 1 ]]; then record OK "GitHub Copilot" "installed"; else record FAIL "GitHub Copilot" "not installed"; fi
  fi
  installed="$(code --list-extensions 2>/dev/null)"
  if grep -qix "$CODEX_EXTENSION" <<<"$installed"; then
    record OK "$CODEX_EXTENSION" "installed"
  else
    record WARN "$CODEX_EXTENSION" "optional extension; not installed"
  fi
}

verify() {
  load_uv_env
  info "Verifying installation"
  check_cmd code     code --version
  check_cmd node     node --version
  check_node_version
  check_cmd git      git --version
  check_cmd npm      npm --version
  check_cmd uvx      uvx --version
  if has uv; then
    uv python install "$PYTHON_VERSION" >/dev/null 2>&1 || record FAIL "python $PYTHON_VERSION" "uv could not install Python"
    if uv python find "$PYTHON_VERSION" >/dev/null 2>&1; then
      record OK "python $PYTHON_VERSION" "$(uv python find "$PYTHON_VERSION")"
    fi
  else
    record FAIL "python $PYTHON_VERSION" "uv not available"
  fi
  check_cmd mcp-atlassian uvx --python "$PYTHON_VERSION" "mcp-atlassian==$MCP_ATLASSIAN_VERSION" --help
  if [[ -f "$PROJECT_DIR/package.json" ]]; then
    local openspec_version
    openspec_version="$(cd "$PROJECT_DIR" && npm exec -- openspec --version 2>/dev/null)" || openspec_version=""
    if [[ -n "$openspec_version" ]]; then record OK "openspec (local)" "$openspec_version"; else record FAIL "openspec (local)" "not available"; fi
    if [[ -x "$PROJECT_DIR/node_modules/.bin/skills" ]]; then record OK "skills (local)" "1.9.0"; else record FAIL "skills (local)" "not available"; fi
  else
    record WARN "workshop dependencies" "run setup once to create $PROJECT_DIR"
  fi
  check_extensions

  echo
  printf '%s\n' "${RESULTS[@]}"
  echo
  if [[ $FAILED -ne 0 ]]; then
    warn "Some checks failed. Fix them (see $GUIDE_URL) and run: bash setup.sh --check"
    exit 1
  fi
  info "All checks passed. Restart your terminal if any tool was just installed."
}

info "Detected OS: $OS"
if [[ $CHECK_ONLY -eq 0 ]]; then
  if [[ "$OS" == macos ]]; then install_macos; else install_linux; fi
  load_uv_env
  install_extensions
  prepare_project
fi
verify
