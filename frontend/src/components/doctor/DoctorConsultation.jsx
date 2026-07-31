import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function DoctorConsultation({ selectedPatient, setSelectedPatient, user, token, appointments, updateAppointmentStatus, showMsg, setActiveTab }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [meds, setMeds] = useState([{ name: '', dosage: '', frequency: 'Once daily', duration: '7 days' }]);
  const [labs, setLabs] = useState([]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [referral, setReferral] = useState('');

  const commonLabs = [
    'Complete Blood Count (CBC)',
    'Lipid Profile',
    'Thyroid Stimulating Hormone (TSH)',
    'Hemoglobin A1c (HbA1c)',
    'Liver Function Test (LFT)',
    'Kidney Function Test (KFT)',
    'Electrocardiogram (ECG)'
  ];

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

  return (
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
                type="text" className="form-input" required
                placeholder="e.g. Essential Hypertension (I10)"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Treatment Plan / Instructions</label>
              <input
                type="text" className="form-input" required
                placeholder="e.g. Low sodium diet, light exercise"
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Consultation Clinical Notes</label>
            <textarea
              className="form-textarea" rows="3"
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
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', cursor: 'pointer',
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
                  type="text" className="form-input" required
                  placeholder="Medicine Name (e.g. Paracetamol)"
                  value={m.name}
                  onChange={(e) => updateMedLine(idx, 'name', e.target.value)}
                />
                <input
                  type="text" className="form-input"
                  placeholder="Dosage (e.g. 500mg)"
                  value={m.dosage}
                  onChange={(e) => updateMedLine(idx, 'dosage', e.target.value)}
                />
                <select
                  className="form-select" value={m.frequency}
                  onChange={(e) => updateMedLine(idx, 'frequency', e.target.value)}
                >
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="As needed (PRN)">As needed (PRN)</option>
                </select>
                <input
                  type="text" className="form-input"
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
              type="text" className="form-input"
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
  );
}
