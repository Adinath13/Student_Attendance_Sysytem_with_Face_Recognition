import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['lecture', 'practical'],
        required: true,
        default: 'lecture'
    },
    department: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    className: {
        type: String, // e.g., "A", "B"
        default: 'A'
    },
    duration: {
        type: Number, // in minutes or hours
        default: 60
    },
    isActive: {
        type: Boolean,
        default: true
    },
    maxAttendees: {
        type: Number,
        default: 100
    },
    attendeesCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;
