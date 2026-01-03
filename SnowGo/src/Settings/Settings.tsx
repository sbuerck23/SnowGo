import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './Settings.css';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="settings-container">
      <div className="settings-content">
        <div className="settings-header">
          <button className="back-button" onClick={() => navigate(-1)} title="Go back">
            ← Back
          </button>
          <h1 className="settings-title">Settings</h1>
        </div>
        
        <div className="settings-section">
          <h2 className="section-title">Appearance</h2>
          
          <div className="theme-selector">
            <label className="theme-label">Theme</label>
            <div className="theme-options">
              <button
                className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <div className="theme-icon">☀️</div>
                <span>Light</span>
              </button>
              
              <button
                className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <div className="theme-icon">🌙</div>
                <span>Dark</span>
              </button>
            </div>
            <p className="theme-description">
              Choose your preferred theme. Your selection will be saved and synced across devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
