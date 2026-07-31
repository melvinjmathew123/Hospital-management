import React from 'react';

export default function DoctorHistory({ historyLogs }) {
  return (
    <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Past Consultations Logs</h2>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Diagnosis</th>
              <th>Treatment Plan</th>
              <th>Lab Orders</th>
              <th>Prescriptions</th>
            </tr>
          </thead>
          <tbody>
            {historyLogs.map((log) => (
              <tr key={log._id}>
                <td>{new Date(log.date).toLocaleDateString()}</td>
                <td><b>{log.patient?.name}</b></td>
                <td>{log.diagnosis}</td>
                <td>{log.treatmentPlan}</td>
                <td>
                  {log.labOrders && log.labOrders.length > 0 ? (
                    log.labOrders.map((l, i) => <div key={i} style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>• {l}</div>)
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                  )}
                </td>
                <td>
                  {log.medications && log.medications.length > 0 ? (
                    log.medications.map((m, i) => <div key={i} style={{ fontSize: '0.75rem' }}>{m.name} ({m.dosage}) - {m.frequency}</div>)
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                  )}
                </td>
              </tr>
            ))}
            {historyLogs.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No historical consultations logged.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
