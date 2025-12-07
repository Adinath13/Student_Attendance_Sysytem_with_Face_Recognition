import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// @route   POST /api/users
// @desc    Create a new user (Admin only)
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, email, password, role, department, year, studentId } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
            department,
            year,
            studentId
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin, Teacher)
router.get('/', protect, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password');

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
});

// @route   POST /api/users/register-face
// @desc    Register face encoding for user
// @access  Private
router.post('/register-face', protect, async (req, res) => {
    try {
        const { imageData } = req.body;

        if (!imageData) {
            return res.status(400).json({
                success: false,
                message: 'Image data is required'
            });
        }

        // Call Python face recognition service to generate encoding
        const response = await axios.post(`${process.env.FACE_RECOGNITION_API}/encode`, {
            image: imageData
        });

        if (!response.data.success) {
            return res.status(400).json({
                success: false,
                message: response.data.message || 'Failed to generate face encoding'
            });
        }

        const { encoding } = response.data;

        // Update user with face encoding
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                faceEncoding: encoding,
                faceRegistered: true,
                updatedAt: Date.now()
            },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Face registered successfully',
            user
        });
    } catch (error) {
        console.error('Face registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering face',
            error: error.response?.data?.message || error.message
        });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or own profile)
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, department, year, studentId } = req.body;

        // Check if user is updating their own profile or is admin
        if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this user'
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (department) updateData.department = department;
        if (year) updateData.year = year;
        if (studentId) updateData.studentId = studentId;
        updateData.updatedAt = Date.now();

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

export default router;
