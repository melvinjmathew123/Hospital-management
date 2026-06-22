import React, { useState } from 'react';
import { API_URL, useAuth } from '../context/AuthContext';

export default function SignUp({ setView }) {
  const { verifyRegistration } = useAuth();
  const [step, setStep] = useState(1); // 1: Form entry, 2: OTP verification
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('Patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Conditional Patient fields
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');

  // Conditional Staff fields
  const [department, setDepartment] = useState('General');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !phone) {
      setError('Please fill in all core fields.');
      return;
    }

    if (role === 'Patient' && (!dob || !address || !gender)) {
      setError('Please complete all Patient Profile information (DOB, Gender, Address).');
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
          setSuccess('Account registered successfully! Verification OTP code generated.');
          if (data.otp) {
            setOtp(data.otp);
          }
          setTimeout(() => {
            setSuccess('');
            setStep(2);
          }, 1500);
        } else {
          setSuccess('🎉 Account registered successfully! Redirecting to login...');
          setTimeout(() => {
            setView('login');
          }, 2500);
        }
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
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
      const res = await verifyRegistration(email, otp);
      if (res.success) {
        setSuccess('🎉 Registration verified successfully! Accessing portal...');
      } else {
        setError(res.message || 'Invalid or expired verification code.');
        setLoading(false);
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
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
        maxWidth: '550px',
        padding: '2.5rem 2.25rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.25rem'
          }}>{import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Portal Registration • Secure Care Account Setup
          </p>
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

        {step === 1 && (
          <form onSubmit={handleSubmit}>
            {/* Core Info Row */}
            <div className="grid-2-col" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Portal Role *</label>
                <select
                  className="form-select"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="Patient">Patient Portal</option>
                  <option value="Doctor">Doctor Console</option>
                  <option value="Nurse">Nurse Station</option>
                  <option value="Lab Technician">Lab Technician</option>
                  <option value="Pharmacist">Pharmacist Portal</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="e.g. john@apollo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid-2-col" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  required
                  placeholder="e.g. 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Conditional Patient Fields */}
            {role === 'Patient' && (
              <div className="fade-in" style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginTop: '0.5rem',
                marginBottom: '1.25rem'
              }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
                  Patient Profile Information
                </p>

                <div className="grid-split" style={{ gap: '1rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Date of Birth *</label>
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
                    <label className="form-label">Gender *</label>
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
                  <label className="form-label">Permanent Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    required={role === 'Patient'}
                    placeholder="e.g. 104 Park Ave, New York, NY"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Conditional Staff Department Field */}
            {role !== 'Patient' && (
              <div className="form-group fade-in">
                <label className="form-label">Assigned Clinic Department *</label>
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
              style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Portal Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyRegistration} className="fade-in">
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Account successfully registered! Please enter the 6-digit verification code sent to your registered email address to authorize and activate your portal workspace.
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
              {loading ? 'Verifying...' : 'Verify & Log In'}
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

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have a workspace account?{' '}
            <span
              onClick={() => setView('login')}
              style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
            >
              Sign In
            </span>
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            <span
              onClick={() => setView('home')}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              ➔ Return to Homepage
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
