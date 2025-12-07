import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { motion } from 'framer-motion';
import './RegisterFace.css';

const RegisterFace = () => {
    const [stream, setStream] = useState(null);
    const [capturing, setCapturing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
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
            setError('Failed to access camera. Please allow camera permissions.');
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

    const handleRegisterFace = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        setCapturing(true);

        try {
            const imageData = captureImage();

            if (!imageData) {
                setError('Failed to capture image');
                setLoading(false);
                setCapturing(false);
                return;
            }

            const response = await api.post('/users/register-face', { imageData });

            if (response.data.success) {
                setMessage('Face registered successfully!');
                updateUser(response.data.user);
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register face');
        } finally {
            setLoading(false);
            setTimeout(() => setCapturing(false), 500);
        }
    };

    return (
        <div className="register-face-container">
            <div className="container">
                <motion.div
                    className="register-face-card glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="register-face-header">
                        <h1>Register Your Face</h1>
                        <p>Position your face in the center of the camera for biometric registration</p>
                    </div>

                    {error && (
                        <motion.div
                            className="alert alert-error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {message && (
                        <motion.div
                            className="alert alert-success"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {message}
                        </motion.div>
                    )}

                    <div className="camera-container">
                        <div className={`camera-frame ${capturing ? 'capturing' : ''}`}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="camera-video"
                            />
                            <div className="face-overlay">
                                <div className="face-guide"></div>
                            </div>
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </div>
                    </div>

                    <div className="register-face-actions">
                        <button
                            onClick={handleRegisterFace}
                            className="btn btn-primary btn-lg"
                            disabled={loading || !stream}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    📸 Capture & Register
                                </>
                            )}
                        </button>

                        {user?.faceRegistered && (
                            <button
                                onClick={() => navigate('/')}
                                className="btn btn-secondary"
                            >
                                Skip to Dashboard
                            </button>
                        )}
                    </div>

                    <div className="register-face-tips">
                        <h3>Tips for best results:</h3>
                        <ul>
                            <li>✓ Ensure good lighting on your face</li>
                            <li>✓ Look directly at the camera</li>
                            <li>✓ Remove glasses if possible</li>
                            <li>✓ Keep a neutral expression</li>
                            <li>✓ Make sure only your face is visible</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterFace;
