import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion } from 'framer-motion';
import './Dashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // New User Form State
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'teacher',
        department: '',
        year: ''
    });

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'teachers' || activeTab === 'students') {
            fetchUsers(activeTab === 'teachers' ? 'teacher' : 'student');
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/attendance/analytics');
            setStats(res.data.analytics.overall);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (role) => {
        setLoading(true);
        try {
            const res = await api.get(`/users?role=${role}`);
            if (res.data.success) {
                setUsers(res.data.users);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/users', newUser);
            if (res.data.success) {
                alert('User created successfully!');
                setShowCreateModal(false);
                setNewUser({ name: '', email: '', password: '', role: 'teacher', department: '', year: '' });
                // Refresh list if applicable
                if ((activeTab === 'teachers' && newUser.role === 'teacher') ||
                    (activeTab === 'students' && newUser.role === 'student')) {
                    fetchUsers(newUser.role);
                }
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete user');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>Admin Dashboard 🛡️</h1>
                        <p>Principal Control Center</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setNewUser({ ...newUser, role: 'teacher' });
                                setShowCreateModal(true);
                            }}
                        >
                            + Add Teacher
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                    <button
                        className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`btn ${activeTab === 'teachers' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('teachers')}
                    >
                        Manage Teachers
                    </button>
                    <button
                        className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('students')}
                    >
                        View Students
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {activeTab === 'overview' && stats && (
                        <div className="stats-grid">
                            <div className="stat-card glass-card">
                                <div className="stat-icon">📈</div>
                                <div>
                                    <h3>Attendance Rate</h3>
                                    <p className="stat-value">{stats.percentage}%</p>
                                </div>
                            </div>
                            <div className="stat-card glass-card">
                                <div className="stat-icon">📚</div>
                                <div>
                                    <h3>Total Records</h3>
                                    <p className="stat-value">{stats.totalRecords}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'teachers' || activeTab === 'students') && (
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3>{activeTab === 'teachers' ? 'Teachers List' : 'Students List'}</h3>
                            {loading ? <div className="spinner"></div> : (
                                <div className="table-container">
                                    <table className="attendance-table" style={{ width: '100%', marginTop: '1rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Department</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user._id}>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.department || '-'}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                                                            onClick={() => handleDeleteUser(user._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {users.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No users found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Create User Modal */}
                {showCreateModal && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div className="glass-card" style={{ padding: '2rem', width: '500px', maxWidth: '90%' }}>
                            <h2>Add New {newUser.role === 'teacher' ? 'Teacher' : 'Student'}</h2>
                            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" className="input" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" className="input" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" className="input" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required minLength="6" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input type="text" className="input" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <select className="input" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                            <option value="teacher">Teacher</option>
                                            <option value="student">Student</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create User</button>
                                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
