// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';
import '../css/LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactReason, setContactReason] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('auth:token', data.token);
      localStorage.setItem('auth:user', JSON.stringify(data.user));

      login();
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleForgotPassword() {
    navigate('/forgot-password');
  }

  // Open contact modal instead of public signup
  function handleRegister() {
    setShowContactModal(true);
    setContactMsg('');
  }

  function handleCloseModal() {
    setShowContactModal(false);
    setContactName('');
    setContactEmail('');
    setContactReason('');
    setContactMsg('');
  }

  function handleContactSubmit(e) {
    e.preventDefault();

    if (!contactName || !contactEmail || !contactReason) {
      setContactMsg('Please fill all fields before submitting.');
      return;
    }

    setContactMsg(
      'Your request has been captured. Please email admin at vv@gmail.com if it is urgent.'
    );

    // Optionally: window.location.href = `mailto:...`
  }

  // Dummy social login handler
  function handleSocialLogin(provider) {
    alert(
      `Social login with ${provider} is not wired yet.\nYou would redirect to ${provider} OAuth here.`
    );
  }

  return (
    <div className="login-page">
      {/* Left side – marketing / branding */}
      <div className="login-left">
        <div className="login-logo">
          <span className="login-logo-dot" />
          <span>Inventory Hub</span>
        </div>
        <h1 className="login-heading">
          Control your <span>inventory</span> from one place.
        </h1>
        <p className="login-subtitle">
          Track SKUs, inventory levels, purchase orders, and analytics across
          all your channels from a single, clean dashboard.
        </p>

        <div className="login-highlights">
          <div className="login-highlight-card">
            <p className="login-highlight-number">6</p>
            <p className="login-highlight-label">Core modules</p>
          </div>
          <div className="login-highlight-card">
            <p className="login-highlight-number">24/7</p>
            <p className="login-highlight-label">Visibility</p>
          </div>
          <div className="login-highlight-card">
            <p className="login-highlight-number">∞</p>
            <p className="login-highlight-label">Scalability</p>
          </div>
        </div>
      </div>

      {/* Right side – auth card */}
      <div className="login-right">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2 className="login-card-title">Sign in</h2>
          <p className="login-card-subtitle">
            Use your account to access the dashboard.
          </p>

          <label className="login-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <div className="login-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <div className="login-links-row">
            <button
              type="button"
              className="login-link-button"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          {/* Social login section */}
          <div className="login-social-section">
            <p className="login-social-label">Or continue with</p>
            <div className="login-social-row">
              <button
                type="button"
                className="login-social-btn login-social-google"
                onClick={() => handleSocialLogin('Google')}
              >
                {/* simple G icon */}
                <span className="login-social-icon">G</span>
                <span>Google</span>
              </button>
              <button
                type="button"
                className="login-social-btn login-social-github"
                onClick={() => handleSocialLogin('GitHub')}
              >
                <span className="login-social-icon">{"</>"}</span>
                <span>GitHub</span>
              </button>
            </div>
          </div>

          <div className="login-divider">
            <span></span>
            <p>or</p>
            <span></span>
          </div>

          <button
            type="button"
            className="login-secondary-btn"
            onClick={handleRegister}
          >
            Create new account
          </button>

          <p className="login-footer-text">
            Welcome to Inventory Hub. Manage your inventory efficiently.
          </p>
        </form>
      </div>

      {/* Contact Admin Modal */}
      {showContactModal && (
        <div className="login-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="login-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="login-modal-header">
              <h3>New account request</h3>
              <button
                type="button"
                className="login-modal-close"
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>

            <p className="login-modal-warning">
              Public signup is disabled. To create a new account, please contact
              the admin at <strong>vv@gmail.com</strong> or submit the form
              below.
            </p>

            <form className="login-modal-form" onSubmit={handleContactSubmit}>
              <label className="login-field">
                <span>Your name</span>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </label>

              <label className="login-field">
                <span>Your email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </label>

              <label className="login-field">
                <span>Why do you need access?</span>
                <textarea
                  rows={3}
                  placeholder="Briefly describe how you'll use this dashboard"
                  value={contactReason}
                  onChange={(e) => setContactReason(e.target.value)}
                  className="login-textarea"
                />
              </label>

              {contactMsg && (
                <p className="login-modal-message">{contactMsg}</p>
              )}

              <div className="login-modal-actions">
                <button
                  type="button"
                  className="login-secondary-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="login-btn">
                  Submit request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
