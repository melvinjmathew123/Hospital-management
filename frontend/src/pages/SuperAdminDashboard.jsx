import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { API_URL, useAuth } from '../context/AuthContext';

export default function SuperAdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data lists
  const [departments, setDepartments] = useState([]);
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [users, setUsers] = useState([]);

  // Forms states
  const [newDept, setNewDept] = useState({ name: '', type: 'OPD' });
  const [newWard, setNewWard] = useState({ name: '', department: '', type: 'General' });
  const [newBed, setNewBed] = useState({ bedNumber: '', ward: '' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Doctor', phone: '', department: '' });

  // Status/Messages
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchAll = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const resD = await fetch(`${API_URL}/hospital/departments`, { headers });
      const dataD = await resD.json();
      if (dataD.success) setDepartments(dataD.departments);

      const resW = await fetch(`${API_URL}/hospital/wards`, { headers });
      const dataW = await resW.json();
      if (dataW.success) setWards(dataW.wards);

      const resB = await fetch(`${API_URL}/hospital/beds`, { headers });
      const dataB = await resB.json();
      if (dataB.success) setBeds(dataB.beds);

      const resU = await fetch(`${API_URL}/auth/users`, { headers });
      const dataU = await resU.json();
      if (dataU.success) setUsers(dataU.users);

    } catch (err) {
      showMsg('Failed to load data from backend server', 'danger');
    }
  };

  useEffect(() => {
    fetchAll();
  }, [activeTab]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 5000);
  };

  // Submit Handlers
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
        fetchAll();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error adding department', 'danger');
    }
  };

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
        fetchAll();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error adding ward', 'danger');
    }
  };

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
        fetchAll();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error adding bed', 'danger');
    }
  };

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
        fetchAll();
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
        fetchAll();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error toggling status', 'danger');
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
    { id: 'departments', label: 'Departments', icon: '🏢' },
    { id: 'wards', label: 'Wards', icon: '🛏️' },
    { id: 'beds', label: 'Beds & Rooms', icon: '🏨' },
    { id: 'users', label: 'User Directory', icon: '👥' }
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      {msg.text && (
        <div className="fade-in" style={{
          background: msg.type === 'danger' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: msg.type === 'danger' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
          color: msg.type === 'danger' ? '#fca5a5' : '#34d399',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontWeight: 500
        }}>
          {msg.text}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="fade-in">
          <div className="dashboard-grid">
            <div className="glass-panel dashboard-card p-6">
              <div className="card-icon">🏢</div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{departments.length}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Departments</p>
              </div>
            </div>
            <div className="glass-panel dashboard-card p-6">
              <div className="card-icon">🛏️</div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{wards.length}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Wards & Wings</p>
              </div>
            </div>
            <div className="glass-panel dashboard-card p-6">
              <div className="card-icon">🏨</div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{beds.length}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Beds</p>
              </div>
            </div>
            <div className="glass-panel dashboard-card p-6">
              <div className="card-icon">👥</div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{users.length}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Staff Directory</p>
              </div>
            </div>
          </div>

          <div className="grid-split" style={{ gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>System Infrastructure Logs</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <p style={{ marginBottom: '0.75rem' }}>🟢 Connection Status: <b>Healthy (MongoDB connected)</b></p>
                <p style={{ marginBottom: '0.75rem' }}>🔒 API Security: <b>JWT Encryption Enabled</b></p>
                <p style={{ marginBottom: '0.75rem' }}>🛡️ HIPAA-aligned auditing: <b>Active</b></p>
                <p>⚡ Platform Uptime Target: <b>99.9%</b></p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Structure Summary</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                {departments.slice(0, 3).map((dept) => (
                  <div key={dept._id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}>
                    <span>{dept.name}</span>
                    <span className="badge badge-info">{dept.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Add Department</h2>
            <form onSubmit={handleAddDept}>
              <div className="form-group">
                <label className="form-label">Department Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Cardiology"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Service Type</label>
                <select
                  className="form-select"
                  value={newDept.type}
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
      )}

      {/* Wards Tab */}
      {activeTab === 'wards' && (
        <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Add Ward</h2>
            <form onSubmit={handleAddWard}>
              <div className="form-group">
                <label className="form-label">Ward Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Ward C (Pediatrics)"
                  value={newWard.name}
                  onChange={(e) => setNewWard({ ...newWard, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={newWard.department}
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
                  className="form-select"
                  value={newWard.type}
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
      )}

      {/* Beds Tab */}
      {activeTab === 'beds' && (
        <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Add Bed</h2>
            <form onSubmit={handleAddBed}>
              <div className="form-group">
                <label className="form-label">Bed Identifier</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. B-101"
                  value={newBed.bedNumber}
                  onChange={(e) => setNewBed({ ...newBed, bedNumber: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Ward Placement</label>
                <select
                  className="form-select"
                  value={newBed.ward}
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
      )}

      {/* Users/Staff Tab */}
      {activeTab === 'users' && (
        <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Create Staff Account</h2>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Dr. Jane Watson"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="e.g. j.watson@apollo.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role Assignment</label>
                <select
                  className="form-select"
                  value={newUser.role}
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
                  type="text"
                  className="form-input"
                  placeholder="e.g. 555-0199"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Department Assign (e.g. Cardiology, Lab, etc.)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Pediatrics"
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
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            background: u.status === 'Active' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: u.status === 'Active' ? '#fca5a5' : '#34d399',
                            border: 'none'
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
      )}
    </DashboardLayout>
  );
}
