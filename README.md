# 🚀 Antigravity Attendance Management System

A futuristic, contactless attendance management system powered by AI face recognition with an antigravity-themed interface.

THESE IS THE LINK OF PRODUCTION READY PROJECT : https://attendanceproject-3c8t.onrender.com
NOTE:The live demo is hosted on a free-tier cloud service and may enter a sleep state during periods of inactivity. If the application does not load on the first attempt, please allow a few moments for the server to restart and refresh the page.

## ✨ Features

- **🎯 Real-time Face Recognition**: Instant student identification using advanced facial recognition
- **⚡ Antigravity UI**: Futuristic interface with glassmorphism, floating elements, and smooth animations
- **📊 Analytics Dashboard**: Comprehensive attendance analytics for teachers and admins
- **🔐 Secure Authentication**: JWT-based authentication with role-based access control
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🎨 Modern Tech Stack**: React, Node.js, Python, MongoDB

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Vite + CSS)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Node.js API    │
│   (Express.js)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│MongoDB │ │Python Service│
│Database│ │Face Recognition│
└────────┘ └──────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **WebRTC** - Camera access

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Face Recognition Service
- **Python 3.x** - Runtime
- **Flask** - Web framework
- **face_recognition** - Face recognition library
- **OpenCV** - Computer vision
- **NumPy** - Numerical computing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd attendanceproject
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGODB_URI= //use your own
JWT_SECRET=antigravity_attendance_secret_key_2025_secure_token
FACE_RECOGNITION_API=http://localhost:5000
PORT=3000
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

### 3. Python Face Recognition Service Setup
```bash
cd face-recognition-service
pip install -r requirements.txt
```

Create `.env` file:
```env
FLASK_PORT=5000
CONFIDENCE_THRESHOLD=0.6
FLASK_ENV=development
```

Start the service:
```bash
python app.py
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend:
```bash
npm run dev
```

## 🚀 Usage

### For Students

1. **Register Account**
   - Navigate to `/register`
   - Fill in your details (name, email, student ID, etc.)
   - Create a password

2. **Register Face**
   - After registration, you'll be redirected to face registration
   - Allow camera access
   - Position your face in the guide
   - Click "Capture & Register"

3. **View Attendance**
   - Login to your dashboard
   - View attendance statistics
   - Check attendance history
   - See attendance trends

### For Teachers/Admins

1. **Mark Attendance**
   - Navigate to "Mark Attendance"
   - Set session details (Session ID, Name, Subject)
   - Students position their face in front of camera
   - Click "Scan & Mark Attendance"
   - System automatically identifies and marks attendance

2. **View Analytics**
   - Access comprehensive analytics dashboard
   - Filter by date range, department, year
   - View charts and statistics
   - Export attendance reports
   - Monitor individual student performance

## 🎨 Design Features

### Antigravity Theme
- **Floating Elements**: Components with levitation animations
- **Glassmorphism**: Frosted glass effect with backdrop blur
- **Particle System**: Animated particles suggesting antigravity field
- **Neon Accents**: Purple/blue neon highlights
- **Smooth Transitions**: Framer Motion animations

### Color Palette
- Primary: `#667eea` (Electric Blue)
- Secondary: `#764ba2` (Deep Purple)
- Accent: `#f093fb` (Neon Pink)
- Background: Deep space gradient
- Surface: Frosted glass with transparency

## 🔒 Security

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Protected Routes**: Role-based access control
- **Input Validation**: Server-side validation
- **CORS Protection**: Configured CORS policy
- **Biometric Privacy**: Face encodings stored securely

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin/Teacher)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/register-face` - Register face encoding
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/student/:id` - Get student attendance
- `GET /api/attendance/session/:sessionId` - Get session attendance
- `GET /api/attendance/analytics` - Get analytics (Teacher/Admin)

### Face Recognition Service
- `POST /encode` - Generate face encoding
- `POST /match` - Match face against encodings
- `POST /detect` - Detect faces in image

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Python Service
```bash
cd face-recognition-service
pytest
```

### Frontend
```bash
cd frontend
npm run build
```

## 📈 Performance

- **Face Recognition**: < 2 seconds response time
- **API Response**: < 500ms average
- **Frontend Load**: < 3 seconds initial load
- **Confidence Threshold**: 60% minimum for match

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Adinath Hanumant Gore

## 🙏 Acknowledgments

- face_recognition library by Adam Geitgey
- React team for amazing framework
- MongoDB for database solution
- All contributors and testers

---

Made with ⚡ and 💜
