import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';
import VitalAlerts from '../shared/VitalAlerts';

export default function NurseVitals({ patients, token, onRefresh, showMsg }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [temp, setTemp] = useState('98.6');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [spO2, setSpO2] = useState('98');
  const [nurseNote, setNurseNote] = useState('');

  const handleRecordVitals = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      const resV = await fetch(`${API_URL}/patients/${selectedPatient._id}/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ temperature: temp, bloodPressure: bp, pulseRate: pulse, spO2 })
      });
      const dataV = await resV.json();

      if (nurseNote) {
        await fetch(`${API_URL}/patients/${selectedPatient._id}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ note: nurseNote })
        });
      }

      if (dataV.success) {
        showMsg('Patient vitals logged successfully.');
        setTemp('98.6');
        setBp('120/80');
        setPulse('72');
        setSpO2('98');
        setNurseNote('');
        setSelectedPatient(null);
        if (onRefresh) onRefresh();
      } else {
        showMsg(dataV.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error saving vitals log', 'danger');
    }
  };

  const admittedPatients = patients.filter(p => p.status === 'Admitted');

  return (
    <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Select Inpatient</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {admittedPatients.map((p) => (
            <div
              key={p._id}
              onClick={() => setSelectedPatient(p)}
              className="glass-card"
              style={{
                cursor: 'pointer',
                borderColor: selectedPatient?._id === p._id ? 'var(--color-primary)' : undefined,
                background: selectedPatient?._id === p._id ? 'rgba(255,255,255,0.06)' : undefined
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{p.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Bed: {p.assignedBed?.bedNumber} • Doctor: {p.attendingDoctor?.name}
              </div>
              {p.vitals && p.vitals.length > 0 && (
                <VitalAlerts vitals={p.vitals[p.vitals.length - 1]} />
              )}
            </div>
          ))}
          {admittedPatients.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No inpatients in wards.</p>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Enter Clinical Record</h2>
        {selectedPatient ? (
          <form onSubmit={handleRecordVitals}>
            {(temp || bp || pulse || spO2) && (
              <div style={{
                marginBottom: '1.5rem', padding: '1rem',
                background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)'
              }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Health Status Preview</p>
                <VitalAlerts vitals={{ temperature: temp, bloodPressure: bp, pulseRate: pulse, spO2 }} />
              </div>
            )}
            <div className="grid-2-col" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Temperature (°F)</label>
                <input
                  type="text" className="form-input" required
                  value={temp} onChange={(e) => setTemp(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Blood Pressure (BP)</label>
                <input
                  type="text" className="form-input" required
                  value={bp} onChange={(e) => setBp(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2-col" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Pulse Rate (bpm)</label>
                <input
                  type="text" className="form-input" required
                  value={pulse} onChange={(e) => setPulse(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Blood Oxygen (SpO2 %)</label>
                <input
                  type="text" className="form-input" required
                  value={spO2} onChange={(e) => setSpO2(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Nursing Status Logs / Notes</label>
              <textarea
                className="form-textarea" rows="4"
                placeholder="Describe patient posture, fluid intake, medication compliance, etc."
                value={nurseNote} onChange={(e) => setNurseNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                📈 Log Vitals & Notes
              </button>
              <button type="button" onClick={() => setSelectedPatient(null)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
            Select a patient from the inpatient list on the left to enter vital charts.
          </div>
        )}
      </div>
    </div>
  );
}
