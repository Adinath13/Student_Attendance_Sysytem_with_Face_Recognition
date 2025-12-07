import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        default: 'present'
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        required: true
    },
    imageUrl: {
        type: String,
        default: null
    },
    sessionId: {
        type: String,
        required: true
    },
    sessionName: {
        type: String,
        default: 'Regular Class'
    },
    subject: {
        type: String,
        trim: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    markedBy: {
        type: String,
        enum: ['face-recognition', 'manual', 'system'],
        default: 'face-recognition'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
attendanceSchema.index({ student: 1, timestamp: -1 });
attendanceSchema.index({ sessionId: 1 });
attendanceSchema.index({ studentId: 1, timestamp: -1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
