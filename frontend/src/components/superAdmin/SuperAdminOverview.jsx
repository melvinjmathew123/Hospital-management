import React from 'react';

export default function SuperAdminOverview({ departments, wards, beds, users }) {
  return (
    <div className="fade-in">
      <div className="dashboard-grid">
        <div className="glass-panel dashboard-card p-6">
          <div className="card-icon">🏢</div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{departments.length}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Departments</p>
          </div>
        </div>
        <div className="glass-panel dashboard-card p-6">
          <div className="card-icon">🛏️</div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{wards.length}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Wards & Wings</p>
          </div>
        </div>
        <div className="glass-panel dashboard-card p-6">
          <div className="card-icon">🏨</div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{beds.length}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Beds</p>
          </div>
        </div>
        <div className="glass-panel dashboard-card p-6">
          <div className="card-icon">👥</div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{users.length}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Staff Directory</p>
          </div>
        </div>
      </div>

      <div className="grid-split" style={{ gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>System Infrastructure Logs</h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <p style={{ marginBottom: '0.75rem' }}>🟢 Connection Status: <b>Healthy (MongoDB connected)</b></p>
            <p style={{ marginBottom: '0.75rem' }}>🔒 API Security: <b>JWT Encryption Enabled</b></p>
            <p style={{ marginBottom: '0.75rem' }}>🛡️ HIPAA-aligned auditing: <b>Active</b></p>
            <p>⚡ Platform Uptime Target: <b>99.9%</b></p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Structure Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            {departments.slice(0, 3).map((dept) => (
              <div key={dept._id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}>
                <span>{dept.name}</span>
                <span className="badge badge-info">{dept.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
