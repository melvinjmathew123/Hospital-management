import React from 'react';

export default function PatientAppointments({ appointments }) {
  return (
    <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>My Appointment Schedule</h2>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time Slot &amp; Token</th>
              <th>Attending Doctor</th>
              <th>Location / Department</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => {
              const badgeClass = appt.status === 'Completed' ? 'badge-success' : appt.status === 'Cancelled' ? 'badge-danger' : 'badge-info';
              return (
                <tr key={appt._id}>
                  <td><b>{new Date(appt.date).toLocaleDateString()}</b></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-info">{appt.timeSlot}</span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8'
                      }}>
                        Token #{appt.slotNumber || 1}
                      </span>
                    </div>
                  </td>
                  <td>{appt.doctor?.name}</td>
                  <td>{appt.doctor?.department || 'Outpatient Clinic'}</td>
                  <td><span className="badge badge-info">{appt.type}</span></td>
                  <td><span className={`badge ${badgeClass}`}>{appt.status}</span></td>
                </tr>
              );
            })}
            {appointments.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No appointments scheduled.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
