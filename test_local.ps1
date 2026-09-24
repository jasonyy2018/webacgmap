# test_local.ps1
# PowerShell script to test GMAPKDev local services

Write-Host "Testing GMAPKDev Local Services..." -ForegroundColor Cyan

# 1. Test Database Connectivity
Write-Host "`n[1/3] Testing Database Connectivity..." -ForegroundColor Yellow
$TestDbCommand = {
    cd "$($using:PSScriptRoot)\backend"
    if (Test-Path "venv") {
        .\venv\Scripts\python.exe test_db.py
    } else {
        python test_db.py
    }
}
powershell -Command $TestDbCommand

# 2. Test Backend Health (Needs Backend Running)
Write-Host "`n[2/3] Testing Backend Health (http://localhost:8000/)..." -ForegroundColor Yellow
try {
    $RootResponse = Invoke-RestMethod -Uri "http://localhost:8000/" -Method Get -ErrorAction Stop
    $RootStatus = $RootResponse.status
    Write-Host "Success: Root API is $RootStatus" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Backend is not running or unreachable at http://localhost:8000/" -ForegroundColor Red
    Write-Host "Please make sure to run ./run_local.ps1 first." -ForegroundColor Gray
}

# 3. Test Backend Debug Status
Write-Host "`n[3/3] Testing Backend Debug Status (http://localhost:8000/debug/status)..." -ForegroundColor Yellow
try {
    $DebugResponse = Invoke-RestMethod -Uri "http://localhost:8000/debug/status" -Method Get -ErrorAction Stop
    Write-Host "API Key Configured: $($DebugResponse.api_key_configured)" -ForegroundColor White
    Write-Host "Maps Service Active: $($DebugResponse.maps_service_active)" -ForegroundColor White
    Write-Host "AI Service Active:   $($DebugResponse.ai_service_active)" -ForegroundColor White
    
    if ($DebugResponse.api_key_configured -eq $true) {
        Write-Host "Success: Services are configured correctly." -ForegroundColor Green
    } else {
        Write-Host "WARNING: Google API Key is not configured or too short." -ForegroundColor Yellow
    }
} catch {
    Write-Host "FAILED: Debug endpoint unreachable." -ForegroundColor Red
}

Write-Host "`n--------------------------------------------------" -ForegroundColor Yellow
Write-Host "Testing Complete." -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
