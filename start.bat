@echo off
REM Start GigConnect Backend and Frontend on Windows

echo Starting GigConnect...
echo.

REM Start Backend
cd /D "%~dp0jobconnect-backend-main\jobconnect-backend-main"
echo Starting Backend on port 5000...
start cmd /k npm run dev

timeout /t 2

REM Start Frontend
cd /D "%~dp0jobconnect-frontend-main\jobconnect-frontend-main"
echo Starting Frontend on port 5173...
start cmd /k npm run dev

timeout /t 2

echo.
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================
echo Open http://localhost:5173 in your browser
