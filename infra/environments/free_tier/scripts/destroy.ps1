$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envDir = Resolve-Path "$scriptDir\.."

Write-Host "`n========================================================" -ForegroundColor Red
Write-Host ">>> Jaktra FREE-TIER — Destroying All Resources" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Red

Set-Location $envDir
terraform destroy -auto-approve

Write-Host "`n✓ Free-tier resources destroyed successfully! ($0 bill maintained)" -ForegroundColor Green
