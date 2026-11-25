# Workshop Setup — Maintainer Guide

Internal notes for maintaining the setup scripts and the pinned tool versions. Participants never read this file; they only download the release assets.

## How the setup works

Participants download `setup.sh` / `setup.ps1` from the GitHub release. Each script:

1. installs missing system tools (VS Code, Node.js, Git, uv) without replacing existing ones;
2. downloads `package.json` and `package-lock.json` from the release named in `WORKSHOP_RELEASE` (`setup.sh`) / `$WorkshopRelease` (`setup.ps1`);
3. runs `npm ci` in the participant's project folder (`~/agentsdata-workshop`), creating a local `node_modules` with exactly the locked versions;
4. verifies everything and prints an OK / WARN / FAIL summary. GitHub Copilot is required; the Codex extension is optional and only reported as `WARN` when missing.

`node_modules` is never committed or published. Each participant generates it from the lockfile, so every machine gets identical versions.

Each release is immutable in practice: a script downloaded from `workshop-v1` always installs the `workshop-v1` dependencies, even after a newer release exists.

## Pinned versions

| What | Where it is pinned |
| --- | --- |
| OpenSpec, skills CLI | `scripts/workshop-package/package.json` + `package-lock.json` |
| Minimum Node.js | `engines.node` in `package.json`; `MIN_NODE_MAJOR`/`MIN_NODE_MINOR` in `setup.sh`; `$MinNodeMajor`/`$MinNodeMinor` in `setup.ps1` |
| Python, mcp-atlassian | `PYTHON_VERSION`/`MCP_ATLASSIAN_VERSION` in `setup.sh`; `$PythonVersion`/`$McpAtlassianVersion` in `setup.ps1`; also hard-coded in `docs/part-1/exercise-03-skills-mcp-instructions.md`, `docs/part-1/setup.md`, and `part-1/.mcp.json` |
| Release that scripts download from | `WORKSHOP_RELEASE` in `setup.sh`; `$WorkshopRelease` in `setup.ps1` |

Node.js is a minimum, not an exact version. Keep it equal to the highest `engines.node` required by the pinned packages; raising it further makes the setup fail for participants whose valid Node.js installation is older, because the scripts never upgrade an existing Node.js.

## Updating to new versions

1. Check the latest versions and their Node.js requirement:

   ```bash
   npm view @fission-ai/openspec version engines
   npm view skills version engines
   ```

2. Update the versions (and `engines.node` if it changed) in `scripts/workshop-package/package.json`.
3. Regenerate the lockfile and verify a clean install:

   ```bash
   cd scripts/workshop-package
   npm install --package-lock-only
   npm ci && npm exec -- openspec --version && npm ls --depth=0
   rm -rf node_modules
   ```

4. If the Node.js minimum changed, update it in both scripts.
5. If `mcp-atlassian` or Python changed, update every location listed in the table above.
6. Set `WORKSHOP_RELEASE` / `$WorkshopRelease` in both scripts to the new release tag, for example `workshop-v2`.
7. For a new OpenSpec major version, rerun Exercises 4 and 5 and update the documented commands (for example `openspec init --tools`, `openspec config profile`).
8. Commit through a pull request and merge to `main`.
9. Create the release from `main` with all assets:

   ```bash
   gh release create workshop-v2 \
     scripts/setup.sh scripts/setup.ps1 scripts/setup-secrets.sh scripts/setup-secrets.ps1 \
     scripts/workshop-package/package.json scripts/workshop-package/package-lock.json \
     resources.zip
   ```

   Download `resources.zip` from the previous release first if you do not have it locally: `gh release download workshop-v1 -p resources.zip`.

10. Test the published release as a participant would (see below).

## Fixing a published release

To fix a script without changing versions, merge the fix to `main` and replace only that asset:

```bash
gh release upload workshop-v1 scripts/setup.sh --clobber
```

Never replace `package.json` or `package-lock.json` in an existing release; publish a new release instead.

## Testing a release

Run the published script against a throwaway folder. On macOS, use `/bin/bash` (Bash 3.2), the version participants have:

```bash
curl -fsSL -o /tmp/setup.sh https://github.com/carlos-peiro-ntt/agentsdata/releases/download/workshop-v1/setup.sh
/bin/bash /tmp/setup.sh --project-dir /tmp/agentsdata-test
```

Every check must be `OK`, except `openai.chatgpt`, which may be `WARN`. The folder must contain `node_modules`, `package.json`, and `package-lock.json`. Test `setup.ps1` on Windows as well:

```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1 -ProjectDir "$env:TEMP\agentsdata-test"
```

The `releases/latest/download/...` URLs can briefly serve a cached older asset after an upload; use the tag URL above to verify.

## Known limitations

- On Linux, `apt install nodejs` often provides an older Node.js than the required minimum; participants then get a Node.js `FAIL` and must install a newer version manually.
- Bash scripts must stay compatible with Bash 3.2 and `set -u`: expanding an empty array (`"${arr[@]}"`) aborts the script on macOS.
