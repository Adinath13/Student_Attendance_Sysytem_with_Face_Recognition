import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import axios from 'axios';
import Session from '../models/Session.js';
import mongoose from 'mongoose';

const router = express.Router();

// @route   POST /api/attendance/mark
// @desc    Mark attendance using face recognition
// @access  Public (for kiosk mode) or Private
router.post('/mark', async (req, res) => {
    try {
        const { imageData, sessionId, sessionName, subject } = req.body;

        if (!imageData || !sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Image data and session ID are required'
            });
        }

        // Get all users with registered faces
        const users = await User.find({ faceRegistered: true, role: 'student' });

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No registered students found'
            });
        }

        // Prepare encodings for matching
        const encodings = users.map(user => ({
            userId: user._id,
            studentId: user.studentId,
            name: user.name,
            encoding: user.faceEncoding
        }));

        // Call Python face recognition service
        const response = await axios.post(`${process.env.FACE_RECOGNITION_API}/match`, {
            image: imageData,
            encodings: encodings
        });

        if (!response.data.success) {
            return res.status(400).json({
                success: false,
                message: response.data.message || 'Face recognition failed'
            });
        }

        const { match, confidence } = response.data;

        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'No matching face found. Please register your face first.'
            });
        }

        // Check if attendance already marked for this session
        const existingAttendance = await Attendance.findOne({
            student: match.userId,
            sessionId: sessionId
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'Attendance already marked for this session',
                attendance: existingAttendance
            });
        }

        // Create attendance record
        const attendance = await Attendance.create({
            student: match.userId,
            studentId: match.studentId,
            studentName: match.name,
            sessionId,
            sessionName: sessionName || 'Regular Class',
            subject,
            confidence,
            status: 'present',
            markedBy: 'face-recognition'
        });

        // Increment session attendee count if it's a valid session ID (not manual)
        if (sessionId.length === 24) { // Assumption: Mongo ID length
            try {
                // Dynamic import to avoid circular dependency if any, or just use mongoose model
                const Session = mongoose.model('Session');
                await Session.findByIdAndUpdate(sessionId, { $inc: { attendeesCount: 1 } });
            } catch (err) {
                console.log("Error updating session count", err);
            }
        }

        res.status(201).json({
            success: true,
            message: `Attendance marked successfully for ${match.name}`,
            attendance,
            confidence
        });
    } catch (error) {
        console.error('Attendance marking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking attendance',
            error: error.response?.data?.message || error.message
        });
    }
});

// @route   GET /api/attendance/student/:id
// @desc    Get attendance history for a student
// @access  Private
router.get('/student/:id', protect, async (req, res) => {
    try {
        const { startDate, endDate, limit = 50 } = req.query;

        let query = { student: req.params.id };

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const attendance = await Attendance.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        const totalClasses = attendance.length;
        const presentCount = attendance.filter(a => a.status === 'present').length;
        const percentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;

        res.json({
            success: true,
            count: attendance.length,
            attendance,
            statistics: {
                totalClasses,
                present: presentCount,
                absent: totalClasses - presentCount,
                percentage
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance',
            error: error.message
        });
    }
});

// @route   GET /api/attendance/session/:sessionId
// @desc    Get attendance for a specific session
// @access  Private (Teacher, Admin)
router.get('/session/:sessionId', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const attendance = await Attendance.find({ sessionId: req.params.sessionId })
            .populate('student', 'name email studentId department year')
            .sort({ timestamp: -1 });

        res.json({
            success: true,
            count: attendance.length,
            attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching session attendance',
            error: error.message
        });
    }
});

// @route   GET /api/attendance/analytics
// @desc    Get attendance analytics
// @access  Private (Teacher, Admin)
router.get('/analytics', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { startDate, endDate, department, year } = req.query;

        let userQuery = { role: 'student' };
        if (department) userQuery.department = department;
        if (year) userQuery.year = parseInt(year);

        const students = await User.find(userQuery);
        const studentIds = students.map(s => s._id);

        let attendanceQuery = { student: { $in: studentIds } };
        if (startDate || endDate) {
            attendanceQuery.timestamp = {};
            if (startDate) attendanceQuery.timestamp.$gte = new Date(startDate);
            if (endDate) attendanceQuery.timestamp.$lte = new Date(endDate);
        }

        const attendanceRecords = await Attendance.find(attendanceQuery);

        // Calculate statistics
        const totalRecords = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
        const overallPercentage = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(2) : 0;

        // Group by student
        const studentStats = students.map(student => {
            const studentAttendance = attendanceRecords.filter(
                a => a.student.toString() === student._id.toString()
            );
            const total = studentAttendance.length;
            const present = studentAttendance.filter(a => a.status === 'present').length;
            const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

            return {
                studentId: student.studentId,
                name: student.name,
                department: student.department,
                year: student.year,
                totalClasses: total,
                present,
                absent: total - present,
                percentage
            };
        });

        // Group by date
        const dateStats = {};
        attendanceRecords.forEach(record => {
            const date = record.timestamp.toISOString().split('T')[0];
            if (!dateStats[date]) {
                dateStats[date] = { date, present: 0, total: 0 };
            }
            dateStats[date].total++;
            if (record.status === 'present') {
                dateStats[date].present++;
            }
        });

        const dailyStats = Object.values(dateStats).map(stat => ({
            ...stat,
            percentage: ((stat.present / stat.total) * 100).toFixed(2)
        }));

        res.json({
            success: true,
            analytics: {
                overall: {
                    totalRecords,
                    present: presentCount,
                    absent: totalRecords - presentCount,
                    percentage: overallPercentage
                },
                byStudent: studentStats,
                byDate: dailyStats
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
});

export default router;
