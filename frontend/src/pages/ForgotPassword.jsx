import React, { useState } from 'react';
import { API_URL } from '../context/AuthContext';

export default function ForgotPassword({ setView }) {
  const [step, setStep] = useState(1); // 1: Email Request, 2: Verification, 3: Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [fallbackOtp, setFallbackOtp] = useState('');

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
        if (data.otp) {
          setOtp(data.otp);
          setFallbackOtp(data.otp);
          setSuccess('Code generated. Since email delivery is unavailable, your code is displayed on the next screen.');
        } else {
          setSuccess('Verification code sent. Please check your email inbox.');
        }
        setTimeout(() => { setSuccess(''); setStep(2); }, 1500);
      } else {
        setError(data.message || 'We could not find an account with that email.');
      }
    } catch {
      setError('Could not connect to the server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Code verified successfully. Please enter your new password.');
        setTimeout(() => {
          setSuccess('');
          setStep(3);
        }, 1200);
      } else {
        setError(data.message || 'Invalid or expired verification code.');
      }
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter them.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.trim(), newPassword })
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Password updated successfully! Redirecting to sign in...');
        setTimeout(() => {
          setView('login');
        }, 1800);
      } else {
        setError(data.message || 'Failed to update password.');
      }
    } catch {
      setError('Could not connect to the server. Please try again.');
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
      backgroundColor: '#f8fafc',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem 2rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: '#ffffff',
            fontWeight: 700,
            marginBottom: '1rem',
          }}>+</div>
          <h1 style={{
            fontSize: '1.45rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '0.35rem',
            letterSpacing: '-0.02em'
          }}>Reset your password</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Follow the steps to recover access to your account
          </p>
        </div>

        {/* Wizard Progress Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step === s ? 'var(--color-primary)' : step > s ? '#10b981' : '#f1f5f9',
                border: step === s ? 'none' : step > s ? '1px solid #10b981' : '1px solid #cbd5e1',
                color: step >= s ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 600
              }}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div style={{
                  width: '36px',
                  height: '2px',
                  background: step > s ? '#10b981' : '#e2e8f0',
                  marginLeft: '0.75rem'
                }} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-sm)',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-sm)',
            color: '#15803d',
            padding: '0.75rem 1rem',
            fontSize: '0.88rem',
            marginBottom: '1.25rem',
            fontWeight: 500
          }}>
            {success}
          </div>
        )}

        {/* Step 1: Request Form */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="fade-in">
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Enter the email address associated with your account and we will send a 6-digit verification code.
            </p>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.92rem' }}
              disabled={loading}
            >
              {loading ? 'Sending code...' : 'Send verification code'}
            </button>
          </form>
        )}

        {/* Step 2: Verification Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="fade-in">
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {fallbackOtp
                ? 'Email delivery is unavailable. Your verification code is provided below.'
                : 'Enter the 6-digit verification code sent to your email.'}
            </p>

            {/* Fallback OTP banner */}
            {fallbackOtp && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                textAlign: 'center',
                marginBottom: '1.25rem'
              }}>
                <p style={{ fontSize: '0.72rem', color: '#b45309', margin: '0 0 0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Your Verification Code</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '0.25em', color: '#0f172a', margin: 0 }}>{fallbackOtp}</p>
                <p style={{ fontSize: '0.75rem', color: '#92400e', margin: '0.35rem 0 0' }}>Valid for 15 minutes</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">6-digit code</label>
              <input
                type="text"
                className="form-input"
                required
                maxLength={6}
                placeholder="123456"
                style={{
                  textAlign: 'center',
                  letterSpacing: '0.3em',
                  fontSize: '1.3rem',
                  fontWeight: 600
                }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify code'}
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setFallbackOtp(''); }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem', fontSize: '0.85rem' }}
              disabled={loading}
            >
              &larr; Back
            </button>
          </form>
        )}

        {/* Step 3: Reset Form */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="fade-in">
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Your code has been verified. Create a new secure password for your account.
            </p>
            <div className="form-group">
              <label className="form-label">New password</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm new password</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Update password'}
            </button>
          </form>
        )}

        {/* Return to Login */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <span
            onClick={() => setView('login')}
            style={{ fontSize: '0.85rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}
          >
            &larr; Return to sign in
          </span>
        </div>
      </div>
    </div>
  );
}
