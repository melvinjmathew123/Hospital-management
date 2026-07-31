import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function SuperAdminDepartments({ departments, token, onRefresh, showMsg }) {
  const [newDept, setNewDept] = useState({ name: '', type: 'OPD' });

  const handleAddDept = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/hospital/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newDept)
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Department added successfully');
        setNewDept({ name: '', type: 'OPD' });
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error adding department', 'danger');
    }
  };

  return (
    <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Add Department</h2>
        <form onSubmit={handleAddDept}>
          <div className="form-group">
            <label className="form-label">Department Name</label>
            <input
              type="text" className="form-input" required placeholder="e.g. Cardiology"
              value={newDept.name}
              onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Service Type</label>
            <select
              className="form-select" value={newDept.type}
              onChange={(e) => setNewDept({ ...newDept, type: e.target.value })}
            >
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
              <option value="ICU">ICU</option>
              <option value="Emergency">Emergency</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            ➕ Create Department
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Department Registry</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Type</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id}>
                  <td><b>{dept.name}</b></td>
                  <td><span className="badge badge-info">{dept.type}</span></td>
                  <td>{new Date(dept.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No departments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
