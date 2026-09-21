import React from 'react';
import VitalAlerts from '../shared/VitalAlerts';

export default function PatientProfile({ patientProfile }) {
  if (!patientProfile) return null;

  const getInitials = (name) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
      {/* Patient Overview Card */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--color-primary)',
            color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, margin: '0 auto 1rem auto',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {getInitials(patientProfile.name)}
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>{patientProfile.name}</h2>
          <span className="badge badge-success" style={{ marginTop: '0.35rem' }}>{patientProfile.status}</span>
        </div>

        <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'block' }}>Phone</span>
            <b style={{ color: 'var(--text-main)' }}>{patientProfile.phone || '—'}</b>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'block' }}>Email</span>
            <b style={{ color: 'var(--text-main)' }}>{patientProfile.email || '—'}</b>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'block' }}>Date of Birth</span>
            <b style={{ color: 'var(--text-main)' }}>{patientProfile.dob ? new Date(patientProfile.dob).toLocaleDateString() : '—'}</b>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'block' }}>Gender</span>
            <b style={{ color: 'var(--text-main)' }}>{patientProfile.gender || '—'}</b>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'block' }}>Address</span>
            <b style={{ color: 'var(--text-main)' }}>{patientProfile.address || '—'}</b>
          </div>

          {patientProfile.status === 'Admitted' && (
            <div className="glass-card" style={{ marginTop: '1rem', borderLeft: '3px solid var(--color-danger)', padding: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Assigned Bed</span>
                <b style={{ color: 'var(--text-main)' }}>{patientProfile.assignedBed?.bedNumber || 'Unassigned'}</b>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Attending Physician</span>
                <b style={{ color: 'var(--text-main)' }}>{patientProfile.attendingDoctor?.name || 'Dr. On Call'}</b>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vitals History & Diagnoses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Recent Vital Logs</h3>
          <div className="table-container">
            <table className="custom-table" style={{ fontSize: '0.88rem' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Temp (°F)</th>
                  <th>BP</th>
                  <th>Pulse</th>
                  <th>SpO2</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {patientProfile.vitals?.map((v, idx) => (
                  <tr key={idx}>
                    <td>{new Date(v.timestamp).toLocaleDateString()}</td>
                    <td>{v.temperature}°F</td>
                    <td>{v.bloodPressure}</td>
                    <td>{v.pulseRate} bpm</td>
                    <td>{v.spO2}%</td>
                    <td><VitalAlerts vitals={v} /></td>
                  </tr>
                ))}
                {(!patientProfile.vitals || patientProfile.vitals.length === 0) && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No vitals charted yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>Medical Diagnosis Records</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {patientProfile.medicalHistory?.map((h, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <b>{h.condition}</b>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(h.diagnosedDate).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{h.notes}</p>
              </div>
            ))}
            {(!patientProfile.medicalHistory || patientProfile.medicalHistory.length === 0) && (
              <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No previous diagnoses logged.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
