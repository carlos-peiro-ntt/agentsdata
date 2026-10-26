#!/usr/bin/env bash
# Workshop setup for macOS, Debian/Ubuntu Linux, and WSL.
# Usage: bash scripts/setup.sh [--check]
set -uo pipefail

CHECK_ONLY=0
case "${1:-}" in
  --check) CHECK_ONLY=1 ;;
  "") ;;
  -h|--help) echo "Usage: bash scripts/setup.sh [--check]"; exit 0 ;;
  *) echo "Unknown option: $1" >&2; echo "Usage: bash scripts/setup.sh [--check]" >&2; exit 2 ;;
esac

EXTENSIONS=(GitHub.copilot GitHub.copilot-chat)
MIN_NODE_MAJOR=20

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
[[ "$OS" == unsupported ]] && die "Unsupported OS: $(uname -s). On Windows, run scripts\\setup.ps1 from PowerShell."

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
  has git     || brew_install git
  has code    || brew_install --cask visual-studio-code
  has python3 || brew_install python@3.12
  has node    || brew_install node
  has uvx     || brew_install uv
  has openspec || brew_install openspec
}

install_linux() {
  has apt-get || die "Only Debian/Ubuntu (apt) is supported. Follow the manual steps in docs/setup.md."
  has git     || apt_install git
  has curl    || apt_install curl
  has python3 || apt_install python3 python3-pip
  has node    || apt_install nodejs npm
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
  if ! has openspec; then
    info "Installing OpenSpec (npm)"
    sudo npm install -g @fission-ai/openspec@latest || warn "OpenSpec installation failed"
  fi
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
  local major
  major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null)"
  if [[ -n "$major" && "$major" -lt $MIN_NODE_MAJOR ]]; then
    record WARN "node >= $MIN_NODE_MAJOR" "found $(node --version); OpenSpec may need a newer Node.js"
  fi
}

check_extensions() {
  if ! has code; then
    record FAIL "VS Code extensions" "'code' not available"
    return
  fi
  if copilot_builtin; then
    record OK "GitHub Copilot" "built into VS Code"
    return
  fi
  local installed ext
  installed="$(code --list-extensions 2>/dev/null)"
  for ext in "${EXTENSIONS[@]}"; do
    if grep -qix "$ext" <<<"$installed"; then
      record OK "$ext" "installed"
    else
      record FAIL "$ext" "not installed"
    fi
  done
}

verify() {
  load_uv_env
  info "Verifying installation"
  check_cmd git      git --version
  check_cmd code     code --version
  check_cmd python3  python3 --version
  check_cmd node     node --version
  check_node_version
  check_cmd npm      npm --version
  check_cmd npx      npx --version
  check_cmd uvx      uvx --version
  check_cmd mcp-atlassian uvx mcp-atlassian --help
  check_cmd openspec openspec --version
  check_extensions

  echo
  printf '%s\n' "${RESULTS[@]}"
  echo
  if [[ $FAILED -ne 0 ]]; then
    warn "Some checks failed. Fix them (see docs/setup.md) and run: bash scripts/setup.sh --check"
    exit 1
  fi
  info "All checks passed. Restart your terminal if any tool was just installed."
}

info "Detected OS: $OS"
if [[ $CHECK_ONLY -eq 0 ]]; then
  if [[ "$OS" == macos ]]; then install_macos; else install_linux; fi
  load_uv_env
  install_extensions
fi
verify
