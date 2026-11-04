# stop.ps1 - Stop All Services
Write-Host "Stopping Go Backend API (api.exe)..." -ForegroundColor Yellow
Get-Process -Name "api" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Stopping Next.js Frontend (node.exe)..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "All Vehicle Commerce services have been stopped." -ForegroundColor Green
