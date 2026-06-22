import React, { useState } from 'react';
import { API_URL } from '../context/AuthContext';

export default function ForgotPassword({ setView }) {
  const [step, setStep] = useState(1); // 1: Email Request, 2: Verification, 3: Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Request OTP code
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Verification code generated! Please check your inbox.');
        
        // Auto-fill OTP if returned in response payload (silently kept for local testing)
        if (data.otp) {
          setOtp(data.otp);
        }

        setTimeout(() => {
          setSuccess('');
          setStep(2);
        }, 2000);
      } else {
        setError(data.message || 'Email lookup failed.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Verification code verified successfully! Set your new security credentials.');
        setTimeout(() => {
          setSuccess('');
          setStep(3);
        }, 1500);
      } else {
        setError(data.message || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please complete all security credential fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('🎉 Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          setView('login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 45%)'
    }}>
      <div className="glass-panel fade-in" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '3rem 2.5rem',
      }}>
        {/* Step Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.25rem'
          }}>Reset Credentials</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Apollo Care Network Secure Reset Wizard
          </p>
        </div>

        {/* Wizard Progress Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step === s ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : step > s ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                border: step === s ? 'none' : step > s ? '1px solid #10b981' : '1px solid var(--glass-border)',
                color: step >= s ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div style={{ width: '40px', height: '2px', background: step > s ? '#10b981' : 'var(--glass-border)', marginLeft: '0.75rem' }} />}
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            color: '#34d399',
            padding: '0.75rem 1rem',
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        {/* Step 1: Request Form */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="fade-in">
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Enter your registered portal email address. We will generate a secure OTP code to authorize your reset.
            </p>
            <div className="form-group">
              <label className="form-label">Portal Email Address</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="e.g. patient@apollo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {/* Step 2: Verification Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="fade-in">
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Please enter the 6-digit verification code sent to your registered email address.
            </p>
            <div className="form-group">
              <label className="form-label">6-Digit Verification OTP</label>
              <input
                type="text"
                className="form-input"
                required
                maxLength={6}
                placeholder="123456"
                style={{ textAlign: 'center', letterSpacing: '0.25em', fontSize: '1.25rem', fontWeight: 'bold' }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Verifying OTP...' : 'Verify Code'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.75rem' }}
              disabled={loading}
            >
              Back
            </button>
          </form>
        )}

        {/* Step 3: Reset Form */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="fade-in">
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Verification authorized. Set your new clinical portal password below.
            </p>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Saving Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Return to Login */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
          <span
            onClick={() => setView('login')}
            style={{ fontSize: '0.9rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            ➔ Return to Login Screen
          </span>
        </div>
      </div>
    </div>
  );
}
