#!/bin/bash

echo "Installing Smart Map Dev System dependencies..."

# Backend
echo "Setting up Backend..."
cd backend
if [ ! -d "venv" ]; then
    python -m venv venv
fi
source venv/Scripts/activate || source venv/bin/activate
pip install -r requirements.txt

# Frontend
echo "Setting up Frontend..."
cd ../frontend
npm install

echo "Dependencies installed successfully!"
