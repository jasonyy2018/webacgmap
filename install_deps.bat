@echo off
title GMAPKDev - Dependency Installer
echo Installing dependencies for GMAPKDev...

:: Backend
echo.
echo [1/2] Setting up Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
echo Installing python requirements...
venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..

:: Frontend
echo.
echo [2/2] Setting up Frontend...
cd frontend
echo Installing npm packages...
call npm install
cd ..

echo.
echo --------------------------------------------------
echo Installation complete!
echo You can now run the system using run_local.bat
echo --------------------------------------------------
pause
