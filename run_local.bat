@echo off
setlocal enabledelayedexpansion
title GMAPKDev - Smart Map Customer Development System
echo Starting GMAPKDev...

:: 0. Clean up existing processes on the ports
echo [1/3] Cleaning up existing processes on ports 8000 and 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    echo Killing process %%a on port 8000
    taskkill /f /pid %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    echo Killing process %%a on port 5173
    taskkill /f /pid %%a 2>nul
)

:: 1. Start Backend
echo [2/3] Launching Backend (FastAPI)...
start "GMAPKDev Backend" cmd /k "cd backend && (if exist venv\Scripts\python.exe (venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0) else (python -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0))"

:: 2. Start Frontend
echo [3/3] Launching Frontend (Vite)...
start "GMAPKDev Frontend" cmd /k "cd frontend && npx vite --port 5173 --host 0.0.0.0"

echo.
echo --------------------------------------------------
echo System is starting!
echo.
echo Frontend:    http://localhost:5173
echo Backend API: http://localhost:8000
echo API Docs:    http://localhost:8000/docs
echo --------------------------------------------------
echo.
echo Note: If searching doesn't work, ensure your .env has a valid GOOGLE_API_KEY.
echo.
echo Press any key to close this launcher (services will keep running).
pause
