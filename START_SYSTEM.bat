@echo off
echo ============================================================
echo Starting Indian Traffic Accident Prediction System
echo ============================================================
echo.

echo Starting Backend API on http://localhost:5000...
start "Backend API" cmd /k "python api/production_app.py"

timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend on http://localhost:3000...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================================
echo System Started!
echo ============================================================
echo.
echo Backend API: http://localhost:5000
echo Frontend:    http://localhost:3000
echo.
echo Press any key to stop all services...
pause >nul

echo.
echo Stopping services...
taskkill /FI "WINDOWTITLE eq Backend API*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend*" /T /F >nul 2>&1

echo Services stopped.
