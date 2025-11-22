import { useState, useEffect, useRef } from 'react';
import '../css/SettingsPage.css';

export default function SettingsPage() {
  const [name, setName] = useState('Vidhaan Viswas');
  const [email, setEmail] = useState('you@example.com');
  const [theme, setTheme] = useState('dark');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fileInputRef = useRef(null);

  // Load settings from localStorage on first render
  useEffect(() => {
    try {
      const storedName = localStorage.getItem('settings:name');
      const storedEmail = localStorage.getItem('settings:email');
      const storedTheme = localStorage.getItem('settings:theme');
      const storedPhoto = localStorage.getItem('settings:photo');

      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedTheme) setTheme(storedTheme);
      if (storedPhoto) setPhoto(storedPhoto);
    } catch {
      // ignore errors
    }
  }, []);

  // Apply theme (including "system")
  useEffect(() => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      document.body.dataset.theme = prefersDark ? 'dark' : 'light';
    } else {
      document.body.dataset.theme = theme;
    }
  }, [theme]);

  function handleSaveProfile(e) {
    e.preventDefault();

    try {
      localStorage.setItem('settings:name', name);
      localStorage.setItem('settings:email', email);
      localStorage.setItem('settings:theme', theme);
    } catch {
      // ignore
    }

    setMessage('Profile updated successfully.');
    setTimeout(() => setMessage(''), 2000);
  }

  function handlePhotoClick() {
    fileInputRef.current?.click();
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      setPhoto(result);
      try {
        localStorage.setItem('settings:photo', result);
      } catch {
        // ignore
      }
    };
    reader.readAsDataURL(file);
  }

  function handlePasswordSave(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password should be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    // NOTE: This is only UI demo, not a real password change.
    setPasswordMessage('Password updated (demo only, not saved securely).');

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      setPasswordMessage('');
      setPasswordError('');
    }, 2000);
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Profile card with avatar & upload */}
        <div className="settings-profile-card">
          <div className="settings-avatar">
            {photo ? (
              <img src={photo} alt="Profile" />
            ) : (
              (name ? name[0] : 'U').toUpperCase()
            )}
          </div>

          <div className="settings-profile-info">
            <div className="settings-profile-name">{name}</div>
            <div className="settings-profile-email">{email}</div>

            <button
              type="button"
              className="settings-photo-btn"
              onClick={handlePhotoClick}
            >
              Change photo
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
          </div>
        </div>

        {/* Account preferences */}
        <div className="settings-card">
          <h2 className="settings-card-title">Account Preferences</h2>

          <form className="settings-form" onSubmit={handleSaveProfile}>
            <label className="settings-field">
              <span>Full Name</span>
              <input
                className="settings-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="settings-field">
              <span>Email Address</span>
              <input
                className="settings-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="settings-field">
              <span>Theme</span>
              <div className="settings-theme-toggle">
                <button
                  type="button"
                  className={`theme-pill ${
                    theme === 'dark' ? 'active' : ''
                  }`}
                  onClick={() => setTheme('dark')}
                >
                  🌙 Dark
                </button>
                <button
                  type="button"
                  className={`theme-pill ${
                    theme === 'light' ? 'active' : ''
                  }`}
                  onClick={() => setTheme('light')}
                >
                  ☀️ Light
                </button>
                <button
                  type="button"
                  className={`theme-pill ${
                    theme === 'system' ? 'active' : ''
                  }`}
                  onClick={() => setTheme('system')}
                >
                  💻 System
                </button>
              </div>
            </label>

            {message && (
              <div className="settings-success settings-success-animate">
                {message}
              </div>
            )}

            <button type="submit" className="settings-save-btn">
              Save Changes
            </button>
          </form>
        </div>

        {/* Change password section */}
        <div className="settings-card">
          <h2 className="settings-card-title">Security</h2>

          <form className="settings-form" onSubmit={handlePasswordSave}>
            <label className="settings-field">
              <span>Current Password</span>
              <input
                className="settings-input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </label>

            <label className="settings-field">
              <span>New Password</span>
              <input
                className="settings-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>

            <label className="settings-field">
              <span>Confirm New Password</span>
              <input
                className="settings-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>

            {passwordError && (
              <div className="settings-error settings-success-animate">
                {passwordError}
              </div>
            )}
            {passwordMessage && (
              <div className="settings-success settings-success-animate">
                {passwordMessage}
              </div>
            )}

            <button
              type="submit"
              className="settings-save-btn settings-save-btn-secondary"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
