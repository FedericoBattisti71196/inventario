# Deploy Inventario sul VPS via SSH.
# Uso:
#   1. Copia deploy.config.example -> deploy.config e compila i valori
#   2. Assicurati che SSH funzioni: ssh DEPLOY_USER@DEPLOY_HOST
#   3. Prima volta sul server: clona il repo in DEPLOY_PATH e (opzionale) installa i unit systemd
#   4. Da Windows, nella root del progetto:
#        .\deploy.ps1
#      Opzioni: -SkipPush  -SkipBuildEnv

[CmdletBinding()]
param(
    [switch]$SkipPush,
    [switch]$SkipBuildEnv
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$ConfigPath = Join-Path $Root "deploy.config"

if (-not (Test-Path $ConfigPath)) {
    Write-Error "Manca deploy.config. Copia deploy.config.example in deploy.config e personalizzalo."
}

function Get-DeployConfig {
    param([string]$Path)
    $map = @{}
    Get-Content -Path $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) { return }
        $parts = $line.Split("=", 2)
        if ($parts.Count -eq 2) {
            $map[$parts[0].Trim()] = $parts[1].Trim()
        }
    }
    return $map
}

$cfg = Get-DeployConfig -Path $ConfigPath
foreach ($key in @("DEPLOY_HOST", "DEPLOY_USER", "DEPLOY_PATH", "DEPLOY_BRANCH", "VITE_API_URL")) {
    if (-not $cfg.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($cfg[$key])) {
        Write-Error "In deploy.config manca o e' vuoto: $key"
    }
}

$HostName = $cfg["DEPLOY_HOST"]
$User = $cfg["DEPLOY_USER"]
$RemotePath = $cfg["DEPLOY_PATH"]
$Branch = $cfg["DEPLOY_BRANCH"]
$ViteApiUrl = $cfg["VITE_API_URL"]
$PushBefore = ($cfg["PUSH_BEFORE_DEPLOY"] -eq "true")
$Target = "${User}@${HostName}"

Write-Host "==> Target: $Target:$RemotePath (branch $Branch)"

if ($PushBefore -and -not $SkipPush) {
    Write-Host "==> git push origin $Branch"
    Push-Location $Root
    try {
        git push origin $Branch
        if ($LASTEXITCODE -ne 0) { throw "git push fallito (exit $LASTEXITCODE)" }
    }
    finally {
        Pop-Location
    }
}

$remoteEnv = "DEPLOY_BRANCH='$Branch' VITE_API_URL='$ViteApiUrl'"
if ($SkipBuildEnv) {
    $remoteEnv = "DEPLOY_BRANCH='$Branch'"
}

$remoteCmd = @"
set -euo pipefail
cd '$RemotePath'
chmod +x scripts/remote-deploy.sh
$remoteEnv bash scripts/remote-deploy.sh
"@

Write-Host "==> SSH deploy remoto..."
ssh $Target $remoteCmd
if ($LASTEXITCODE -ne 0) {
    throw "Deploy remoto fallito (exit $LASTEXITCODE)"
}

Write-Host "==> Deploy OK."
