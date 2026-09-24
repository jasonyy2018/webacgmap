#!/bin/bash

echo "Starting GMAPKDev - Smart Map Customer Development System..."

# Start Backend
echo "Launching Backend (FastAPI)..."
cd backend
if [ -d "venv" ]; then
    source venv/Scripts/activate || source venv/bin/activate
fi
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start Frontend
echo "Launching Frontend (Vite)..."
cd ../frontend
npm run dev -- --port 5173 &
FRONTEND_PID=$!

echo "--------------------------------------------------"
echo "System is running!"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "--------------------------------------------------"
echo "Press Ctrl+C to stop both services."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
