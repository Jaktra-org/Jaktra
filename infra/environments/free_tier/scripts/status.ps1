
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envDir = Resolve-Path "$scriptDir\.."

Set-Location $envDir

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "          JAKTRA FREE-TIER INFRASTRUCTURE STATUS        " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$frontendUrl = (terraform output -raw frontend_url 2>$null)
if (-not $frontendUrl) { $frontendUrl = "https://jaktra-frontend.vercel.app" }

$backendUrl = (terraform output -raw backend_url 2>$null)
if (-not $backendUrl) { $backendUrl = "https://jaktra-backend.onrender.com" }

$aiUrl = (terraform output -raw ai_service_url 2>$null)
if (-not $aiUrl) { $aiUrl = "https://jaktra-ai-service.onrender.com" }

$redisEp = (terraform output -raw redis_endpoint 2>$null)
if (-not $redisEp) { $redisEp = "N/A" }

Write-Host "`n[1/4] VERCEL FRONTEND" -ForegroundColor Cyan
Write-Host "  • URL:                 $frontendUrl" -ForegroundColor Green
Write-Host "  • Monthly Cost:        `$0.00 / month (Free Tier)" -ForegroundColor Green

Write-Host "`n[2/4] RENDER BACKEND API" -ForegroundColor Cyan
Write-Host "  • URL:                 $backendUrl" -ForegroundColor Green
try {
    $res = Invoke-WebRequest -Uri "$backendUrl/api/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "  • Health (/api/health): $($res.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  • Health (/api/health): PENDING/WARMING UP" -ForegroundColor Yellow
}
Write-Host "  • Monthly Cost:        `$0.00 / month (Free Tier)" -ForegroundColor Green

Write-Host "`n[3/4] RENDER AI SERVICE" -ForegroundColor Cyan
Write-Host "  • URL:                 $aiUrl" -ForegroundColor Green
try {
    $res = Invoke-WebRequest -Uri "$aiUrl/health" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "  • Health (/health):    $($res.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  • Health (/health):    PENDING/WARMING UP" -ForegroundColor Yellow
}
Write-Host "  • Monthly Cost:        `$0.00 / month (Free Tier)" -ForegroundColor Green

Write-Host "`n[4/4] UPSTASH SERVERLESS REDIS" -ForegroundColor Cyan
Write-Host "  • Endpoint:            $redisEp" -ForegroundColor Green
Write-Host "  • Monthly Cost:        `$0.00 / month (Free 10k req/day)" -ForegroundColor Green

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  TOTAL ESTIMATED CLOUD BILL: `$0.00 / month" -ForegroundColor Green
Write-Host "========================================================`n" -ForegroundColor Cyan
