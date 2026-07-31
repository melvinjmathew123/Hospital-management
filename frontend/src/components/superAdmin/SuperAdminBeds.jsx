import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function SuperAdminBeds({ beds, wards, token, onRefresh, showMsg }) {
  const [newBed, setNewBed] = useState({ bedNumber: '', ward: '' });

  const handleAddBed = async (e) => {
    e.preventDefault();
    if (!newBed.ward) {
      showMsg('Please select a ward', 'danger');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/hospital/beds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newBed)
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Bed added successfully');
        setNewBed({ bedNumber: '', ward: '' });
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error adding bed', 'danger');
    }
  };

  return (
    <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Add Bed</h2>
        <form onSubmit={handleAddBed}>
          <div className="form-group">
            <label className="form-label">Bed Identifier</label>
            <input
              type="text" className="form-input" required placeholder="e.g. B-101"
              value={newBed.bedNumber}
              onChange={(e) => setNewBed({ ...newBed, bedNumber: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Ward Placement</label>
            <select
              className="form-select" value={newBed.ward}
              onChange={(e) => setNewBed({ ...newBed, ward: e.target.value })}
            >
              <option value="">-- Select Ward --</option>
              {wards.map(w => (
                <option key={w._id} value={w._id}>{w.name} ({w.department?.name})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            ➕ Create Bed
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Bed Allocations & Statuses</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Bed #</th>
                <th>Ward / Dept</th>
                <th>Status</th>
                <th>Occupant</th>
              </tr>
            </thead>
            <tbody>
              {beds.map((bed) => {
                const statusClass = bed.status === 'Available' ? 'badge-success' : bed.status === 'Occupied' ? 'badge-danger' : 'badge-warning';
                return (
                  <tr key={bed._id}>
                    <td><b>{bed.bedNumber}</b></td>
                    <td>{bed.ward?.name} / <span style={{ color: 'var(--text-muted)' }}>{bed.ward?.department?.name}</span></td>
                    <td><span className={`badge ${statusClass}`}>{bed.status}</span></td>
                    <td>{bed.currentPatient ? bed.currentPatient.name : <i style={{ color: 'var(--text-muted)' }}>None</i>}</td>
                  </tr>
                );
              })}
              {beds.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No beds registered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
