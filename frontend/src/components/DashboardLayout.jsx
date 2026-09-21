import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './shared/NotificationBell';
import {
  FolderIcon,
  CalendarIcon,
  ClockIcon,
  TestTubeIcon,
  PillIcon,
  CreditCardIcon,
  StethoscopeIcon,
  FileTextIcon,
  BedIcon,
  HospitalIcon,
  ActivityIcon,
  UsersIcon,
  LogOutIcon
} from './shared/Icons';

export default function DashboardLayout({ sidebarItems, activeTab, setActiveTab, children }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Super Admin':    return 'badge-danger';
      case 'Hospital Admin': return 'badge-info';
      case 'Doctor':         return 'badge-success';
      case 'Nurse':          return 'badge-success';
      case 'Lab Technician': return 'badge-warning';
      case 'Pharmacist':     return 'badge-info';
      default:               return 'badge-info';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderIcon = (item) => {
    if (React.isValidElement(item.icon)) return item.icon;
    switch (item.id) {
      case 'profile':
      case 'patients':
        return <FolderIcon size={18} />;
      case 'appointments':
        return <CalendarIcon size={18} />;
      case 'book':
        return <ClockIcon size={18} />;
      case 'labs':
      case 'tests':
      case 'orders':
        return <TestTubeIcon size={18} />;
      case 'prescriptions':
      case 'medicines':
      case 'dispense':
        return <PillIcon size={18} />;
      case 'billing':
        return <CreditCardIcon size={18} />;
      case 'consultation':
        return <StethoscopeIcon size={18} />;
      case 'history':
        return <FileTextIcon size={18} />;
      case 'beds':
        return <BedIcon size={18} />;
      case 'admissions':
      case 'departments':
      case 'wards':
        return <HospitalIcon size={18} />;
      case 'vitals':
        return <ActivityIcon size={18} />;
      case 'users':
        return <UsersIcon size={18} />;
      case 'overview':
        return <ActivityIcon size={18} />;
      case 'inventory':
      case 'add_drug':
        return <PillIcon size={18} />;
      case 'certificates':
        return <FileTextIcon size={18} />;
      case 'enter_results':
        return <TestTubeIcon size={18} />;
      default:
        return <FileTextIcon size={18} />;
    }
  };

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-container">

      {/* ── Mobile Top Bar ── */}
      <div style={{
        display: 'none', height: '60px', position: 'fixed',
        top: 0, left: 0, right: 0,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 999, alignItems: 'center',
        justifyContent: 'space-between', padding: '0 1.25rem',
      }} className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '6px',
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '1.1rem', color: '#ffffff',
          }}>+</div>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
            {import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital'}
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '1.1rem' }}
        >
          ☰
        </button>
      </div>

      {/* ── Mobile Backdrop ── */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 999,
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0 0.25rem' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '8px', flexShrink: 0,
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.3rem', color: '#ffffff',
          }}>+</div>
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{
                fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital'}
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                style={{
                  display: 'none', background: 'transparent', border: 'none',
                  color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer', padding: '0 0.25rem',
                }}
                className="mobile-close-btn"
              >×</button>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '1px' }}>
              Clinical Portal
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#1e293b', marginBottom: '1.25rem' }} />

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexGrow: 1 }}>
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.88rem', fontWeight: isActive ? 600 : 500,
                  width: '100%', textAlign: 'left',
                  background: isActive ? '#1e293b' : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <span style={{ width: '20px', display: 'inline-flex', justifyContent: 'center', flexShrink: 0, color: isActive ? 'var(--color-primary)' : '#94a3b8' }}>
                  {renderIcon(item)}
                </span>
                <span style={{ flexGrow: 1 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: '1px', background: '#1e293b', margin: '1rem 0' }} />

        {/* User Profile Card */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            marginBottom: '0.85rem', padding: '0.5rem',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #1e293b'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.82rem', fontWeight: 700,
            }}>
              {getInitials(user?.name)}
            </div>
            <div style={{ overflow: 'hidden', minWidth: 0, flexGrow: 1 }}>
              <p style={{
                fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {user?.name || 'Healthcare User'}
              </p>
              <span className={`badge ${getRoleBadge(user?.role)}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.45rem', marginTop: '0.15rem' }}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{
              width: '100%', padding: '0.5rem', fontSize: '0.82rem',
              background: 'transparent', color: '#94a3b8',
              borderColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = '#ef4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.borderColor = '#334155';
            }}
          >
            <LogOutIcon size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content fade-in">
        <header className="navbar">
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital'} &bull; {user?.role} Workspace
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user?.department && (
              <div style={{
                background: '#ffffff',
                border: '1px solid var(--border-main)',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                boxShadow: 'var(--shadow-sm)'
              }} className="d-none-mobile">
                Department: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{user.department}</span>
              </div>
            )}
            <NotificationBell />
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
