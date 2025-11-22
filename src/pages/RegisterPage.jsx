import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LoginPage.css'; // reuse same layout styles

export default function RegisterPage() {
  const [name, setName] = useState('Vidhaan Viswas');
  const [email, setEmail] = useState('you@example.com');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirm) {
      setError('Please fill all fields');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }

      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Register error:', err);
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function goToLogin() {
    navigate('/login');
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
          Create your <span>inventory workspace</span>.
        </h1>
        <p className="login-subtitle">
          Set up an account to manage SKUs, inventory, purchase orders and
          analytics—all in one dashboard.
        </p>

        <div className="login-highlights">
          <div className="login-highlight-card">
            <p className="login-highlight-number">Minutes</p>
            <p className="login-highlight-label">to get started</p>
          </div>
          <div className="login-highlight-card">
            <p className="login-highlight-number">Multi</p>
            <p className="login-highlight-label">channel ready</p>
          </div>
        </div>
      </div>

      {/* Right side – register card */}
      <div className="login-right">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2 className="login-card-title">Create account</h2>
          <p className="login-card-subtitle">
            A single login for everything inventory.
          </p>

          <label className="login-field">
            <span>Full Name</span>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

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
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label className="login-field">
            <span>Confirm Password</span>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>

          {error && <p className="login-error">{error}</p>}
          {success && (
            <p className="login-error" style={{ color: '#4ade80' }}>
              {success}
            </p>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="login-divider">
            <span></span>
            <p>Already have an account?</p>
            <span></span>
          </div>

          <button
            type="button"
            className="login-secondary-btn"
            onClick={goToLogin}
          >
            Back to sign in
          </button>
        </form>
      </div>
    </div>
  );
}
