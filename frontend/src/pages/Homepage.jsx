import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Homepage({ setView }) {
  const { user } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const services = [
    { icon: '🩺', title: 'General Outpatient (OPD)', desc: 'Comprehensive everyday health care, physical consultations, and wellness checks.' },
    { icon: '❤️', title: 'Cardiology Center', desc: 'State-of-the-art diagnostic testing, pacemaker checking, and acute heart therapies.' },
    { icon: '🧪', title: 'Pathology & Lab Diagnostics', desc: 'Rapid hematology, biochemistry, and clinical pathology tests in modern laboratory chambers.' },
    { icon: '🛏️', title: 'Intensive Ward Care (IPD)', desc: 'High-tech smart ICU beds, nurse-attending vital records, and clinical oversight.' },
    { icon: '💊', title: 'In-house Pharmacy', desc: 'Secure medication management, digital ledger prescription check, and instant collection.' },
    { icon: '🚨', title: '24/7 Emergency & ICU', desc: 'Immediate emergency rescue, ambulance service, and round-the-clock surgeon support.' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.12) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 45%)'
    }}>
      {/* Dynamic Navigation Bar */}
      <header className="homepage-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(3, 7, 18, 0.75)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '1rem 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexGrow: 1 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            color: '#fff',
            fontWeight: 800
          }}>A</div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(135deg, #22d3ee, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.01em' }}>
              APOLLO HOSPITAL
            </h1>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.075em' }}>
              Apollo Care Network
            </p>
          </div>
        </div>

        {/* Mobile Nav Toggle Button */}
        <button
          onClick={() => setIsNavOpen(!isNavOpen)}
          className="btn btn-secondary mobile-only-toggle"
          style={{
            display: 'none',
            padding: '0.4rem 0.75rem',
            fontSize: '1.25rem',
            background: 'transparent',
            borderColor: 'var(--glass-border)'
          }}
        >
          ☰
        </button>

        <nav className={`homepage-nav ${isNavOpen ? 'nav-open' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#services" onClick={() => setIsNavOpen(false)} className="nav-link">Services</a>
          <a href="#about" onClick={() => setIsNavOpen(false)} className="nav-link">About Us</a>
          <a href="#contact" onClick={() => setIsNavOpen(false)} className="nav-link">Contact</a>
          
          <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem' }}>
            {user ? (
              <button onClick={() => { setIsNavOpen(false); setView('dashboard'); }} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Go to Console
              </button>
            ) : (
              <>
                <button onClick={() => { setIsNavOpen(false); setView('login'); }} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                  Sign In
                </button>
                <button onClick={() => { setIsNavOpen(false); setView('signup'); }} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                  Join Portal
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main style={{ flexGrow: 1 }}>
        <section style={{
          padding: '8rem 2rem 6rem 2rem',
          textAlign: 'center',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <span style={{
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            color: '#22d3ee',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.075em'
          }}>
            🏥 Certified Clinical Excellence Center
          </span>
          <h1 className="hero-title" style={{
            fontSize: '4rem',
            fontWeight: 800,
            lineHeight: 1.15,
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
            letterSpacing: '-0.03em'
          }}>
            The Future of Clinical Care <br />
            <span style={{ background: 'linear-gradient(135deg, #22d3ee, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Unified & Patient-Centered
            </span>
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1.25rem',
            maxWidth: '700px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6
          }}>
            Access Apollo Hospital medical files, coordinate live nursing vitals charts, verify certified billing ledgers, and secure clinical appointments online.
          </p>

          <div className="hero-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
            <button onClick={() => setView(user ? 'dashboard' : 'signup')} className="btn btn-primary" style={{ padding: '0.9rem 2.25rem', fontSize: '1rem' }}>
              {user ? 'Open Dashboard Console ➔' : 'Register Portal Profile ➔'}
            </button>
            <a href="#services" className="btn btn-secondary" style={{ padding: '0.9rem 2.25rem', fontSize: '1rem', textDecoration: 'none' }}>
              Explore Services
            </a>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid-4-col" style={{
            marginTop: '6rem'
          }}>
            {[
              { val: '24/7', label: 'Emergency Support' },
              { val: '120+', label: 'Specialist Doctors' },
              { val: '10,000+', label: 'Happy Patients' },
              { val: '99.8%', label: 'Clinical Accuracy' }
            ].map((stat, i) => (
              <div key={i} className="glass-card" style={{ padding: '1.5rem 1rem' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>{stat.val}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section id="services" style={{
          padding: '6rem 2rem',
          background: 'rgba(255, 255, 255, 0.01)',
          borderTop: '1px solid var(--glass-border)',
          borderBottom: '1px solid var(--glass-border)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Explore Care Offerings</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                State-of-the-art facilities engineered to support clinical excellence and premium patient treatment.
              </p>
            </div>

            <div className="dashboard-grid">
              {services.map((serv, index) => (
                <div key={index} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                  <div style={{ fontSize: '2.5rem' }}>{serv.icon}</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{serv.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{serv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="grid-2-col" style={{ alignItems: 'center' }}>
            <div>
              <span style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>WHO WE ARE</span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Pioneering Healthcare Innovation Since 1983
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Apollo Hospital has consistently paved the way for advanced healthcare services across the region. With our state-of-the-art infrastructure, pioneering doctors, and specialized treatment wards, we ensure every visitor experiences premium clinical hospitality.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p>⚡ <b>Real-time Vital Charting:</b> Continuous digital patient tracking.</p>
                <p>🧪 <b>Advanced Labs:</b> Digital lab reports accessible instantly.</p>
                <p>💳 <b>Transparent Billing:</b> Direct insurance claims processing ledger.</p>
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, var(--color-primary-rgb) 0%, transparent 70%)', opacity: 0.15 }}></div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary)' }}>Emergency Outpatient Services</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Our 24-hour trauma support is fully functional with specialized cardiology and critical emergency doctors. Reach us instantly using the dedicated portal or call line.
              </p>
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Direct Helpline</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>+1 (555) 0199-990</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" style={{
        background: 'rgba(3, 7, 18, 0.9)',
        borderTop: '1px solid var(--glass-border)',
        padding: '4rem 2rem 2rem 2rem',
        color: 'var(--text-muted)',
        fontSize: '0.88rem'
      }}>
        <div className="grid-3-col" style={{ maxWidth: '1200px', margin: '0 auto', gap: '2rem', marginBottom: '3rem' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Apollo Care Network</h3>
            <p style={{ lineHeight: 1.6, maxWidth: '350px' }}>
              Delivering secure, cutting-edge healthcare management solutions and patient-first clinical treatments.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Portal Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span onClick={() => setView('login')} className="footer-link">Portal Login</span>
              <span onClick={() => setView('signup')} className="footer-link">Patient Registration</span>
              <span onClick={() => setView('home')} className="footer-link">Homepage</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Location Details</h4>
            <p>121 Health Care Lane, NY</p>
            <p style={{ marginTop: '0.5rem' }}>Phone: (555) 0100</p>
            <p>Email: support@apollo.com</p>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', textAlign: 'center', fontSize: '0.8rem' }}>
          <p>© {new Date().getFullYear()} Apollo Hospital Care Network. All rights reserved. Managed Secure Portal.</p>
        </div>
      </footer>
    </div>
  );
}
