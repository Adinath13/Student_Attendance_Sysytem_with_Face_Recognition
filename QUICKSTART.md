# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ Python 3.8+ installed (`python --version`)
- ✅ MongoDB Atlas connection string configured
- ✅ Camera/webcam available for face recognition

## 🏃 Quick Start (Windows)

Simply double-click `start.bat` in the project root directory. This will:
1. Start the Python Face Recognition Service (Port 5000)
2. Start the Node.js Backend API (Port 3000)
3. Start the React Frontend (Port 5173)

## 🏃 Quick Start (Linux/Mac)

```bash
chmod +x start.sh
./start.sh
```

## 📝 Manual Start

### 1. Start Python Face Recognition Service

```bash
cd face-recognition-service
pip install -r requirements.txt
python app.py
```

Service will run on: `http://localhost:5000`

### 2. Start Node.js Backend

```bash
cd backend
npm install
npm run dev
```

API will run on: `http://localhost:3000`

### 3. Start React Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 🎯 First Time Setup

### Step 1: Create Admin Account
1. Open browser to `http://localhost:5173`
2. Click "Register"
3. Fill in details:
   - Name: Admin User
   - Email: admin@example.com
   - Password: admin123
   - Role: **Admin**
4. Click Register

### Step 2: Register Your Face (Optional for Admin)
1. After registration, you'll be redirected to face registration
2. Allow camera access
3. Position your face in the guide
4. Click "Capture & Register"

### Step 3: Create Test Students
1. Register 2-3 test student accounts
2. Use role: **Student**
3. Provide Student IDs (e.g., STU001, STU002)
4. Register faces for each student

### Step 4: Test Attendance Marking
1. Login as Teacher or Admin
2. Navigate to "Mark Attendance"
3. Set session details
4. Have students position face in camera
5. Click "Scan & Mark Attendance"
6. Verify attendance is recorded

### Step 5: View Analytics
1. Login as Teacher/Admin
2. View dashboard with charts and statistics
3. Filter by date, department, year
4. Export reports as needed

## 🔧 Troubleshooting

### Camera Not Working
- Ensure browser has camera permissions
- Try using HTTPS or localhost
- Check if another app is using the camera

### Face Recognition Service Error
```bash
# Install dlib dependencies (if needed)
pip install cmake
pip install dlib
pip install face_recognition
```

### MongoDB Connection Error
- Verify MongoDB connection string in `backend/.env`
- Check network connectivity
- Ensure MongoDB Atlas IP whitelist includes your IP

### Port Already in Use
- Change ports in respective `.env` files:
  - Backend: `PORT=3001` in `backend/.env`
  - Python: `FLASK_PORT=5001` in `face-recognition-service/.env`
  - Frontend: Update in `vite.config.js`

## 📊 Default Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 3000 | http://localhost:3000 |
| Face Recognition | 5000 | http://localhost:5000 |

## 🎨 Demo Credentials

After setup, you can create these test accounts:

**Admin:**
- Email: admin@example.com
- Password: admin123
- Role: Admin

**Teacher:**
- Email: teacher@example.com
- Password: teacher123
- Role: Teacher

**Student:**
- Email: student@example.com
- Password: student123
- Role: Student
- Student ID: STU001

## 📱 Features to Test

### Student Features
- ✅ Register account
- ✅ Register face biometrics
- ✅ View personal attendance
- ✅ Check attendance percentage
- ✅ View attendance history

### Teacher Features
- ✅ Mark attendance via face scan
- ✅ View class analytics
- ✅ Filter attendance by date/department
- ✅ View student performance
- ✅ Export attendance reports

### Admin Features
- ✅ All teacher features
- ✅ User management
- ✅ System-wide analytics
- ✅ Manage student/teacher accounts

## 🎯 Next Steps

1. **Production Deployment:**
   - Deploy backend to Heroku/Railway/Render
   - Deploy frontend to Vercel/Netlify
   - Deploy Python service to PythonAnywhere/Railway
   - Update CORS and API URLs

2. **Security Enhancements:**
   - Enable HTTPS
   - Add rate limiting
   - Implement liveness detection
   - Add audit logging

3. **Feature Additions:**
   - Email notifications
   - SMS alerts for low attendance
   - Mobile app (React Native)
   - Bulk attendance import/export
   - QR code backup authentication

## 💡 Tips

- **Best Lighting:** Ensure good lighting for face recognition
- **Camera Quality:** Higher quality camera = better recognition
- **Face Registration:** Register face in different lighting conditions
- **Confidence Threshold:** Adjust in `face-recognition-service/.env` (default: 0.6)

## 🆘 Support

For issues or questions:
1. Check the main README.md
2. Review error logs in terminal
3. Verify all services are running
4. Check browser console for frontend errors

---

**Ready to go!** 🚀 Start the system and begin marking attendance with antigravity-powered face recognition!
