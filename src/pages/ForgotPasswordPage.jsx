import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LoginPage.css'; // reuse same layout style

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('you@example.com');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
      setMessage('Please enter your email.');
      return;
    }

    // Dummy UX for now – no backend integration yet
    setMessage(
      'If an account exists with this email, a reset link will be sent.'
    );

    // In a real app, you'd call: POST /api/auth/forgot-password
    // and show success regardless of whether the email exists (for security).
  }

  function goBack() {
    navigate('/login');
  }

  return (
    <div className="login-page">
      {/* Left side */}
      <div className="login-left">
        <div className="login-logo">
          <span className="login-logo-dot" />
          <span>Inventory Hub</span>
        </div>
        <h1 className="login-heading">
          Forgot your <span>password?</span>
        </h1>
        <p className="login-subtitle">
          No worries. Enter your email and we’ll send you a secure link to reset
          your password.
        </p>
      </div>

      {/* Right side – card */}
      <div className="login-right">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2 className="login-card-title">Reset password</h2>
          <p className="login-card-subtitle">
            We’ll send a password reset link to your email.
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

          {message && (
            <p className="login-error" style={{ color: '#60a5fa' }}>
              {message}
            </p>
          )}

          <button type="submit" className="login-btn">
            Send reset link
          </button>

          <button
            type="button"
            className="login-secondary-btn"
            style={{ marginTop: '10px' }}
            onClick={goBack}
          >
            Back to sign in
          </button>
        </form>
      </div>
    </div>
  );
}
