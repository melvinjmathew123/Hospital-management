import React, { useState } from 'react';
import { API_URL, useAuth } from '../context/AuthContext';

export default function Login({ setView }) {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const { login, verifyRegistration, resendOtp, error, loading } = useAuth();
  const [formError, setFormError]   = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // OTP step state (shown when login returns isVerified:false)
  const [step, setStep]           = useState(1); // 1: credentials, 2: OTP verify
  const [otp, setOtp]             = useState('');
  const [fallbackOtp, setFallbackOtp] = useState('');

  const [otpLoading, setOtpLoading] = useState(false);

  // ── Step 1: credentials ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter both email and password');
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
            ? 'Email delivery is unavailable — your OTP is shown below.'
            : 'Your email is not verified. A verification code has been sent to your inbox.'
        );
        setStep(2);
      }
      // other errors are shown via the `error` value from useAuth
    }
  };

  // ── Step 2: OTP verify ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) { setFormError('Please enter the verification code.'); return; }
    setFormError('');
    setFormSuccess('');
    setOtpLoading(true);
    try {
      const result = await verifyRegistration(email, otp.trim());
      if (!result.success) {
        setFormError(result.message || 'Invalid or expired verification code.');
      }
    } catch {
      setFormError('Server connection error. Please try again.');
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
          setFormSuccess('New OTP generated — email unavailable, code shown below.');
        } else {
          setFallbackOtp('');
          setFormSuccess('A new verification code has been sent to your email.');
        }
      } else {
        setFormError(data.message || 'Failed to resend OTP.');
      }
    } catch {
      setFormError('Server connection error.');
    } finally {
      setOtpLoading(false);
    }
  };

  const isLoading = loading || otpLoading;

  // ── Shared alert helpers ──────────────────────────────────────────────────
  const errorMsg  = formError || error;
  const successMsg = formSuccess;

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
      <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '480px', padding: '3rem 2.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: '2.25rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            {import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {step === 1 ? 'Hospital Management System • Apollo Care Network' : 'Email Verification Required'}
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)', color: '#fca5a5',
            padding: '0.75rem 1rem', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)', color: '#34d399',
            padding: '0.75rem 1rem', fontSize: '0.88rem', marginBottom: '1.5rem', textAlign: 'center'
          }}>
            {successMsg}
          </div>
        )}

        {/* ── Step 1: Sign In ── */}
        {step === 1 && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '2.5rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="e.g. admin@apollo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Password</label>
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
              style={{ width: '100%', padding: '0.875rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
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
        )}

        {/* ── Step 2: OTP Verification ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="fade-in">
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {fallbackOtp
                ? 'Email delivery is unavailable. Your OTP is displayed below — copy it and click Verify.'
                : 'Enter the 6-digit code sent to your email to complete sign-in.'}
            </p>

            {/* Fallback OTP banner */}
            {fallbackOtp && (
              <div style={{
                background: 'rgba(99,102,241,0.12)',
                border: '2px dashed rgba(99,102,241,0.45)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem', textAlign: 'center', marginBottom: '1.25rem'
              }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Verification OTP
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.3em', color: '#818cf8', margin: 0 }}>
                  {fallbackOtp}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>⏱ Expires in 15 minutes</p>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">6-Digit Verification Code</label>
              <input
                id="login-otp"
                type="text"
                className="form-input"
                required
                maxLength={6}
                placeholder="123456"
                style={{ textAlign: 'center', letterSpacing: '0.25em', fontSize: '1.25rem', fontWeight: 'bold' }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.6rem', fontSize: '0.88rem' }}
              disabled={isLoading}
            >
              Resend Code
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setOtp(''); setFallbackOtp(''); setFormError(''); setFormSuccess(''); }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.85rem' }}
              disabled={isLoading}
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <span
              onClick={() => setView('home')}
              style={{ cursor: 'pointer', textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 500 }}
            >
              ➔ Return to Hospital Homepage
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
