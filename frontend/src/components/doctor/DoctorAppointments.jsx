import React from 'react';

export default function DoctorAppointments({ appointments, onStartConsultation }) {
  return (
    <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Daily Queue</h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Capacity: Up to 10 patients per time slot
        </span>
      </div>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Token #</th>
              <th>Time Slot</th>
              <th>Patient</th>
              <th>Age/Gender</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => {
              const age = appt.patient ? new Date().getFullYear() - new Date(appt.patient.dob).getFullYear() : '-';
              const badgeClass = appt.status === 'Completed' ? 'badge-success' : appt.status === 'In Progress' ? 'badge-warning' : 'badge-info';
              return (
                <tr key={appt._id}>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      Token #{appt.slotNumber || 1}
                    </span>
                  </td>
                  <td><span className="badge badge-info">{appt.timeSlot}</span></td>
                  <td><b>{appt.patient?.name || 'Walk-in Patient'}</b></td>
                  <td>{age} yrs / {appt.patient?.gender}</td>
                  <td>{appt.reason}</td>
                  <td><span className={`badge ${badgeClass}`}>{appt.status}</span></td>
                  <td>
                    {appt.status !== 'Completed' && (
                      <button
                        onClick={() => onStartConsultation(appt)}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        🩺 Consult
                      </button>
                    )}
                    {appt.status === 'Completed' && (
                      <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>Done</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {appointments.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No appointments scheduled for today.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
