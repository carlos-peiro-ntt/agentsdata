# Prompts for the workshop tokens and opens VS Code with them in its environment only.
# Usage: powershell -ExecutionPolicy Bypass -File setup-secrets.ps1 [-ProjectDir <folder>]
[CmdletBinding()]
param(
    [string]$ProjectDir = (Join-Path $HOME 'agentsdata-workshop')
)

$ErrorActionPreference = 'Stop'

function Fail($msg) { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

function Read-Secret($prompt) {
    $secure = Read-Host $prompt -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $value = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
    if ([string]::IsNullOrEmpty($value)) { Fail "Empty value for: $prompt" }
    $value
}

if (-not (Get-Command 'code' -ErrorAction SilentlyContinue)) {
    Fail "'code' is not on PATH. Run the setup script first (see docs/part-1/setup.md)."
}
if (-not (Test-Path -LiteralPath $ProjectDir -PathType Container)) {
    Fail "Project folder not found: $ProjectDir. Pass it with -ProjectDir."
}

# A running instance keeps its old environment and would ignore the new tokens.
if (Get-Process -Name 'Code' -ErrorAction SilentlyContinue) {
    Fail 'VS Code is running. Close every VS Code window and run this script again.'
}

$env:SUPABASE_ACCESS_TOKEN = Read-Secret 'Supabase token'
$env:CONFLUENCE_PERSONAL_TOKEN = Read-Secret 'Confluence token'

Write-Host "Opening VS Code in $ProjectDir. The tokens live only in that VS Code process and disappear when you close it."
code $ProjectDir
