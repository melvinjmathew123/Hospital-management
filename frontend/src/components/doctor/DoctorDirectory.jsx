import React from 'react';

export default function DoctorDirectory({ patients, selectedPatient, setSelectedPatient }) {
  return (
    <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Patient List</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {patients.map((p) => (
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
              <div style={{ fontWeight: 'bold' }}>{p.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                DOB: {new Date(p.dob).toLocaleDateString()} • Gender: {p.gender}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {selectedPatient ? (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Clinical Profile: {selectedPatient.name}</h2>
            <div className="grid-2-col" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Basic Info</h3>
                <p>Phone: {selectedPatient.phone}</p>
                <p>DOB: {new Date(selectedPatient.dob).toLocaleDateString()}</p>
                <p>Gender: {selectedPatient.gender}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Clinical Status</h3>
                <span className={`badge ${selectedPatient.status === 'Admitted' ? 'badge-danger' : 'badge-success'}`}>{selectedPatient.status}</span>
                {selectedPatient.status === 'Admitted' && (
                  <p style={{ marginTop: '0.5rem' }}>Room Bed: {selectedPatient.assignedBed?.bedNumber || 'Assigned'}</p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current Vitals</h3>
              {selectedPatient.vitals && selectedPatient.vitals.length > 0 ? (
                <div className="grid-4-col" style={{ gap: '1rem' }}>
                  <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Temp</p>
                    <b>{selectedPatient.vitals[selectedPatient.vitals.length - 1].temperature}°F</b>
                  </div>
                  <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BP</p>
                    <b>{selectedPatient.vitals[selectedPatient.vitals.length - 1].bloodPressure}</b>
                  </div>
                  <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pulse</p>
                    <b>{selectedPatient.vitals[selectedPatient.vitals.length - 1].pulseRate} bpm</b>
                  </div>
                  <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SpO2</p>
                    <b>{selectedPatient.vitals[selectedPatient.vitals.length - 1].spO2}%</b>
                  </div>
                </div>
              ) : (
                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No vitals recorded yet.</p>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Medical Diagnosis History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedPatient.medicalHistory?.map((h, i) => (
                  <div key={i} className="glass-card" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{h.condition}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Diagnosed: {new Date(h.diagnosedDate).toLocaleDateString()}</div>
                    <p style={{ marginTop: '0.25rem' }}>{h.notes}</p>
                  </div>
                ))}
                {(!selectedPatient.medicalHistory || selectedPatient.medicalHistory.length === 0) && (
                  <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No prior diagnosis logged.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
            Select a patient from the list to view complete medical files.
          </div>
        )}
      </div>
    </div>
  );
}
