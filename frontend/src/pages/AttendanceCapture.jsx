import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import './AttendanceCapture.css';

const AttendanceCapture = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { session } = location.state || {}; // Expecting session object from navigation

    const [stream, setStream] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [recentAttendants, setRecentAttendants] = useState([]);
    const [scanCount, setScanCount] = useState(0);
    const [error, setError] = useState('');
    const [lastScannedResult, setLastScannedResult] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const scanIntervalRef = useRef(null);

    useEffect(() => {
        if (!session) {
            // Fallback for direct access without session - redirect to dashboard or show error
            // For now, allow manual entry but warn
            console.warn("No session provided via navigation");
        }
        startCamera();
        return () => {
            stopCamera();
            stopScanning();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError('Failed to access camera');
            console.error('Camera error:', err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const captureImage = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (!canvas || !video) return null;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        return canvas.toDataURL('image/jpeg', 0.8);
    };

    const markAttendance = async () => {
        const imageData = captureImage();
        if (!imageData) return;

        try {
            const response = await api.post('/attendance/mark', {
                imageData,
                sessionId: session?._id || 'MANUAL_SESSION',
                sessionName: session?.subject ? `${session.subject} (${session.type})` : 'Manual Session',
                subject: session?.subject || 'Unknown'
            });

            if (response.data.success) {
                const newAttendant = {
                    id: response.data.attendance._id,
                    name: response.data.attendance.studentName,
                    time: new Date().toLocaleTimeString(),
                    status: 'Present'
                };

                setRecentAttendants(prev => [newAttendant, ...prev].slice(0, 10)); // Keep last 10
                setScanCount(prev => prev + 1);
                setLastScannedResult({ success: true, message: `Marked: ${newAttendant.name}` });

                // Optional: Play a sound
            }
        } catch (err) {
            // If already marked, that's fine, just show it
            if (err.response?.status === 400 && err.response?.data?.message?.includes('already marked')) {
                setLastScannedResult({ success: true, message: "Already Marked", info: true });
            } else {
                // Silent fail for no face found during continuous scan to keep it running
                if (err.response?.status !== 404) {
                    console.error("Scan error:", err);
                }
            }
        }
    };

    const startScanning = () => {
        setIsScanning(true);
        // "100 faces" rapid scan logic: scan every 2 seconds
        scanIntervalRef.current = setInterval(() => {
            markAttendance();
        }, 2000);
    };

    const stopScanning = () => {
        setIsScanning(false);
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
    };

    const toggleScanning = () => {
        if (isScanning) {
            stopScanning();
        } else {
            startScanning();
        }
    };

    const handleEndSession = async () => {
        stopScanning();
        if (session && session._id) {
            try {
                await api.put(`/sessions/${session._id}/end`);
            } catch (err) {
                console.error("Error ending session", err);
            }
        }
        navigate('/dashboard'); // Go back to teacher dashboard
    };

    return (
        <div className="attendance-capture-container">
            <div className="container">
                <div className="capture-layout">
                    {/* Left Side: Camera */}
                    <motion.div
                        className="camera-panel glass-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="panel-header">
                            <h2>📸 Live Scanner</h2>
                            <div className="session-badge">
                                {session ? `${session.subject} - ${session.type}` : 'Manual Session'}
                            </div>
                        </div>

                        <div className="camera-frame-wrapper">
                            <div className={`camera-frame ${isScanning ? 'scanning' : ''}`}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="camera-video"
                                />
                                {isScanning && <div className="scan-line-anim"></div>}
                            </div>
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </div>

                        <div className="controls-row">
                            <button
                                onClick={toggleScanning}
                                className={`btn btn-lg ${isScanning ? 'btn-danger' : 'btn-primary'} btn-block`}
                                disabled={!stream}
                            >
                                {isScanning ? '⏸ Pause Scanning' : '⚡ Start Rapid Scan'}
                            </button>

                            <button
                                onClick={handleEndSession}
                                className="btn btn-secondary btn-lg btn-block"
                            >
                                ⏹ End Session
                            </button>
                        </div>

                        <div className="scan-status">
                            <p>Faces Scanned: {scanCount} / {session?.maxAttendees || 100}</p>
                            {lastScannedResult && (
                                <div className={`status-pill ${lastScannedResult.info ? 'info' : 'success'}`}>
                                    {lastScannedResult.message}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Side: Log */}
                    <motion.div
                        className="log-panel glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3>📝 Live Log</h3>
                        <div className="attendants-list">
                            <AnimatePresence>
                                {recentAttendants.map((student, index) => (
                                    <motion.div
                                        key={`${student.id}-${index}`}
                                        className="attendant-item"
                                        initial={{ opacity: 0, y: -20, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="attendant-avatar">{student.name.charAt(0)}</div>
                                        <div className="attendant-info">
                                            <h4>{student.name}</h4>
                                            <span>{student.time}</span>
                                        </div>
                                        <div className="attendant-status">Present</div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {recentAttendants.length === 0 && (
                                <div className="empty-state">
                                    <p>Waiting for students...</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceCapture;

