@echo off
title Vehicle E-Commerce Stopper
color 0C
echo ========================================================
echo   Stopping All Vehicle Commerce Services...
echo ========================================================
echo.

echo [1/2] Stopping Go Backend API...
taskkill /F /IM api.exe >nul 2>&1

echo [2/2] Stopping Frontend Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo ========================================================
echo   ALL SERVICES STOPPED SUCCESSFULLY.
echo ========================================================
pause
