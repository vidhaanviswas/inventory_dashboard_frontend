// src/pages/LoadingScreen.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LoadingScreen.css';

export default function LoadingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000); // ~1.2 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="loading-page">
      <div className="loading-orbit">
        <div className="loading-core" />
        <div className="loading-ring loading-ring-1" />
        <div className="loading-ring loading-ring-2" />
      </div>

      <div className="loading-text-block">
        <div className="loading-logo">
          <span className="loading-logo-dot" />
          <span>Inventory Hub</span>
        </div>
        <p className="loading-title">Preparing your dashboard…</p>
        <p className="loading-subtitle">Syncing modules and checking sessions.</p>

        <div className="loading-progress">
          <div className="loading-progress-bar" />
        </div>
      </div>
    </div>
  );
}
