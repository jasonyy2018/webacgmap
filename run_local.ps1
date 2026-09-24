# run_local.ps1
# Improved PowerShell script for better compatibility

Write-Host "Starting GMAPKDev - Smart Map Customer Development System..." -ForegroundColor Cyan

$CurrentDir = Get-Location

# 1. Start Backend
Write-Host "Launching Backend (FastAPI)..." -ForegroundColor Green
$BackendCommand = "cd '$CurrentDir\backend'; if (Test-Path 'venv\Scripts\python.exe') { .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000 } else { python -m uvicorn app.main:app --reload --port 8000 }"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $BackendCommand

# 2. Start Frontend
Write-Host "Launching Frontend (Vite)..." -ForegroundColor Green
$FrontendCommand = "cd '$CurrentDir\frontend'; npm run dev -- --port 5173"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $FrontendCommand

Write-Host "--------------------------------------------------" -ForegroundColor Yellow
Write-Host "System is starting!" -ForegroundColor Cyan
Write-Host "Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host "Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Yellow
pause
