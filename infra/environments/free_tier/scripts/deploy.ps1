# =============================================================================
# Jaktra Free-Tier One-Command Deployer (PowerShell)
# =============================================================================
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envDir = Resolve-Path "$scriptDir\.."

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ">>> Jaktra FREE-TIER -- Deploying All Live Services" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

Set-Location $envDir

if (-not (Test-Path "terraform.tfvars")) {
    Write-Error "terraform.tfvars file not found in $envDir"
    exit 1
}

Write-Host ""
Write-Host "[1/3] Initializing Terraform..." -ForegroundColor Cyan
terraform init -input=false

Write-Host ""
Write-Host "[2/3] Validating Configuration..." -ForegroundColor Cyan
terraform validate

Write-Host ""
Write-Host "[3/3] Deploying Upstash Redis, Render Backend, Render AI Service, and Vercel Frontend..." -ForegroundColor Cyan
terraform apply -auto-approve

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "DEPLOYMENT SUCCESSFUL -- All services are live!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
terraform output
