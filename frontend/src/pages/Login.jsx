import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(`/${user.role}/dashboard`);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLocalLoading(true);
    try {
      const data = await login({ email, password });
      navigate(`/${data.role}/dashboard`);
    } catch (err) {
      setError(err);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '32px' }}>
        <div className="text-center" style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Sign in to access your Hire Me profile
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. rohan@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={localLoading}
            style={{ padding: '14px' }}
          >
            {localLoading ? 'Authenticating...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div className="text-center" style={{ marginTop: '24px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
          <Link to="/register" style={{ fontWeight: 600 }}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
