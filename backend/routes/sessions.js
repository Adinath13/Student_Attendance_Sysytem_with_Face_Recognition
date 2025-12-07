import express from 'express';
import Session from '../models/Session.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/sessions
// @desc    Create a new session (lecture/practical)
// @access  Private (Teacher only)
router.post('/', protect, authorize('teacher'), async (req, res) => {
    try {
        const { subject, type, department, year, className, duration } = req.body;

        const session = await Session.create({
            teacher: req.user._id,
            subject,
            type,
            department,
            year,
            className,
            duration,
            maxAttendees: 100, // Fixed as per requirement
            isActive: true
        });

        res.status(201).json({
            success: true,
            session
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating session',
            error: error.message
        });
    }
});

// @route   GET /api/sessions/today
// @desc    Get all sessions for the logged-in teacher created today
// @access  Private (Teacher only)
router.get('/today', protect, authorize('teacher'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const sessions = await Session.find({
            teacher: req.user._id,
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: sessions.length,
            sessions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sessions',
            error: error.message
        });
    }
});

// @route   PUT /api/sessions/:id/end
// @desc    End a session
// @access  Private (Teacher only)
router.put('/:id/end', protect, authorize('teacher'), async (req, res) => {
    try {
        const session = await Session.findOne({
            _id: req.params.id,
            teacher: req.user._id
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        session.isActive = false;
        await session.save();

        res.json({
            success: true,
            message: 'Session ended successfully',
            session
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error ending session',
            error: error.message
        });
    }
});

// @route   GET /api/sessions/:id
// @desc    Get session details by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        res.json({
            success: true,
            session
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching session',
            error: error.message
        });
    }
});

export default router;
