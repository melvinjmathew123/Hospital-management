import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { API_URL, useAuth } from '../context/AuthContext';

export default function DoctorDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');

  // Core Data
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);

  // Forms
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [meds, setMeds] = useState([{ name: '', dosage: '', frequency: 'Once daily', duration: '7 days' }]);
  const [labs, setLabs] = useState([]); // List of tests ordered
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [referral, setReferral] = useState('');

  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchAll = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Get appointments for this doctor
      const resA = await fetch(`${API_URL}/appointments?doctor=${user._id}`, { headers });
      const dataA = await resA.json();
      if (dataA.success) setAppointments(dataA.appointments);

      // Get all patients
      const resP = await fetch(`${API_URL}/patients`, { headers });
      const dataP = await resP.json();
      if (dataP.success) setPatients(dataP.patients);

      // Get consultation history logs
      const resC = await fetch(`${API_URL}/clinical/consultations?doctor=${user._id}`, { headers });
      const dataC = await resC.json();
      if (dataC.success) setHistoryLogs(dataC.consultations);

    } catch (err) {
      showMsg('Failed to load doctor dashboard data', 'danger');
    }
  };

  useEffect(() => {
    fetchAll();
  }, [activeTab]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 5000);
  };

  const addMedLine = () => {
    setMeds([...meds, { name: '', dosage: '', frequency: 'Once daily', duration: '7 days' }]);
  };

  const removeMedLine = (idx) => {
    setMeds(meds.filter((_, i) => i !== idx));
  };

  const updateMedLine = (idx, field, val) => {
    const updated = meds.map((m, i) => {
      if (i === idx) return { ...m, [field]: val };
      return m;
    });
    setMeds(updated);
  };

  const toggleLabOrder = (testName) => {
    if (labs.includes(testName)) {
      setLabs(labs.filter(l => l !== testName));
    } else {
      setLabs([...labs, testName]);
    }
  };

  const handleStartConsultation = (appointment) => {
    setSelectedPatient(appointment.patient);
    setDiagnosis('');
    setTreatmentPlan('');
    setClinicalNotes('');
    setReferral('');
    setLabs([]);
    setMeds([{ name: '', dosage: '', frequency: 'Once daily', duration: '7 days' }]);
    setActiveTab('consultation');
    
    // Set appointment status to In Progress
    updateAppointmentStatus(appointment._id, 'In Progress');
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await fetch(`${API_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitConsultation = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      showMsg('Please select a patient first', 'danger');
      return;
    }

    const payload = {
      patient: selectedPatient._id,
      diagnosis,
      treatmentPlan,
      medications: meds.filter(m => m.name),
      labOrders: labs,
      referral,
      clinicalNotes
    };

    try {
      const res = await fetch(`${API_URL}/clinical/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        showMsg('Consultation recorded successfully. Prescriptions locked and Lab Orders dispatched.');
        
        // Find appointment and mark complete
        const appt = appointments.find(a => a.patient?._id === selectedPatient._id && a.status === 'In Progress');
        if (appt) {
          await updateAppointmentStatus(appt._id, 'Completed');
        }

        setSelectedPatient(null);
        setActiveTab('appointments');
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error saving consultation', 'danger');
    }
  };

  const sidebarItems = [
    { id: 'appointments', label: 'Appointments Queue', icon: '⏰' },
    { id: 'patients', label: 'Clinical Patient Records', icon: '📂' },
    { id: 'consultation', label: 'Write Consultation', icon: '🩺' },
    { id: 'history', label: 'Consultation History', icon: '📜' }
  ];

  const commonLabs = [
    'Complete Blood Count (CBC)',
    'Lipid Profile',
    'Thyroid Stimulating Hormone (TSH)',
    'Hemoglobin A1c (HbA1c)',
    'Liver Function Test (LFT)',
    'Kidney Function Test (KFT)',
    'Electrocardiogram (ECG)'
  ];

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

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Daily Queue</h2>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age/Gender</th>
                  <th>Reason</th>
                  <th>Slot</th>
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
                      <td><b>{appt.patient?.name || 'Walk-in Patient'}</b></td>
                      <td>{age} yrs / {appt.patient?.gender}</td>
                      <td>{appt.reason}</td>
                      <td><span className="badge badge-info">{appt.timeSlot}</span></td>
                      <td><span className={`badge ${badgeClass}`}>{appt.status}</span></td>
                      <td>
                        {appt.status !== 'Completed' && (
                          <button
                            onClick={() => handleStartConsultation(appt)}
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
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No appointments scheduled for today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Directory / Clinical File Tab */}
      {activeTab === 'patients' && (
        <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Patient List</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {patients.map((p) => (
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
                  <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    DOB: {new Date(p.dob).toLocaleDateString()} • Gender: {p.gender}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            {selectedPatient ? (
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Clinical Profile: {selectedPatient.name}</h2>
                <div className="grid-2-col" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Basic Info</h3>
                    <p>Phone: {selectedPatient.phone}</p>
                    <p>DOB: {new Date(selectedPatient.dob).toLocaleDateString()}</p>
                    <p>Gender: {selectedPatient.gender}</p>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Clinical Status</h3>
                    <span className={`badge ${selectedPatient.status === 'Admitted' ? 'badge-danger' : 'badge-success'}`}>{selectedPatient.status}</span>
                    {selectedPatient.status === 'Admitted' && (
                      <p style={{ marginTop: '0.5rem' }}>Room Bed: {selectedPatient.assignedBed?.bedNumber || 'Assigned'}</p>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current Vitals</h3>
                  {selectedPatient.vitals && selectedPatient.vitals.length > 0 ? (
                    <div className="grid-4-col" style={{ gap: '1rem' }}>
                      <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Temp</p>
                        <b>{selectedPatient.vitals[selectedPatient.vitals.length - 1].temperature}°F</b>
                      </div>
                      <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BP</p>
                        <b>{selectedPatient.vitals[selectedPatient.vitals.length - 1].bloodPressure}</b>
                      </div>
                      <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pulse</p>
                        <b>{selectedPatient.vitals[selectedPatient.vitals.length - 1].pulseRate} bpm</b>
                      </div>
                      <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SpO2</p>
                        <b>{selectedPatient.vitals[selectedPatient.vitals.length - 1].spO2}%</b>
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No vitals recorded yet.</p>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Medical Diagnosis History</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedPatient.medicalHistory?.map((h, i) => (
                      <div key={i} className="glass-card" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{h.condition}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Diagnosed: {new Date(h.diagnosedDate).toLocaleDateString()}</div>
                        <p style={{ marginTop: '0.25rem' }}>{h.notes}</p>
                      </div>
                    ))}
                    {(!selectedPatient.medicalHistory || selectedPatient.medicalHistory.length === 0) && (
                      <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No prior diagnosis logged.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
                Select a patient from the list to view complete medical files.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Write Consultation Tab */}
      {activeTab === 'consultation' && (
        <div className="fade-in">
          {selectedPatient ? (
            <form onSubmit={handleSubmitConsultation} className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Clinical Consultation Notes: {selectedPatient.name}</h2>
                <span className="badge badge-info">Attending Doctor: {user.name}</span>
              </div>

              <div className="grid-2-col" style={{ gap: '2rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Diagnosis / ICD Code</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Essential Hypertension (I10)"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Treatment Plan / Instructions</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Low sodium diet, light exercise"
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Consultation Clinical Notes</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Clinical assessment and symptoms description..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                />
              </div>

              {/* Lab Orders Checklist */}
              <div style={{ marginBottom: '2rem' }}>
                <label className="form-label">Order Laboratory Test Work</label>
                <div className="grid-3-col" style={{ gap: '0.75rem', marginTop: '0.5rem' }}>
                  {commonLabs.map(labName => (
                    <label
                      key={labName}
                      className="glass-card"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        borderColor: labs.includes(labName) ? 'var(--color-primary)' : undefined,
                        background: labs.includes(labName) ? 'rgba(6, 182, 212, 0.1)' : undefined
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={labs.includes(labName)}
                        onChange={() => toggleLabOrder(labName)}
                      />
                      <span style={{ fontSize: '0.85rem' }}>{labName}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prescription Medications */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Prescribe Medications</label>
                  <button type="button" onClick={addMedLine} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    ➕ Add Drug
                  </button>
                </div>
                {meds.map((m, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="Medicine Name (e.g. Paracetamol)"
                      value={m.name}
                      onChange={(e) => updateMedLine(idx, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Dosage (e.g. 500mg)"
                      value={m.dosage}
                      onChange={(e) => updateMedLine(idx, 'dosage', e.target.value)}
                    />
                    <select
                      className="form-select"
                      value={m.frequency}
                      onChange={(e) => updateMedLine(idx, 'frequency', e.target.value)}
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="As needed (PRN)">As needed (PRN)</option>
                    </select>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="7 days"
                      value={m.duration}
                      onChange={(e) => updateMedLine(idx, 'duration', e.target.value)}
                    />
                    {meds.length > 1 && (
                      <button type="button" onClick={() => removeMedLine(idx)} className="btn btn-danger" style={{ padding: '0.5rem', borderRadius: '50%', fontSize: '0.75rem', width: '32px', height: '32px' }}>
                        ✖
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Referral Specialist / Notes (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Refer to Dr. Jones (Allergist) for immunotherapy"
                  value={referral}
                  onChange={(e) => setReferral(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                  🔒 Complete Consultation & Send Orders
                </button>
                <button type="button" onClick={() => { setSelectedPatient(null); setActiveTab('appointments'); }} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', height: '200px' }}>
              Select a patient from the appointments queue or the clinical patient directory to write consultation details.
            </div>
          )}
        </div>
      )}

      {/* Consultation History Tab */}
      {activeTab === 'history' && (
        <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Past Consultations Logs</h2>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Diagnosis</th>
                  <th>Treatment Plan</th>
                  <th>Lab Orders</th>
                  <th>Prescriptions</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.date).toLocaleDateString()}</td>
                    <td><b>{log.patient?.name}</b></td>
                    <td>{log.diagnosis}</td>
                    <td>{log.treatmentPlan}</td>
                    <td>
                      {log.labOrders && log.labOrders.length > 0 ? (
                        log.labOrders.map((l, i) => <div key={i} style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>• {l}</div>)
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      {log.medications && log.medications.length > 0 ? (
                        log.medications.map((m, i) => <div key={i} style={{ fontSize: '0.75rem' }}>{m.name} ({m.dosage}) - {m.frequency}</div>)
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                  </tr>
                ))}
                {historyLogs.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No historical consultations logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
