import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function AdminPatients({ patients, token, onRefresh, showMsg }) {
  const [newPatient, setNewPatient] = useState({
    name: '', email: '', phone: '', dob: '', gender: 'Male', address: ''
  });

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newPatient)
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Patient registered successfully. Created default OPD record.');
        setNewPatient({ name: '', email: '', phone: '', dob: '', gender: 'Male', address: '' });
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error registering patient', 'danger');
    }
  };

  return (
    <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Patient Registration</h2>
        <form onSubmit={handleRegisterPatient}>
          <div className="form-group">
            <label className="form-label">Patient Name</label>
            <input
              type="text" className="form-input" required placeholder="e.g. Samuel L. Jackson"
              value={newPatient.name}
              onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address (Optional)</label>
            <input
              type="email" className="form-input" placeholder="e.g. sam@example.com"
              value={newPatient.email}
              onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text" className="form-input" required placeholder="e.g. 555-0122"
              value={newPatient.phone}
              onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date" className="form-input" required
              value={newPatient.dob}
              onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-select" value={newPatient.gender}
              onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Residential Address</label>
            <input
              type="text" className="form-input" required placeholder="e.g. 742 Evergreen Terrace"
              value={newPatient.address}
              onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            📝 Register Intake
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Patient Directory</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age/Gender</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Doctor / Bed</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
                const statusClass = p.status === 'Admitted' ? 'badge-danger' : p.status === 'Discharged' ? 'badge-success' : 'badge-info';
                return (
                  <tr key={p._id}>
                    <td><b>{p.name}</b></td>
                    <td>{age} yrs / {p.gender}</td>
                    <td>{p.phone}</td>
                    <td><span className={`badge ${statusClass}`}>{p.status}</span></td>
                    <td>
                      {p.status === 'Admitted' ? (
                        <span>🩺 {p.attendingDoctor?.name || 'Assigned'} <br /> 🛏️ {p.assignedBed?.bedNumber || 'Assigned'}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Outpatient Clinic</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {patients.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
