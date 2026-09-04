@echo off
title DropGuard Launcher
echo ========================================================
echo   DropGuard - Starting Local Presentation Environment
echo ========================================================
echo.

echo [1/2] Starting Backend Server (FastAPI on http://127.0.0.1:8000)...
start "DropGuard Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --reload --port 8000"

echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server (Next.js on http://localhost:3000)...
start "DropGuard Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Waiting 5 seconds for frontend to build...
timeout /t 5 /nobreak >nul

echo Opening DropGuard in your default browser...
start http://localhost:3000

echo.
echo ========================================================
echo   DropGuard is running!
echo.
echo   Frontend:         http://localhost:3000
echo   Backend Swagger:  http://localhost:8000/docs
echo.
echo   Demo Credentials:
echo     Admin:     admin / admin123
echo     Teacher:   teacher / teacher123
echo     Counselor: counselor / counselor123
echo ========================================================
echo.
pause
