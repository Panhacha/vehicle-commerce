@echo off
title Vehicle E-Commerce Launcher (Supabase Cloud DB)
color 0B
echo ========================================================
echo   Vehicle E-commerce and Multi-Branch Management System
echo           STARTING SERVICES (Supabase Powered)
echo ========================================================
echo.

:: 0. Auto-detect Node.js / npm path if not in standard PATH
if exist "C:\node.exe" set "PATH=C:\;%PATH%"
if exist "C:\Program Files\nodejs\node.exe" set "PATH=C:\Program Files\nodejs;%PATH%"

:: Check prerequisites
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js / npm is not recognized or not in your PATH!
    echo Please install Node.js or ensure it is added to your PATH.
    echo.
    pause
    exit /b 1
)

:: 1. Build and start the Go Backend API from the current source
echo [1/2] Starting Go Backend API (Port 8080)...
cd /d "%~dp0backend"
go build -o api.exe ./cmd/api
if errorlevel 1 (
    echo Backend build failed. Close any running api.exe, then retry.
    pause
    exit /b 1
)
start "Vehicle Commerce - Go Backend" cmd /k "api.exe"

:: 2. Start Next.js Frontend
echo [2/2] Starting Next.js Frontend (Port 3000)...
cd /d "%~dp0frontend"
start "Vehicle Commerce - Next.js" cmd /k "if exist C:\node.exe set PATH=C:\;%%PATH%%& cd /d %~dp0frontend & npm run dev"

:: Wait 3 seconds then open browser
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================================
echo   ALL SERVICES ARE RUNNING! (NO DOCKER NEEDED)
echo   - Customer Showroom and Admin: http://localhost:3000
echo   - Go Backend REST API:         http://localhost:8080/api/v1
echo   - Cloud Database:              Supabase (Managed PostgreSQL)
echo ========================================================
echo   To stop all services, run: stop.bat
echo ========================================================
exit /b 0
