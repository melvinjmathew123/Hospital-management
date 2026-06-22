import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import HospitalAdminDashboard from './pages/HospitalAdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import LabTechDashboard from './pages/LabTechDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import PatientDashboard from './pages/PatientDashboard';

function MainApp() {
  const { user, loading } = useAuth();
  const [view, setView] = useState('home');

  useEffect(() => {
    if (user) {
      setView('dashboard');
    } else {
      setView('home');
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #030712, #0b1528)',
        color: '#22d3ee',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(34, 211, 238, 0.1)',
            borderTop: '3px solid #22d3ee',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem auto'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <h2>{import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital'}</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '0.5rem' }}>Loading secure portal workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (view === 'login') return <Login setView={setView} />;
    if (view === 'signup') return <SignUp setView={setView} />;
    if (view === 'forgot-password') return <ForgotPassword setView={setView} />;
    return <Homepage setView={setView} />;
  }

  // Switch based on Role
  switch (user.role) {
    case 'Super Admin':
      return <SuperAdminDashboard />;
    case 'Hospital Admin':
      return <HospitalAdminDashboard />;
    case 'Doctor':
      return <DoctorDashboard />;
    case 'Nurse':
      return <NurseDashboard />;
    case 'Lab Technician':
      return <LabTechDashboard />;
    case 'Pharmacist':
      return <PharmacistDashboard />;
    case 'Patient':
      return <PatientDashboard />;
    default:
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>Your user account does not have a valid role assigned.</p>
        </div>
      );
  }
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
