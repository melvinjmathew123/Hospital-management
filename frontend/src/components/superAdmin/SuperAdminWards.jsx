import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function SuperAdminWards({ wards, departments, token, onRefresh, showMsg }) {
  const [newWard, setNewWard] = useState({ name: '', department: '', type: 'General' });

  const handleAddWard = async (e) => {
    e.preventDefault();
    if (!newWard.department) {
      showMsg('Please select a department', 'danger');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/hospital/wards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newWard)
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Ward added successfully');
        setNewWard({ name: '', department: '', type: 'General' });
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error adding ward', 'danger');
    }
  };

  return (
    <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Add Ward</h2>
        <form onSubmit={handleAddWard}>
          <div className="form-group">
            <label className="form-label">Ward Name</label>
            <input
              type="text" className="form-input" required placeholder="e.g. Ward C (Pediatrics)"
              value={newWard.name}
              onChange={(e) => setNewWard({ ...newWard, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              className="form-select" value={newWard.department}
              onChange={(e) => setNewWard({ ...newWard, department: e.target.value })}
            >
              <option value="">-- Select Department --</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name} ({d.type})</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Ward Class</label>
            <select
              className="form-select" value={newWard.type}
              onChange={(e) => setNewWard({ ...newWard, type: e.target.value })}
            >
              <option value="General">General</option>
              <option value="ICU">ICU</option>
              <option value="Private">Private</option>
              <option value="Semi-Private">Semi-Private</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            ➕ Create Ward
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Ward Registry</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ward Name</th>
                <th>Department</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody>
              {wards.map((ward) => (
                <tr key={ward._id}>
                  <td><b>{ward.name}</b></td>
                  <td>{ward.department?.name || 'Unknown'}</td>
                  <td><span className="badge badge-success">{ward.type}</span></td>
                </tr>
              ))}
              {wards.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No wards found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
