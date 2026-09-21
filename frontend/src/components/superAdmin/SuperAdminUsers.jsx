import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function SuperAdminUsers({ users, token, onRefresh, showMsg }) {
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Doctor', phone: '', department: '' });

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Staff account created successfully');
        setNewUser({ name: '', email: '', password: '', role: 'Doctor', phone: '', department: '' });
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error creating user', 'danger');
    }
  };

  const toggleUserStatus = async (userObj) => {
    const nextStatus = userObj.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`${API_URL}/auth/users/${userObj._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        showMsg(`User is now ${nextStatus}`);
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error toggling status', 'danger');
    }
  };

  return (
    <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Create Staff Account</h2>
        <form onSubmit={handleAddUser}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text" className="form-input" required placeholder="e.g. Dr. Jane Watson"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" className="form-input" required placeholder="e.g. j.watson@apollo.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" className="form-input" required placeholder="••••••••"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role Assignment</label>
            <select
              className="form-select" value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Hospital Admin">Hospital Admin</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Lab Technician">Lab Technician</option>
              <option value="Pharmacist">Pharmacist</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="text" className="form-input" placeholder="e.g. 555-0199"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Department Assign (e.g. Cardiology, Lab, etc.)</label>
            <input
              type="text" className="form-input" placeholder="e.g. Pediatrics"
              value={newUser.department}
              onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            ➕ Create Account
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Employee Directory</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Dept</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><b>{u.name}</b></td>
                  <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                  <td><span className="badge badge-info">{u.role}</span></td>
                  <td>{u.department || '-'}</td>
                  <td>
                    <span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleUserStatus(u)}
                      className="btn"
                      style={{
                        padding: '0.25rem 0.5rem', fontSize: '0.75rem',
                        background: u.status === 'Active' ? '#fef2f2' : '#f0fdf4',
                        color: u.status === 'Active' ? '#b91c1c' : '#15803d',
                        border: u.status === 'Active' ? '1px solid #fecaca' : '1px solid #bbf7d0',
                        borderRadius: '6px'
                      }}
                    >
                      {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No accounts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
