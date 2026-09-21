import React, { useState } from 'react';
import { API_URL, useAuth } from '../context/AuthContext';

export default function SignUp({ setView }) {
  const { verifyRegistration, resendOtp } = useAuth();
  const [step, setStep] = useState(1); // 1: Form entry, 2: OTP verification
  const [otp, setOtp]   = useState('');

  const [fallbackOtp, setFallbackOtp] = useState(''); // shown when email delivery fails
  const [role, setRole]               = useState('Patient');
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [phone, setPhone]             = useState('');
  
  // Conditional Patient fields
  const [dob, setDob]         = useState('');
  const [gender, setGender]   = useState('Male');
  const [address, setAddress] = useState('');

  // Conditional Staff fields
  const [department, setDepartment] = useState('General');

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !phone) {
      setError('Please fill in all required fields.');
      return;
    }

    if (role === 'Patient' && (!dob || !address || !gender)) {
      setError('Please complete all patient profile details (Date of Birth, Gender, and Address).');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        department: role !== 'Patient' ? department : undefined,
        dob: role === 'Patient' ? dob : undefined,
        gender: role === 'Patient' ? gender : undefined,
        address: role === 'Patient' ? address : undefined
      };

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        if (data.isVerified === false) {
          if (data.otp) {
            setOtp(data.otp);
            setFallbackOtp(data.otp);
          }
          setSuccess(data.otp
            ? 'Account created. Email delivery is unavailable — your verification code is provided below.'
            : 'Account created. Please check your email for the 6-digit verification code.');
          setTimeout(() => {
            setSuccess('');
            setStep(2);
          }, 1500);
        } else {
          setSuccess('Account created successfully! Redirecting to sign in...');
          setTimeout(() => setView('login'), 2000);
        }
      } else {
        setError(data.message || 'Registration could not be completed.');
      }
    } catch {
      setError('Could not connect to the server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegistration = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await verifyRegistration(email, otp.trim());
      if (res.success) {
        setSuccess('Email verified successfully. Accessing your portal...');
      } else {
        setError(res.message || 'Invalid or expired verification code.');
        setLoading(false);
      }
    } catch {
      setError('Could not connect to the server. Please try again.');
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await resendOtp(email);
      if (data.success) {
        if (data.otp) {
          setOtp(data.otp);
          setFallbackOtp(data.otp);
          setSuccess('New verification code generated and displayed below.');
        } else {
          setFallbackOtp('');
          setSuccess('A new verification code has been sent to your email.');
        }
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Unable to resend code.');
      }
    } catch {
      setError('Could not connect to the server.');
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
      padding: '2.5rem 1rem',
      backgroundColor: '#f8fafc',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '540px',
        padding: '2.5rem 2rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
          }}>{import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital'}</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            {step === 1 ? 'Create an account to manage appointments and records' : 'Verify your email address'}
          </p>
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

        {step === 1 && (
          <form onSubmit={handleSubmit}>
            <div className="grid-2-col" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account type</label>
                <select
                  className="form-select"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Lab Technician">Lab Technician</option>
                  <option value="Pharmacist">Pharmacist</option>
                </select>
              </div>
            </div>

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

            <div className="grid-2-col" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone number</label>
                <input
                  type="tel"
                  className="form-input"
                  required
                  placeholder="e.g. (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Conditional Patient Fields */}
            {role === 'Patient' && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginTop: '0.5rem',
                marginBottom: '1.25rem'
              }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.85rem' }}>
                  Patient Information
                </p>

                <div className="grid-split" style={{ gap: '1rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Date of birth</label>
                    <input
                      type="date"
                      className="form-input"
                      required={role === 'Patient'}
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      required={role === 'Patient'}
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      disabled={loading}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Home address</label>
                  <input
                    type="text"
                    className="form-input"
                    required={role === 'Patient'}
                    placeholder="Street address, city, state"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Conditional Staff Department Field */}
            {role !== 'Patient' && (
              <div className="form-group">
                <label className="form-label">Department assignment</label>
                <select
                  className="form-select"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={loading}
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="OPD">Outpatient Department (OPD)</option>
                  <option value="IPD">Inpatient Department (IPD)</option>
                  <option value="ICU">Intensive Care Unit (ICU)</option>
                  <option value="Emergency">Emergency Room</option>
                  <option value="General">General Practice</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Lab">Lab Pathology</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.92rem' }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyRegistration} className="fade-in">
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {fallbackOtp
                ? 'Email delivery is currently unavailable. Your verification code is displayed below.'
                : 'Enter the 6-digit code sent to your email to verify your account.'}
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
              {loading ? 'Verifying...' : 'Verify and continue'}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem', fontSize: '0.85rem' }}
              disabled={loading}
            >
              Resend code
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setFallbackOtp(''); setOtp(''); }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem', fontSize: '0.85rem', border: 'none' }}
              disabled={loading}
            >
              &larr; Back
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Already have an account?{' '}
            <span
              onClick={() => setView('login')}
              style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
            >
              Sign in
            </span>
          </p>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.5rem' }}>
            <span
              onClick={() => setView('home')}
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; }}
            >
              &larr; Return to hospital website
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
