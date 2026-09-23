import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ setView }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { login, verifyRegistration, resendOtp, error, loading } = useAuth();
  const [formError, setFormError]     = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // OTP step state (shown when login returns isVerified:false)
  const [step, setStep]               = useState(1); // 1: credentials, 2: OTP verify
  const [otp, setOtp]                 = useState('');
  const [fallbackOtp, setFallbackOtp] = useState('');
  const [otpLoading, setOtpLoading]   = useState(false);

  // ── Step 1: credentials ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter both your email and password.');
      return;
    }
    setFormError('');
    setFormSuccess('');

    const result = await login(email, password);

    if (!result.success) {
      // Unverified — move to OTP step
      if (result.isVerified === false) {
        if (result.otp) {
          setOtp(result.otp);
          setFallbackOtp(result.otp);
        }
        setFormSuccess(
          result.otp
            ? 'Email delivery is unavailable. Your verification code is provided below.'
            : 'Your email address is not verified yet. A verification code has been sent to your inbox.'
        );
        setStep(2);
      }
    }
  };

  // ── Step 2: OTP verify ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) { setFormError('Please enter the 6-digit verification code.'); return; }
    setFormError('');
    setFormSuccess('');
    setOtpLoading(true);
    try {
      const result = await verifyRegistration(email, otp.trim());
      if (!result.success) {
        setFormError(result.message || 'Invalid or expired verification code.');
      }
    } catch {
      setFormError('Could not connect to the server. Please check your connection and try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setFormError('');
    setFormSuccess('');
    setOtpLoading(true);
    try {
      const data = await resendOtp(email);
      if (data.success) {
        if (data.otp) {
          setOtp(data.otp);
          setFallbackOtp(data.otp);
          setFormSuccess('New code generated. Since email delivery is unavailable, the code is shown below.');
        } else {
          setFallbackOtp('');
          setFormSuccess('A new verification code has been sent to your email.');
        }
      } else {
        setFormError(data.message || 'Unable to resend code.');
      }
    } catch {
      setFormError('Could not connect to the server.');
    } finally {
      setOtpLoading(false);
    }
  };

  const isLoading = loading || otpLoading;
  const errorMsg  = formError || error;
  const successMsg = formSuccess;

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
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '10px',
            background: 'var(--color-primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', color: '#ffffff', fontWeight: 700,
            marginBottom: '1rem',
          }}>+</div>
          <h1 style={{
            fontSize: '1.45rem', fontWeight: 700, marginBottom: '0.35rem',
            color: '#0f172a', letterSpacing: '-0.02em',
          }}>
            {import.meta.env.VITE_HOSPITAL_NAME || 'Voguemark Hospital'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            {step === 1 ? 'Sign in to access your healthcare portal' : 'Enter verification code'}
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-sm)',
            color: '#b91c1c',
            padding: '0.75rem 1rem', fontSize: '0.88rem', marginBottom: '1.25rem',
            fontWeight: 500,
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-sm)',
            color: '#15803d',
            padding: '0.75rem 1rem', fontSize: '0.88rem', marginBottom: '1.25rem',
            fontWeight: 500,
          }}>
            {successMsg}
          </div>
        )}

        {/* ── Step 1: Sign In ── */}
        {step === 1 && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <span
                  onClick={() => setView('forgot-password')}
                  style={{ color: 'var(--color-primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}
                >
                  Forgot password?
                </span>
              </div>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.92rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#64748b' }}>
              Don't have an account?{' '}
              <span
                onClick={() => setView('signup')}
                style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Create account
              </span>
            </div>
          </form>
        )}

        {/* ── Step 2: OTP Verification ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="fade-in">
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {fallbackOtp
                ? 'Email delivery is currently unavailable. Your verification code is displayed below.'
                : 'Enter the 6-digit verification code sent to your registered email address.'}
            </p>

            {fallbackOtp && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius-md)',
                padding: '1rem', textAlign: 'center', marginBottom: '1.25rem'
              }}>
                <p style={{ fontSize: '0.72rem', color: '#b45309', margin: '0 0 0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Verification Code
                </p>
                <p style={{
                  fontSize: '1.8rem', fontWeight: 700, letterSpacing: '0.25em', margin: 0,
                  color: '#0f172a'
                }}>{fallbackOtp}</p>
                <p style={{ fontSize: '0.75rem', color: '#92400e', margin: '0.35rem 0 0' }}>Valid for 15 minutes</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">6-digit code</label>
              <input
                id="login-otp"
                type="text"
                className="form-input"
                required
                maxLength={6}
                placeholder="123456"
                style={{
                  textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.3rem',
                  fontWeight: 600
                }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify and sign in'}
            </button>
            <button type="button" onClick={handleResendOtp} className="btn btn-secondary"
              style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem', fontSize: '0.85rem' }}
              disabled={isLoading}>
              Resend code
            </button>
            <button type="button"
              onClick={() => { setStep(1); setOtp(''); setFallbackOtp(''); setFormError(''); setFormSuccess(''); }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem', fontSize: '0.85rem', border: 'none' }}
              disabled={isLoading}>
              &larr; Back to sign in
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', textAlign: 'center', marginTop: '1.5rem' }}>
          <span
            onClick={() => setView('home')}
            style={{ cursor: 'pointer', color: '#64748b', fontSize: '0.85rem' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; }}
          >
            &larr; Return to hospital website
          </span>
        </div>
      </div>
    </div>
  );
}
