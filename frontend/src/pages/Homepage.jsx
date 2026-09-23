import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  StethoscopeIcon,
  HeartPulseIcon,
  TestTubeIcon,
  BedIcon,
  PillIcon,
  AmbulanceIcon,
  PhoneIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '../components/shared/Icons';

export default function Homepage({ setView }) {
  const { user } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const services = [
    {
      icon: <StethoscopeIcon size={24} color="#2563eb" />,
      title: 'General Outpatient (OPD)',
      desc: 'Everyday primary healthcare, routine doctor consultations, preventative health screenings, and comprehensive wellness checks.'
    },
    {
      icon: <HeartPulseIcon size={24} color="#2563eb" />,
      title: 'Cardiology Center',
      desc: 'Advanced cardiac diagnostics, non-invasive imaging, ECGs, and ongoing heart disease management by certified cardiologists.'
    },
    {
      icon: <TestTubeIcon size={24} color="#2563eb" />,
      title: 'Pathology & Diagnostics',
      desc: 'Certified clinical laboratory testing, routine hematology, biochemistry, and rapid online report turnaround.'
    },
    {
      icon: <BedIcon size={24} color="#2563eb" />,
      title: 'Inpatient Ward Care (IPD)',
      desc: 'Dedicated patient ward beds, modern intensive care units, 24/7 nursing supervision, and post-operative recovery monitoring.'
    },
    {
      icon: <PillIcon size={24} color="#2563eb" />,
      title: 'Hospital Pharmacy',
      desc: 'Fully licensed clinical pharmacy providing verified digital medication dispensing, prescription reviews, and guidance.'
    },
    {
      icon: <AmbulanceIcon size={24} color="#2563eb" />,
      title: '24/7 Emergency Care',
      desc: 'Immediate emergency triage, critical resuscitation facilities, rapid ambulance dispatch, and on-call trauma surgeons.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
    }}>
      {/* Navigation Bar */}
      <header className="homepage-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.85rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            color: '#ffffff',
            fontWeight: 800,
          }}>+</div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
              {import.meta.env.VITE_HOSPITAL_NAME || 'Voguemark Hospital'}
            </h1>
            <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>
              Healthcare Network
            </p>
          </div>
        </div>

        {/* Mobile Nav Toggle */}
        <button
          onClick={() => setIsNavOpen(!isNavOpen)}
          className="btn btn-secondary mobile-only-toggle"
          style={{
            display: 'none',
            padding: '0.35rem 0.65rem',
            fontSize: '1.1rem',
          }}
        >
          ☰
        </button>

        <nav className={`homepage-nav ${isNavOpen ? 'nav-open' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#services" onClick={() => setIsNavOpen(false)} className="nav-link">Clinical Services</a>
          <a href="#about" onClick={() => setIsNavOpen(false)} className="nav-link">About Hospital</a>
          <a href="#contact" onClick={() => setIsNavOpen(false)} className="nav-link">Contact</a>
          
          <div style={{ display: 'flex', gap: '0.75rem', marginLeft: '0.5rem' }}>
            {user ? (
              <button onClick={() => { setIsNavOpen(false); setView('dashboard'); }} className="btn btn-primary" style={{ padding: '0.5rem 1.15rem' }}>
                Open Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => { setIsNavOpen(false); setView('login'); }} className="btn btn-secondary" style={{ padding: '0.5rem 1.1rem' }}>
                  Sign in
                </button>
                <button onClick={() => { setIsNavOpen(false); setView('signup'); }} className="btn btn-primary" style={{ padding: '0.5rem 1.1rem' }}>
                  Register as Patient
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ flexGrow: 1 }}>
        {/* Hero Section */}
        <section style={{
          padding: '4.5rem 1.5rem 3rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div className="grid-split" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '1.25rem'
              }}>
                <ShieldCheckIcon size={16} color="#2563eb" />
                <span>Certified Clinical Healthcare Network</span>
              </div>
              <h1 className="hero-title" style={{
                fontSize: '3rem',
                fontWeight: 800,
                lineHeight: 1.18,
                marginBottom: '1.25rem',
                letterSpacing: '-0.025em',
                color: '#0f172a'
              }}>
                Compassionate Care,<br />
                <span style={{ color: 'var(--color-primary)' }}>
                  Modern Healthcare Management
                </span>
              </h1>
              <p style={{
                color: '#475569',
                fontSize: '1.1rem',
                margin: '0 0 2rem 0',
                lineHeight: 1.6
              }}>
                Schedule doctor appointments, review certified diagnostic lab results, manage medical records, and consult with leading clinical specialists in one integrated healthcare portal.
              </p>

              <div className="hero-buttons" style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                <button onClick={() => setView(user ? 'dashboard' : 'signup')} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
                  {user ? 'Go to your dashboard' : 'Register as Patient'}
                </button>
                <button onClick={() => setView('login')} className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
                  Staff & Patient Sign In
                </button>
              </div>
            </div>

            {/* Real Hospital Photography */}
            <div style={{ position: 'relative' }}>
              <div style={{
                overflow: 'hidden',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                background: '#ffffff'
              }}>
                <img
                  src="/hospital_hero.jpg"
                  alt="Modern Hospital Clinic Consultation"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-15px',
                left: '20px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <CheckCircleIcon size={18} color="#059669" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>Accredited Specialists</p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>Over 120 certified physicians</p>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid-4-col" style={{ marginTop: '4.5rem' }}>
            {[
              { val: '24 / 7', label: 'Emergency Coverage' },
              { val: '120+', label: 'Certified Doctors' },
              { val: '15,000+', label: 'Patients Treated' },
              { val: '99.8%', label: 'Diagnostic Accuracy' }
            ].map((stat, i) => (
              <div key={i} className="glass-card" style={{
                padding: '1.5rem 1rem',
                textAlign: 'center',
                background: '#ffffff',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>{stat.val}</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section id="services" style={{
          padding: '5rem 1.5rem',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.25rem' }}>
              <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                DEPARTMENTS & SPECIALTIES
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem' }}>
                Comprehensive Medical Services
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '560px', margin: '0.35rem auto 0 auto' }}>
                Equipped with modern facilities, certified clinical professionals, and dedicated patient care.
              </p>
            </div>

            <div className="dashboard-grid">
              {services.map((serv, index) => (
                <div key={index} className="glass-card" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  height: '100%',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {serv.icon}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>{serv.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.55 }}>{serv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" style={{ padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="grid-2-col" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ABOUT VOGUEMARK HOSPITAL</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.35rem', marginBottom: '1rem', color: '#0f172a' }}>
                Dedicated to Patient Care Since 1983
              </h2>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Our medical center combines decades of clinical experience with modern hospital information systems. We prioritize timely consultations, digital lab record access, and safe patient recovery.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#334155', fontSize: '0.92rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircleIcon size={18} color="#2563eb" />
                  <span><b>Digital Health Records:</b> Instant access to lab pathology and doctor consultation notes.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircleIcon size={18} color="#2563eb" />
                  <span><b>Continuous Vital Monitoring:</b> Dedicated inpatient nursing tracking and alarms.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircleIcon size={18} color="#2563eb" />
                  <span><b>Transparent Invoicing:</b> Clear itemized medical billing and instant payment receipts.</span>
                </div>
              </div>
            </div>

            <div style={{
              padding: '2rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px',
                background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <PhoneIcon size={20} color="#b91c1c" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>24-Hour Emergency Helpline</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                Our trauma and critical care teams are available 24/7. Call our priority dispatch center for immediate emergency admissions.
              </p>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '0.2rem', fontWeight: 600 }}>Emergency Contact</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>+1 (555) 0199-990</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" style={{
        background: '#0f172a',
        borderTop: '1px solid #1e293b',
        padding: '3rem 1.5rem 2rem 1.5rem',
        color: '#94a3b8',
        fontSize: '0.88rem'
      }}>
        <div className="grid-3-col" style={{ maxWidth: '1200px', margin: '0 auto', gap: '2.5rem', marginBottom: '2.5rem' }}>
          <div>
            <h3 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              {import.meta.env.VITE_HOSPITAL_NAME || 'Voguemark Hospital'}
            </h3>
            <p style={{ lineHeight: 1.6, maxWidth: '320px', color: '#94a3b8' }}>
              Committed to excellence in patient healthcare, preventative medicine, and comprehensive clinical services.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.75rem' }}>Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span onClick={() => setView('login')} className="footer-link">Sign in</span>
              <span onClick={() => setView('signup')} className="footer-link">Patient registration</span>
              <span onClick={() => setView('home')} className="footer-link">Hospital homepage</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.75rem' }}>Location & Contact</h4>
            <p>121 Healthcare Blvd, Medical District</p>
            <p style={{ marginTop: '0.25rem' }}>Phone: +1 (555) 0100</p>
            <p style={{ marginTop: '0.25rem' }}>Email: support@voguemark.shop</p>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid #1e293b', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          <p>© {new Date().getFullYear()} {import.meta.env.VITE_HOSPITAL_NAME || 'Voguemark Hospital'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
