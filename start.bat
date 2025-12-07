@echo off
echo Starting Antigravity Attendance Management System...
echo.

echo [1/3] Starting Python Face Recognition Service...
start cmd /k "cd face-recognition-service && python app.py"
timeout /t 3 /nobreak > nul

echo [2/3] Starting Node.js Backend API...
start cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

echo [3/3] Starting React Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo ✅ All services started!
echo.
echo Services running at:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:3000
echo - Face Recognition: http://localhost:5000
echo.
echo Press any key to exit this window (services will continue running)...
pause > nul
