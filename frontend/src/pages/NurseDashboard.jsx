import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { API_URL, useAuth } from '../context/AuthContext';

// ─── Vitals Health Analyzer ───────────────────────────────────────────────────
function analyzeVitals(vitals) {
  const alerts = [];
  if (!vitals) return alerts;

  const temp = parseFloat(vitals.temperature);
  const pulse = parseInt(vitals.pulseRate, 10);
  const spo2 = parseInt(vitals.spO2, 10);
  const bpParts = (vitals.bloodPressure || '').split('/');
  const systolic = parseInt(bpParts[0], 10);
  const diastolic = parseInt(bpParts[1], 10);

  if (temp > 99.5) alerts.push({ label: 'Fever', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: '🔥' });
  else if (temp < 96.0) alerts.push({ label: 'Hypothermia', color: '#60a5fa', bg: 'rgba(59,130,246,0.15)', icon: '🧊' });

  if (!isNaN(systolic) && (systolic > 135 || (!isNaN(diastolic) && diastolic > 85)))
    alerts.push({ label: 'High BP', color: '#f87171', bg: 'rgba(239,68,68,0.12)', icon: '❤️' });

  if (pulse > 100) alerts.push({ label: 'Tachycardia', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', icon: '⚡' });
  else if (pulse < 60) alerts.push({ label: 'Bradycardia', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', icon: '⚡' });

  if (spo2 < 95) alerts.push({ label: 'Low SpO2', color: '#f87171', bg: 'rgba(239,68,68,0.15)', icon: '🫁' });

  return alerts;
}

function VitalAlerts({ vitals }) {
  const alerts = analyzeVitals(vitals);
  if (alerts.length === 0) return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: 'rgba(16,185,129,0.15)', color: '#34d399',
      borderRadius: '9999px', padding: '0.15rem 0.55rem', fontSize: '0.7rem', fontWeight: 700
    }}>✅ Normal</span>
  );
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.25rem' }}>
      {alerts.map((a, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          background: a.bg, color: a.color, border: `1px solid ${a.color}40`,
          borderRadius: '9999px', padding: '0.15rem 0.55rem', fontSize: '0.7rem', fontWeight: 700
        }}>{a.icon} {a.label}</span>
      ))}
    </div>
  );
}

export default function NurseDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('beds');

  // Core Data
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Selections & Forms
  const [selectedBed, setSelectedBed] = useState(null);
  const [bedStatusUpdate, setBedStatusUpdate] = useState('Available');
  
  // Admission Form
  const [admitPatientId, setAdmitPatientId] = useState('');
  const [admitBedId, setAdmitBedId] = useState('');
  const [admitDoctorId, setAdmitDoctorId] = useState('');

  // Vitals Form
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [temp, setTemp] = useState('98.6');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [spO2, setSpO2] = useState('98');
  const [nurseNote, setNurseNote] = useState('');

  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchAll = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const resB = await fetch(`${API_URL}/hospital/beds`, { headers });
      const dataB = await resB.json();
      if (dataB.success) setBeds(dataB.beds);

      const resP = await fetch(`${API_URL}/patients`, { headers });
      const dataP = await resP.json();
      if (dataP.success) setPatients(dataP.patients);

      const resD = await fetch(`${API_URL}/auth/users?role=Doctor`, { headers });
      const dataD = await resD.json();
      if (dataD.success) setDoctors(dataD.users);

    } catch (err) {
      showMsg('Failed to load nurse clinical data', 'danger');
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
  const handleUpdateBedStatus = async (e) => {
    e.preventDefault();
    if (!selectedBed) return;
    try {
      const res = await fetch(`${API_URL}/hospital/beds/${selectedBed._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: bedStatusUpdate })
      });
      const data = await res.json();
      if (data.success) {
        showMsg(`Bed ${selectedBed.bedNumber} status updated successfully.`);
        setSelectedBed(null);
        fetchAll();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error updating bed', 'danger');
    }
  };

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
        fetchAll();
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
        fetchAll();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error during patient discharge', 'danger');
    }
  };

  const handleRecordVitals = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      // 1. Post Vitals
      const resV = await fetch(`${API_URL}/patients/${selectedPatient._id}/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ temperature: temp, bloodPressure: bp, pulseRate: pulse, spO2 })
      });
      const dataV = await resV.json();

      // 2. Post Nurse Notes if added
      if (nurseNote) {
        await fetch(`${API_URL}/patients/${selectedPatient._id}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ note: nurseNote })
        });
      }

      if (dataV.success) {
        showMsg('Patient vitals logged successfully.');
        setTemp('98.6');
        setBp('120/80');
        setPulse('72');
        setSpO2('98');
        setNurseNote('');
        setSelectedPatient(null);
        fetchAll();
      } else {
        showMsg(dataV.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error saving vitals log', 'danger');
    }
  };

  const sidebarItems = [
    { id: 'beds', label: 'Beds Grid Matrix', icon: '🛏️' },
    { id: 'admissions', label: 'Ward Admissions', icon: '🏨' },
    { id: 'vitals', label: 'Log Patient Vitals', icon: '📈' }
  ];

  // Group beds by ward for rendering
  const wardsMap = {};
  beds.forEach(bed => {
    const wName = bed.ward?.name || 'Unassigned Wards';
    if (!wardsMap[wName]) wardsMap[wName] = [];
    wardsMap[wName].push(bed);
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      {msg.text && (
        <div style={{
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

      {/* Bed Grid Tab */}
      {activeTab === 'beds' && (
        <div className="fade-in grid-split" style={{ gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Interactive Ward Bed Layout</h2>
            {Object.keys(wardsMap).map(wardName => (
              <div key={wardName} style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.25rem' }}>
                  {wardName}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                  {wardsMap[wardName].map(bed => {
                    const isAvail = bed.status === 'Available';
                    const isOccupied = bed.status === 'Occupied';
                    const bg = isAvail ? 'rgba(16, 185, 129, 0.15)' : isOccupied ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
                    const border = isAvail ? 'rgba(16, 185, 129, 0.3)' : isOccupied ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)';
                    const color = isAvail ? '#34d399' : isOccupied ? '#fca5a5' : '#fde047';
                    return (
                      <div
                        key={bed._id}
                        onClick={() => { setSelectedBed(bed); setBedStatusUpdate(bed.status); }}
                        className="glass-card"
                        style={{
                          background: bg,
                          borderColor: border,
                          color: color,
                          cursor: 'pointer',
                          textAlign: 'center',
                          padding: '1.25rem 0.75rem',
                          borderWidth: selectedBed?._id === bed._id ? '2px' : '1px'
                        }}
                      >
                        <p style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🛏️</p>
                        <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{bed.bedNumber}</p>
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>{bed.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Bed Control Settings</h2>
            {selectedBed ? (
              <form onSubmit={handleUpdateBedStatus}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <p>Bed Selected: <b>{selectedBed.bedNumber}</b></p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ward: {selectedBed.ward?.name}</p>
                  {selectedBed.currentPatient && (
                    <p style={{ marginTop: '0.5rem', color: 'var(--color-danger)' }}>Occupied by: {selectedBed.currentPatient.name}</p>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Set Maintenance Status</label>
                  <select
                    className="form-select"
                    value={bedStatusUpdate}
                    onChange={(e) => setBedStatusUpdate(e.target.value)}
                  >
                    <option value="Available">Available</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    {/* Occupied can only be set via intake/admit to ensure valid patient link */}
                    {selectedBed.status === 'Occupied' && <option value="Occupied">Occupied</option>}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Save Changes</button>
                  <button type="button" onClick={() => setSelectedBed(null)} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Select a bed card from the ward grid to edit details or log maintenance.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ward Admissions Tab */}
      {activeTab === 'admissions' && (
        <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Admit Patient</h2>
            <form onSubmit={handleAdmitPatient}>
              <div className="form-group">
                <label className="form-label">Patient (OPD Intake)</label>
                <select
                  className="form-select"
                  required
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
                  className="form-select"
                  required
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
                  className="form-select"
                  required
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
      )}

      {/* Log Patient Vitals Tab */}
      {activeTab === 'vitals' && (
        <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Select Inpatient</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {patients.filter(p => p.status === 'Admitted').map((p) => (
                <div
                  key={p._id}
                  onClick={() => setSelectedPatient(p)}
                  className="glass-card"
                  style={{
                    cursor: 'pointer',
                    borderColor: selectedPatient?._id === p._id ? 'var(--color-primary)' : undefined,
                    background: selectedPatient?._id === p._id ? 'rgba(255,255,255,0.06)' : undefined
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Bed: {p.assignedBed?.bedNumber} • Doctor: {p.attendingDoctor?.name}
                  </div>
                  {p.vitals && p.vitals.length > 0 && (
                    <VitalAlerts vitals={p.vitals[p.vitals.length - 1]} />
                  )}
                </div>
              ))}
              {patients.filter(p => p.status === 'Admitted').length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No inpatients in wards.</p>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Enter Clinical Record</h2>
            {selectedPatient ? (
              <form onSubmit={handleRecordVitals}>
                {/* Live Health Status Preview */}
                {(temp || bp || pulse || spO2) && (
                  <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Health Status Preview</p>
                    <VitalAlerts vitals={{ temperature: temp, bloodPressure: bp, pulseRate: pulse, spO2 }} />
                  </div>
                )}
                <div className="grid-2-col" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Temperature (°F)</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Pressure (BP)</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid-2-col" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Pulse Rate (bpm)</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Oxygen (SpO2 %)</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={spO2}
                      onChange={(e) => setSpO2(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Nursing Status Logs / Notes</label>
                  <textarea
                    className="form-textarea"
                    rows="4"
                    placeholder="Describe patient posture, fluid intake, medication compliance, etc."
                    value={nurseNote}
                    onChange={(e) => setNurseNote(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                    📈 Log Vitals & Notes
                  </button>
                  <button type="button" onClick={() => setSelectedPatient(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
                Select a patient from the inpatient list on the left to enter vital charts.
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
