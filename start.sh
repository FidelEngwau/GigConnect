#!/bin/bash
# Quick start script for GigConnect

echo "Starting GigConnect Backend and Frontend..."

# Function to open terminal and run command
run_backend() {
    cd jobconnect-backend-main/jobconnect-backend-main
    echo "Starting backend on port 5000..."
    npm run dev
}

run_frontend() {
    cd jobconnect-frontend-main/jobconnect-frontend-main
    echo "Starting frontend on port 5173..."
    npm run dev
}

# Start both in background
run_backend &
BACKEND_PID=$!

run_frontend &
FRONTEND_PID=$!

echo ""
echo "✓ Backend running on http://localhost:5000"
echo "✓ Frontend running on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
