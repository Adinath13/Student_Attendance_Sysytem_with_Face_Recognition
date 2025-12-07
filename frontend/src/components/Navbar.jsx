import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">⚡</span>
                    <span className="logo-text">Antigravity Attendance</span>
                </Link>

                <div className="navbar-menu">
                    <Link to="/" className="navbar-link">
                        Dashboard
                    </Link>

                    {user?.role === 'student' && !user?.faceRegistered && (
                        <Link to="/register-face" className="navbar-link navbar-link-highlight">
                            Register Face
                        </Link>
                    )}

                    {user?.role === 'teacher' && (
                        <Link to="/attendance" className="navbar-link">
                            Mark Attendance
                        </Link>
                    )}

                    <div className="navbar-user">
                        <div className="user-info">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                        <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
