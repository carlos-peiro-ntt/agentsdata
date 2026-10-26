# Workshop setup for Windows (PowerShell).
# Usage: powershell -ExecutionPolicy Bypass -File scripts\setup.ps1 [-Check]
[CmdletBinding()]
param(
    [switch]$Check
)

$ErrorActionPreference = 'Continue'

$Extensions = @('GitHub.copilot', 'GitHub.copilot-chat')
$MinNodeMajor = 20

function Write-Info($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "WARN: $msg" -ForegroundColor Yellow }
function Test-Cmd($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }

function Update-SessionPath {
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = "$HOME\.local\bin;$machine;$user"
}

function Test-Admin {
    $id = [Security.Principal.WindowsIdentity]::GetCurrent()
    (New-Object Security.Principal.WindowsPrincipal $id).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-Winget($id) {
    Write-Info "Installing (winget): $id"
    winget install --id $id -e --source winget --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) { Write-Warn "winget install failed for $id (exit $LASTEXITCODE)" }
    Update-SessionPath
}

# Recent VS Code versions bundle Copilot as a built-in extension that --list-extensions does not report.
function Test-CopilotBuiltin {
    $cmd = Get-Command 'code' -ErrorAction SilentlyContinue
    if (-not $cmd) { return $false }
    $root = Split-Path (Split-Path $cmd.Source -Parent) -Parent
    if (Test-Path (Join-Path $root 'resources\app\extensions\copilot')) { return $true }
    # Newer installs place resources under a commit-hash folder.
    $hit = Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue |
        Where-Object { Test-Path (Join-Path $_.FullName 'resources\app\extensions\copilot') } |
        Select-Object -First 1
    return [bool]$hit
}

function Install-Tools {
    if (-not (Test-Cmd 'winget')) {
        Write-Error 'winget is required. Install or update "App Installer" from Microsoft Store and run this script again.'
        exit 1
    }

    if (-not (Test-Cmd 'git')) { Install-Winget 'Git.Git' }
    if (-not (Test-Cmd 'code')) { Install-Winget 'Microsoft.VisualStudioCode' }

    if (-not (Test-Cmd 'py')) {
        Write-Warn 'Python not found. Install "Python 3.12" from Microsoft Store, then run this script again.'
    }

    if (-not (Test-Cmd 'node')) {
        if (-not (Test-Admin)) {
            Write-Warn 'Node.js installation may require an administrator PowerShell.'
        }
        Install-Winget 'OpenJS.NodeJS.LTS'
    }

    if (-not (Test-Cmd 'uvx')) {
        Write-Info 'Installing uv'
        powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
        Update-SessionPath
    }

    if (-not (Test-Cmd 'openspec')) {
        if (Test-Cmd 'npm') {
            Write-Info 'Installing OpenSpec (npm)'
            npm install -g '@fission-ai/openspec@latest'
            if ($LASTEXITCODE -ne 0) { Write-Warn 'OpenSpec installation failed' }
            Update-SessionPath
        } else {
            Write-Warn 'Skipping OpenSpec: npm is not available.'
        }
    }

    if (Test-CopilotBuiltin) {
        Write-Info 'GitHub Copilot is built into this VS Code version'
    } elseif (Test-Cmd 'code') {
        $installed = @(code --list-extensions 2>$null)
        foreach ($ext in $Extensions) {
            if ($installed -notcontains $ext) {
                Write-Info "Installing VS Code extension $ext"
                code --install-extension $ext
                if ($LASTEXITCODE -ne 0) { Write-Warn "Failed to install $ext" }
            }
        }
    } else {
        Write-Warn "Skipping VS Code extensions: 'code' is not on PATH."
    }
}

$Results = New-Object System.Collections.Generic.List[object]

function Add-Result($state, $name, $detail) {
    $Results.Add([pscustomobject]@{ Status = $state; Check = $name; Detail = $detail })
}

function Test-Tool($name, $exe, [string[]]$arguments) {
    if (-not (Test-Cmd $exe)) {
        Add-Result 'FAIL' $name 'not found'
        return
    }
    $out = @(& $exe @arguments 2>$null)[0]
    if ($LASTEXITCODE -eq 0) {
        Add-Result 'OK' $name "$out"
    } else {
        Add-Result 'FAIL' $name "exit code $LASTEXITCODE"
    }
}

function Invoke-Verify {
    Update-SessionPath
    Write-Info 'Verifying installation'
    Test-Tool 'git' 'git' @('--version')
    Test-Tool 'code' 'code' @('--version')
    Test-Tool 'python (py)' 'py' @('--version')
    Test-Tool 'node' 'node' @('--version')
    if (Test-Cmd 'node') {
        $major = [int](node -p "process.versions.node.split('.')[0]")
        if ($major -lt $MinNodeMajor) {
            Add-Result 'WARN' "node >= $MinNodeMajor" "found $(node --version); OpenSpec may need a newer Node.js"
        }
    }
    Test-Tool 'npm' 'npm' @('--version')
    Test-Tool 'npx' 'npx' @('--version')
    Test-Tool 'uvx' 'uvx' @('--version')
    Test-Tool 'mcp-atlassian' 'uvx' @('mcp-atlassian', '--help')
    Test-Tool 'openspec' 'openspec' @('--version')

    if (Test-CopilotBuiltin) {
        Add-Result 'OK' 'GitHub Copilot' 'built into VS Code'
    } elseif (Test-Cmd 'code') {
        $installed = @(code --list-extensions 2>$null)
        foreach ($ext in $Extensions) {
            if ($installed -contains $ext) { Add-Result 'OK' $ext 'installed' }
            else { Add-Result 'FAIL' $ext 'not installed' }
        }
    } else {
        Add-Result 'FAIL' 'VS Code extensions' "'code' not available"
    }

    $Results | Format-Table -AutoSize | Out-String | Write-Host

    if ($Results.Status -contains 'FAIL') {
        Write-Warn 'Some checks failed. Fix them (see docs\setup.md) and run: powershell -ExecutionPolicy Bypass -File scripts\setup.ps1 -Check'
        exit 1
    }
    Write-Info 'All checks passed. Restart your terminal if any tool was just installed.'
}

Write-Info 'Detected OS: windows'
if (-not $Check) { Install-Tools }
Invoke-Verify
