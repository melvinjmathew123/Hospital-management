import React from 'react';

export default function PatientPrescriptions({ consultations }) {
  return (
    <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>My Prescribed Medications</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {consultations.map((consult) => (
          <div key={consult._id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
              <span>Diagnosis: <b>{consult.diagnosis}</b></span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: {new Date(consult.date).toLocaleDateString()} by {consult.doctor?.name}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {consult.medications?.map((med, i) => (
                <div key={i} className="glass-card" style={{ background: 'rgba(255,255,255,0.01)', padding: '0.75rem' }}>
                  <h4 style={{ color: 'var(--color-primary)', fontSize: '0.95rem' }}>💊 {med.name}</h4>
                  <p style={{ fontSize: '0.85rem' }}>Dosage: {med.dosage}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Freq: {med.frequency}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Duration: {med.duration}</p>
                </div>
              ))}
            </div>

            {consult.treatmentPlan && (
              <p style={{ fontSize: '0.85rem', marginTop: '1rem', color: 'var(--text-muted)' }}>
                <b>Instructions:</b> {consult.treatmentPlan}
              </p>
            )}
          </div>
        ))}
        {consultations.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No historical prescription reports available.</p>
        )}
      </div>
    </div>
  );
}
