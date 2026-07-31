import React from 'react';
import VitalAlerts from '../shared/VitalAlerts';

export default function PatientProfile({ patientProfile }) {
  if (!patientProfile) return null;

  return (
    <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
      {/* Card Info */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', margin: '0 auto 1rem auto'
          }}>
            👩
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{patientProfile.name}</h2>
          <span className="badge badge-success">{patientProfile.status}</span>
        </div>

        <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p>📞 Phone: <b>{patientProfile.phone}</b></p>
          <p>✉️ Email: <b>{patientProfile.email}</b></p>
          <p>🎂 DOB: <b>{new Date(patientProfile.dob).toLocaleDateString()}</b></p>
          <p>⚧️ Gender: <b>{patientProfile.gender}</b></p>
          <p>📍 Address: <b>{patientProfile.address}</b></p>
          {patientProfile.status === 'Admitted' && (
            <div className="glass-card" style={{ marginTop: '1rem', borderLeft: '3px solid var(--color-danger)' }}>
              <p>🛏️ Assigned Bed: <b>{patientProfile.assignedBed?.bedNumber}</b></p>
              <p>🩺 Attending: <b>{patientProfile.attendingDoctor?.name}</b></p>
            </div>
          )}
        </div>
      </div>

      {/* Vitals History & Diagnoses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Recent Vital Logs</h3>
          <div className="table-container">
            <table className="custom-table" style={{ fontSize: '0.85rem' }}>
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
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Medical Diagnosis Records</h3>
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
