@echo off
REM Complete startup script for JobConnect (Backend + Frontend)
REM This script sets up the database and starts both servers

echo.
echo ========================================
echo    JobConnect Complete Startup
echo ========================================
echo.

setlocal enabledelayedexpansion

REM Paths
set BACKEND_PATH=C:\Users\FYDO\Desktop\GigConnect\jobconnect-backend-main\jobconnect-backend-main
set FRONTEND_PATH=C:\Users\FYDO\Desktop\GigConnect\jobconnect-frontend-main\jobconnect-frontend-main
set SETUP_SCRIPT=C:\Users\FYDO\Desktop\GigConnect\setup-database.ps1

echo [1/4] Setting up database...
powershell -NoProfile -ExecutionPolicy Bypass -File "%SETUP_SCRIPT%"

if errorlevel 1 (
    echo.
    echo ERROR: Database setup failed. Please check your MySQL installation.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/4] Waiting for database initialization...
timeout /t 2 /nobreak

echo.
echo [3/4] Starting Backend Server (port 5000)...
echo Backend is starting in a new window...
start "JobConnect Backend" cmd /k "cd /d %BACKEND_PATH% && npm run dev"

echo.
echo [4/4] Starting Frontend Server (port 5173)...
echo Frontend is starting in a new window...
timeout /t 3 /nobreak
start "JobConnect Frontend" cmd /k "cd /d %FRONTEND_PATH% && npm run dev"

echo.
echo ========================================
echo    Servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press ENTER to continue...
pause

echo.
echo Opening frontend in browser...
timeout /t 3 /nobreak
start http://localhost:5173
