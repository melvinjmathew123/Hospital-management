import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ sidebarItems, activeTab, setActiveTab, children }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getRoleColor = (role) => {
    switch (role) {
      case 'Super Admin': return 'badge-danger';
      case 'Hospital Admin': return 'badge-info';
      case 'Doctor': return 'badge-success';
      case 'Nurse': return 'badge-success';
      case 'Lab Technician': return 'badge-warning';
      case 'Pharmacist': return 'badge-info';
      default: return 'badge-info';
    }
  };

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); // Close sidebar on mobile after choosing a menu
  };

  return (
    <div className="app-container">
      {/* Mobile Top Bar (Only visible on screens <= 768px via CSS hide/show or styling) */}
      <div style={{
        display: 'none',
        height: '60px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--glass-border)',
        zIndex: 999,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem'
      }} className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            color: '#fff'
          }}>
            H
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            APOLLO
          </span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="btn btn-secondary"
          style={{
            padding: '0.4rem 0.75rem',
            fontSize: '1.25rem',
            background: 'transparent',
            borderColor: 'var(--glass-border)'
          }}
        >
          ☰
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar glass-panel ${isSidebarOpen ? 'sidebar-open' : ''}`} style={{ borderRadius: '0 var(--radius-lg) var(--radius-lg) 0', borderLeft: 'none' }}>
        <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            color: '#fff'
          }}>
            H
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #22d3ee, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {(import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital').toUpperCase()}
              </h2>
              {/* Mobile Close Button inside sidebar */}
              <button 
                onClick={() => setIsSidebarOpen(false)}
                style={{
                  display: 'none',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0 0.5rem'
                }}
                className="mobile-close-btn"
              >
                ×
              </button>
            </div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Hospital Console
            </p>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabSelect(item.id)}
              className={`btn ${activeTab === item.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                justifyContent: 'flex-start',
                padding: '0.75rem 1.25rem',
                fontSize: '0.9rem',
                width: '100%',
                background: activeTab === item.id ? undefined : 'transparent',
                borderColor: 'transparent',
                color: activeTab === item.id ? '#fff' : 'var(--text-muted)'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem'
            }}>
              👤
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </p>
              <span className={`badge ${getRoleColor(user?.role)}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem', marginTop: '0.2rem' }}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-danger"
            style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content fade-in">
        <header className="navbar">
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital'} / {user?.role}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {user?.department && (
              <div className="glass-panel d-none-mobile" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 500 }}>
                🏥 Dept: <span style={{ color: 'var(--color-primary)' }}>{user.department}</span>
              </div>
            )}
            <div className="glass-panel" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', fontSize: '1.2rem', cursor: 'pointer' }}>
              🔔
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
