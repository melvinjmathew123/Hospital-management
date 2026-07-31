import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function NurseAdmissions({ patients, beds, doctors, token, onRefresh, showMsg }) {
  const [admitPatientId, setAdmitPatientId] = useState('');
  const [admitBedId, setAdmitBedId] = useState('');
  const [admitDoctorId, setAdmitDoctorId] = useState('');

  const handleAdmitPatient = async (e) => {
    e.preventDefault();
    if (!admitPatientId || !admitBedId || !admitDoctorId) {
      showMsg('Please select patient, bed, and doctor', 'danger');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/patients/${admitPatientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          status: 'Admitted',
          assignedBed: admitBedId,
          attendingDoctor: admitDoctorId
        })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Patient admitted successfully and bed status updated.');
        setAdmitPatientId('');
        setAdmitBedId('');
        setAdmitDoctorId('');
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error during patient admission', 'danger');
    }
  };

  const handleDischargePatient = async (patientId) => {
    try {
      const res = await fetch(`${API_URL}/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          status: 'Discharged',
          assignedBed: null
        })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Discharge summary generated. Bed released.');
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error during patient discharge', 'danger');
    }
  };

  return (
    <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Admit Patient</h2>
        <form onSubmit={handleAdmitPatient}>
          <div className="form-group">
            <label className="form-label">Patient (OPD Intake)</label>
            <select
              className="form-select" required
              value={admitPatientId}
              onChange={(e) => setAdmitPatientId(e.target.value)}
            >
              <option value="">-- Select Patient --</option>
              {patients.filter(p => p.status !== 'Admitted').map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.status})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assign Available Bed</label>
            <select
              className="form-select" required
              value={admitBedId}
              onChange={(e) => setAdmitBedId(e.target.value)}
            >
              <option value="">-- Select Bed --</option>
              {beds.filter(b => b.status === 'Available').map(b => (
                <option key={b._id} value={b._id}>{b.bedNumber} ({b.ward?.name})</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Attending Doctor</label>
            <select
              className="form-select" required
              value={admitDoctorId}
              onChange={(e) => setAdmitDoctorId(e.target.value)}
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>{d.name} ({d.department})</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            ➕ Allocate Bed & Admit
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Current Inpatient Admissions</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Ward & Bed</th>
                <th>Attending Doctor</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.filter(p => p.status === 'Admitted').map((p) => (
                <tr key={p._id}>
                  <td><b>{p.name}</b></td>
                  <td>{p.assignedBed?.bedNumber} (<span style={{ color: 'var(--text-muted)' }}>{p.assignedBed?.ward?.name}</span>)</td>
                  <td>{p.attendingDoctor?.name}</td>
                  <td>
                    <button
                      onClick={() => handleDischargePatient(p._id)}
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Discharge
                    </button>
                  </td>
                </tr>
              ))}
              {patients.filter(p => p.status === 'Admitted').length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No patients currently admitted to wards.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
