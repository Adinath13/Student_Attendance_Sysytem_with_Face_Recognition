import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await api.get(`/attendance/student/${user.id}`);
            setAttendance(response.data.attendance);
            setStats(response.data.statistics);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = attendance.slice(0, 10).reverse().map(record => ({
        date: new Date(record.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        status: record.status === 'present' ? 1 : 0
    }));

    return (
        <div className="dashboard-container">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="dashboard-header">
                        <div>
                            <h1>Welcome back, {user.name}! 👋</h1>
                            <p>Student ID: {user.studentId}</p>
                        </div>

                        {!user.faceRegistered && (
                            <Link to="/register-face" className="btn btn-primary">
                                📸 Register Your Face
                            </Link>
                        )}
                    </div>

                    {!user.faceRegistered && (
                        <motion.div
                            className="alert alert-warning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            ⚠️ Please register your face to enable automatic attendance marking
                        </motion.div>
                    )}

                    {loading ? (
                        <div className="flex-center" style={{ minHeight: '400px' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <>
                            <div className="stats-grid">
                                <motion.div
                                    className="stat-card glass-card"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="stat-icon">📊</div>
                                    <div className="stat-content">
                                        <h3>Attendance Rate</h3>
                                        <p className="stat-value">{stats?.percentage || 0}%</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="stat-card glass-card"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="stat-icon">✅</div>
                                    <div className="stat-content">
                                        <h3>Classes Attended</h3>
                                        <p className="stat-value">{stats?.present || 0}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="stat-card glass-card"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="stat-icon">📚</div>
                                    <div className="stat-content">
                                        <h3>Total Classes</h3>
                                        <p className="stat-value">{stats?.totalClasses || 0}</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="stat-card glass-card"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="stat-icon">❌</div>
                                    <div className="stat-content">
                                        <h3>Classes Missed</h3>
                                        <p className="stat-value">{stats?.absent || 0}</p>
                                    </div>
                                </motion.div>
                            </div>

                            {attendance.length > 0 && (
                                <motion.div
                                    className="chart-card glass-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h2>Attendance Trend</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={chartData}>
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
                                            <Line
                                                type="monotone"
                                                dataKey="status"
                                                stroke="#667eea"
                                                strokeWidth={3}
                                                dot={{ fill: '#667eea', r: 5 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}

                            <motion.div
                                className="attendance-table-card glass-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2>Recent Attendance</h2>
                                {attendance.length === 0 ? (
                                    <p className="text-center text-muted">No attendance records yet</p>
                                ) : (
                                    <div className="table-container">
                                        <table className="attendance-table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Time</th>
                                                    <th>Session</th>
                                                    <th>Subject</th>
                                                    <th>Status</th>
                                                    <th>Confidence</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendance.slice(0, 10).map((record) => (
                                                    <tr key={record._id}>
                                                        <td>{new Date(record.timestamp).toLocaleDateString()}</td>
                                                        <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                                                        <td>{record.sessionName}</td>
                                                        <td>{record.subject || 'N/A'}</td>
                                                        <td>
                                                            <span className={`status-badge status-${record.status}`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td>{(record.confidence * 100).toFixed(1)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default StudentDashboard;
