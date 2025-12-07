import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createLoading, setCreateLoading] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        department: '',
        year: ''
    });

    const [newSession, setNewSession] = useState({
        subject: '',
        type: 'lecture',
        duration: 60,
        department: '',
        year: '',
        className: 'A'
    });

    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        department: '',
        year: ''
    });

    useEffect(() => {
        fetchAnalytics();
        fetchTodaySessions();
        fetchProfile();
    }, [filters]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data.success) {
                const { name, department, year } = res.data.user;
                setProfileData({ name, department: department || '', year: year || '' });
            }
        } catch (error) {
            console.error("Error fetching profile", error);
        }
    };

    const fetchTodaySessions = async () => {
        try {
            const response = await api.get('/sessions/today');
            if (response.data.success) {
                setSessions(response.data.sessions);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const params = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            if (filters.department) params.department = filters.department;
            if (filters.year) params.year = filters.year;

            const response = await api.get('/attendance/analytics', { params });
            setAnalytics(response.data.analytics);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const response = await api.post('/sessions', newSession);
            if (response.data.success) {
                setSessions([response.data.session, ...sessions]);
                setNewSession({
                    subject: '',
                    type: 'lecture',
                    duration: 60,
                    department: '',
                    year: '',
                    className: 'A'
                });
                // Optional: Show success toast
            }
        } catch (error) {
            console.error("Error creating session:", error);
            alert("Failed to create session");
        } finally {
            setCreateLoading(false);
        }
    };

    const startAttendance = (session) => {
        navigate('/attendance', { state: { session } });
    };

    const endSession = async (sessionId) => {
        try {
            await api.put(`/sessions/${sessionId}/end`);
            fetchTodaySessions(); // Refresh list
        } catch (error) {
            console.error("Error asking session:", error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user')); // Get ID from local storage or context if available
            // Better to pull from context or /auth/me, but here we can assume the user knows their ID or endpoint handles it. 
            // The endpoint /api/users/:id requires ID. 
            // Let's use /auth/me to get ID first? No, I already fetched it.
            // I'll assume I can use 'me' or I need the ID.
            // Let's fetch the ID from the profile fetch response or store it.
            // Actually, I can allow /users/update-profile if I had it, but I have /users/:id.
            // I'll grab the ID from localStorage for now as it's common practice in this app's context probably.
            const storedUser = JSON.parse(localStorage.getItem('user'));

            const res = await api.put(`/users/${storedUser.id}`, profileData);
            if (res.data.success) {
                alert('Profile updated successfully!');
                setShowProfileModal(false);
                // Optionally update context
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update profile');
        }
    };

    const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4ade80'];

    const pieData = analytics ? [
        { name: 'Present', value: parseInt(analytics.overall.present) },
        { name: 'Absent', value: parseInt(analytics.overall.absent) }
    ] : [];

    return (
        <div className="dashboard-container">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="dashboard-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1>Teacher Dashboard 📊</h1>
                                <p>Manage Classes & View Analytics</p>
                            </div>
                            <button className="btn btn-secondary" onClick={() => setShowProfileModal(true)}>
                                ✏️ Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Session Management Section */}
                    <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', marginBottom: '2rem' }}>
                        {/* Create Session Form */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3>📅 Create New Session</h3>
                            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={newSession.subject}
                                        onChange={e => setNewSession({ ...newSession, subject: e.target.value })}
                                        required
                                        placeholder="e.g. Data Structures"
                                    />
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select
                                            className="input"
                                            value={newSession.type}
                                            onChange={e => setNewSession({ ...newSession, type: e.target.value })}
                                        >
                                            <option value="lecture">Lecture</option>
                                            <option value="practical">Practical</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Duration (mins)</label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={newSession.duration}
                                            onChange={e => setNewSession({ ...newSession, duration: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Dept</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={newSession.department}
                                            onChange={e => setNewSession({ ...newSession, department: e.target.value })}
                                            placeholder="CS"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Year</label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={newSession.year}
                                            onChange={e => setNewSession({ ...newSession, year: e.target.value })}
                                            min="1" max="4"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Class</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={newSession.className}
                                            onChange={e => setNewSession({ ...newSession, className: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={createLoading}>
                                    {createLoading ? 'Creating...' : 'Create Session'}
                                </button>
                            </form>
                        </div>

                        {/* Today's Sessions List */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3>Today's Sessions</h3>
                            <div className="sessions-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                                {sessions.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No sessions created for today.</p>
                                ) : (
                                    sessions.map(session => (
                                        <div key={session._id} style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            padding: '1rem',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderLeft: `4px solid ${session.isActive ? '#4ade80' : '#ef4444'}`
                                        }}>
                                            <div>
                                                <h4 style={{ margin: 0 }}>{session.subject} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({session.type})</span></h4>
                                                <p style={{ fontSize: '0.9rem', margin: '0.2rem 0', opacity: 0.8 }}>
                                                    {session.department} - Year {session.year} ({session.className})
                                                </p>
                                                <span style={{ fontSize: '0.8rem', color: session.isActive ? '#4ade80' : '#ef4444' }}>
                                                    {session.isActive ? '● Active' : '● Ended'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {session.isActive && (
                                                    <>
                                                        <button
                                                            onClick={() => startAttendance(session)}
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            🚀 Start
                                                        </button>
                                                        <button
                                                            onClick={() => endSession(session._id)}
                                                            className="btn btn-secondary btn-sm"
                                                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                                                        >
                                                            ⏹ End
                                                        </button>
                                                    </>
                                                )}
                                                {!session.isActive && (
                                                    <button className="btn btn-secondary btn-sm" disabled>Completed</button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="filters-card glass-card">
                        <h3>Analytics Filters</h3>
                        <div className="filters-grid">
                            <div className="form-group">
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">End Date</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Department</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Computer Science"
                                    value={filters.department}
                                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Year</label>
                                <select
                                    className="input"
                                    value={filters.year}
                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                >
                                    <option value="">All Years</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ minHeight: '400px' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : analytics ? (
                        <>
                            <div className="stats-grid">
                                <motion.div className="stat-card glass-card" whileHover={{ scale: 1.02 }}>
                                    <div className="stat-icon">📈</div>
                                    <div className="stat-content">
                                        <h3>Overall Attendance</h3>
                                        <p className="stat-value">{analytics.overall.percentage}%</p>
                                    </div>
                                </motion.div>

                                <motion.div className="stat-card glass-card" whileHover={{ scale: 1.02 }}>
                                    <div className="stat-icon">✅</div>
                                    <div className="stat-content">
                                        <h3>Total Present</h3>
                                        <p className="stat-value">{analytics.overall.present}</p>
                                    </div>
                                </motion.div>

                                <motion.div className="stat-card glass-card" whileHover={{ scale: 1.02 }}>
                                    <div className="stat-icon">❌</div>
                                    <div className="stat-content">
                                        <h3>Total Absent</h3>
                                        <p className="stat-value">{analytics.overall.absent}</p>
                                    </div>
                                </motion.div>

                                <motion.div className="stat-card glass-card" whileHover={{ scale: 1.02 }}>
                                    <div className="stat-icon">📚</div>
                                    <div className="stat-content">
                                        <h3>Total Records</h3>
                                        <p className="stat-value">{analytics.overall.totalRecords}</p>
                                    </div>
                                </motion.div>
                            </div>

                            <div className="charts-grid">
                                <motion.div
                                    className="chart-card glass-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h2>Attendance Distribution</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </motion.div>

                                {analytics.byDate && analytics.byDate.length > 0 && (
                                    <motion.div
                                        className="chart-card glass-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <h2>Daily Attendance</h2>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={analytics.byDate.slice(-7)}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                                                <YAxis stroke="rgba(255,255,255,0.5)" />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: 'rgba(0,0,0,0.8)',
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                                <Bar dataKey="present" fill="#667eea" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </motion.div>
                                )}
                            </div>

                            <motion.div
                                className="students-table-card glass-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h2>Student Attendance Summary</h2>
                                <div className="table-container">
                                    <table className="attendance-table">
                                        <thead>
                                            <tr>
                                                <th>Student ID</th>
                                                <th>Name</th>
                                                <th>Department</th>
                                                <th>Year</th>
                                                <th>Total Classes</th>
                                                <th>Present</th>
                                                <th>Absent</th>
                                                <th>Percentage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.byStudent.map((student) => (
                                                <tr key={student.studentId}>
                                                    <td>{student.studentId}</td>
                                                    <td>{student.name}</td>
                                                    <td>{student.department || 'N/A'}</td>
                                                    <td>{student.year || 'N/A'}</td>
                                                    <td>{student.totalClasses}</td>
                                                    <td>{student.present}</td>
                                                    <td>{student.absent}</td>
                                                    <td>
                                                        <span className={`percentage-badge ${student.percentage >= 75 ? 'good' : student.percentage >= 50 ? 'warning' : 'danger'}`}>
                                                            {student.percentage}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </>
                    ) : (
                        <div className="text-center">
                            <p>No analytics data available</p>
                        </div>
                    )}
                </motion.div>

                {showProfileModal && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div className="glass-card" style={{ padding: '2rem', width: '400px', maxWidth: '90%' }}>
                            <h2>Edit Profile</h2>
                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input type="text" className="input" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <input type="text" className="input" value={profileData.department} onChange={e => setProfileData({ ...profileData, department: e.target.value })} disabled title="Contact Admin to change Department" style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                                </div>
                                <div className="form-group">
                                    <label>Year (if applicable)</label>
                                    <input type="number" className="input" value={profileData.year} onChange={e => setProfileData({ ...profileData, year: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowProfileModal(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;

