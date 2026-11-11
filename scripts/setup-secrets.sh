#!/usr/bin/env bash
# Prompts for the workshop tokens and opens VS Code with them in its environment only.
# Usage: bash setup-secrets.sh [project-folder]   (default: ~/agentsdata-workshop)
set -uo pipefail

case "${1:-}" in
  -h|--help) echo "Usage: bash setup-secrets.sh [project-folder]"; exit 0 ;;
esac

PROJECT_DIR="${1:-$HOME/agentsdata-workshop}"

die() { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

command -v code >/dev/null 2>&1 || die "'code' is not on PATH. Run the setup script first (see docs/part-1/setup.md)."
[[ -d "$PROJECT_DIR" ]] || die "Project folder not found: $PROJECT_DIR. Pass your project folder as an argument."

# A running instance keeps its old environment and would ignore the new tokens.
# macOS `pgrep -f` does not match the app path reliably, hence ps; [V] stops grep matching itself.
# grep -q would close the pipe early and, with pipefail, report a failure even on a match.
if ps -axo args= 2>/dev/null | grep "[V]isual Studio Code.app/Contents/MacOS/" >/dev/null || pgrep -x code >/dev/null 2>&1; then
  die "VS Code is running. Quit it completely (Cmd+Q on macOS) and run this script again."
fi

read_secret() {
  local prompt="$1" value
  # Read from the terminal, hidden, so the token never reaches the shell history or the screen.
  read -rs -p "$prompt: " value </dev/tty || die "Could not read from the terminal."
  echo >&2
  [[ -n "$value" ]] || die "Empty value for: $prompt"
  printf '%s' "$value"
}

SUPABASE_ACCESS_TOKEN="$(read_secret 'Supabase token')" || exit 1
CONFLUENCE_PERSONAL_TOKEN="$(read_secret 'Confluence token')" || exit 1
export SUPABASE_ACCESS_TOKEN CONFLUENCE_PERSONAL_TOKEN

echo "Opening VS Code in $PROJECT_DIR. The tokens live only in that VS Code process and disappear when you quit it."
code "$PROJECT_DIR"
