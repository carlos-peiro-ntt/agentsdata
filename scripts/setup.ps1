# Workshop setup for Windows (PowerShell).
# Usage: powershell -ExecutionPolicy Bypass -File setup.ps1 [-Check]
[CmdletBinding()]
param(
    [switch]$Check,
    [string]$ProjectDir = "$HOME\agentsdata-workshop"
)

$ErrorActionPreference = 'Continue'

$Extensions = @('GitHub.copilot', 'GitHub.copilot-chat')
$CodexExtension = 'openai.chatgpt'
$MinNodeMajor = 22
$MinNodeMinor = 20
$McpAtlassianVersion = '0.24.8'
$PythonVersion = '3.12'

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

    if (-not (Test-Cmd 'code')) { Install-Winget 'Microsoft.VisualStudioCode' }

    if (-not (Test-Cmd 'node')) {
        if (-not (Test-Admin)) {
            Write-Warn 'Node.js installation may require an administrator PowerShell.'
        }
        Install-Winget 'OpenJS.NodeJS.LTS'
    }

    if (-not (Test-Cmd 'git')) {
        Install-Winget 'Git.Git'
    }

    if (-not (Test-Cmd 'uvx')) {
        Write-Info 'Installing uv'
        powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
        Update-SessionPath
    }


    if (Test-Cmd 'code') {
        $wanted = @($CodexExtension)
        if (Test-CopilotBuiltin) {
            Write-Info 'GitHub Copilot is built into this VS Code version'
        } else {
            $wanted += $Extensions
        }
        $installed = @(code --list-extensions 2>$null)
        foreach ($ext in $wanted) {
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

function Install-ProjectDependencies {
    New-Item -ItemType Directory -Force $ProjectDir | Out-Null
    $package = @'
{
  "name": "agentsdata-workshop",
  "private": true,
  "engines": {
    "node": ">=22.20.0"
  },
  "dependencies": {
    "@fission-ai/openspec": "2.1.1",
    "skills": "1.9.0"
  }
}
'@
    Set-Content -Path (Join-Path $ProjectDir 'package.json') -Value $package -Encoding utf8
    Write-Info "Installing workshop dependencies in $ProjectDir"
    Push-Location $ProjectDir
    npm.cmd install --registry=https://registry.npmjs.org/
    $code = $LASTEXITCODE
    Pop-Location
    if ($code -ne 0) { Write-Error 'Workshop npm dependencies failed'; exit 1 }
}

function Invoke-Verify {
    Update-SessionPath
    Write-Info 'Verifying installation'
    Test-Tool 'code' 'code' @('--version')
    Test-Tool 'node' 'node' @('--version')
    if (Test-Cmd 'node') {
        $parts = @(node -p "process.versions.node" ).Split('.')
        $major = [int]$parts[0]
        $minor = [int]$parts[1]
        if ($major -lt $MinNodeMajor -or ($major -eq $MinNodeMajor -and $minor -lt $MinNodeMinor)) {
            Add-Result 'FAIL' "node >= $MinNodeMajor.$MinNodeMinor" "found $(node --version); update Node manually"
        } else {
            Add-Result 'OK' "node >= $MinNodeMajor.$MinNodeMinor" "$(node --version)"
        }
    }
    Test-Tool 'git' 'git' @('--version')
    Test-Tool 'npm' 'npm.cmd' @('--version')
    Test-Tool 'uvx' 'uvx' @('--version')
    if (Test-Cmd 'uv') {
        $pythonOutput = @(& uv python install $PythonVersion 2>&1)
        if ($LASTEXITCODE -eq 0) {
            $pythonPath = @(& uv python find $PythonVersion 2>$null)[0]
            if ($pythonPath) { Add-Result 'OK' "python $PythonVersion" $pythonPath } else { Add-Result 'FAIL' "python $PythonVersion" 'uv could not resolve Python' }
        } else {
            Add-Result 'FAIL' "python $PythonVersion" 'uv could not install Python'
        }
    } else {
        Add-Result 'FAIL' "python $PythonVersion" 'uv not available'
    }
    if (Test-Cmd 'uvx') {
        $mcpOutput = @(& uvx --python $PythonVersion "mcp-atlassian==$McpAtlassianVersion" --help 2>&1 | Out-String)
        if ($LASTEXITCODE -eq 0) {
            Add-Result 'OK' 'mcp-atlassian' 'installed and working'
        } elseif ($mcpOutput -match 'Microsoft Visual C\+\+ 14\.0|PyYAML|pyyaml') {
            Add-Result 'FAIL' 'mcp-atlassian' 'PyYAML/MSVC build failed; install C++ Build Tools and rerun setup'
        } else {
            Add-Result 'FAIL' 'mcp-atlassian' 'uvx package check failed'
        }
    } else {
        Add-Result 'FAIL' 'mcp-atlassian' 'uvx not found'
    }
    if (Test-Path (Join-Path $ProjectDir 'package.json')) {
        Push-Location $ProjectDir
        $openspec = @(& npm.cmd exec -- openspec --version 2>$null)[0]
        $openspecOk = $LASTEXITCODE -eq 0
        Pop-Location
        if ($openspecOk -and $openspec) { Add-Result 'OK' 'openspec (local)' $openspec } else { Add-Result 'FAIL' 'openspec (local)' 'not available' }
        $skillsBin = Join-Path $ProjectDir 'node_modules\.bin\skills.cmd'
        if (Test-Path $skillsBin) { Add-Result 'OK' 'skills (local)' '1.9.0' } else { Add-Result 'FAIL' 'skills (local)' 'not available' }
    } else {
        Add-Result 'WARN' 'workshop dependencies' "run setup once to create $ProjectDir"
    }

    if (Test-Cmd 'code') {
        $wanted = @($CodexExtension)
        if (Test-CopilotBuiltin) {
            Add-Result 'OK' 'GitHub Copilot' 'built into VS Code'
        } else {
            $wanted += $Extensions
        }
        $installed = @(code --list-extensions 2>$null)
        foreach ($ext in $wanted) {
            if ($installed -contains $ext) { Add-Result 'OK' $ext 'installed' }
            else { Add-Result 'FAIL' $ext 'not installed' }
        }
    } else {
        Add-Result 'FAIL' 'VS Code extensions' "'code' not available"
    }

    $Results | Format-Table -AutoSize | Out-String | Write-Host

    if ($Results.Status -contains 'FAIL') {
        Write-Warn 'Some checks failed. Fix them (see https://github.com/carlos-peiro-ntt/agentsdata/blob/main/docs/part-1/setup.md) and run: powershell -ExecutionPolicy Bypass -File setup.ps1 -Check'
        exit 1
    }
    Write-Info 'All checks passed. Restart your terminal if any tool was just installed.'
}

Write-Info 'Detected OS: windows'
if (-not $Check) {
    Install-Tools
    Install-ProjectDependencies
}
Invoke-Verify
