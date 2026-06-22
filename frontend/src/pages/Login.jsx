import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ setView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading } = useAuth();
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }
    setFormError('');
    await login(email, password);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 45%)'
    }}>
      <div className="glass-panel fade-in" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '3rem 2.5rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>{import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Hospital Management System • Apollo Care Network
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {formError && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fde047',
            padding: '0.75rem 1rem',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '2.5rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. admin@apollo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', fontSize: '0.88rem' }}>
            <span
              onClick={() => setView('forgot-password')}
              style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
            >
              Forgot Password?
            </span>
            <span
              onClick={() => setView('signup')}
              style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
            >
              Create Account
            </span>
          </div>
        </form>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <span onClick={() => setView('home')} style={{ cursor: 'pointer', textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 500 }}>
              ➔ Return to Hospital Homepage
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
