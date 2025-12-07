#!/bin/bash

echo "Starting Antigravity Attendance Management System..."
echo ""

echo "[1/3] Starting Python Face Recognition Service..."
cd face-recognition-service
python app.py &
PYTHON_PID=$!
cd ..
sleep 3

echo "[2/3] Starting Node.js Backend API..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..
sleep 3

echo "[3/3] Starting React Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "Services running at:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:3000"
echo "- Face Recognition: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for Ctrl+C
trap "kill $PYTHON_PID $BACKEND_PID $FRONTEND_PID; exit" INT
wait
