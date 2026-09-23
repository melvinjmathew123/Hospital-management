import React, { useState } from 'react';

export default function AdminCertificates({ patients, showMsg }) {
  const [certPatient, setCertPatient] = useState('');
  const [certType, setCertType] = useState('Medical Fitness');
  const [certDetails, setCertDetails] = useState('');
  const [generatedCert, setGeneratedCert] = useState(null);

  const handleGenerateCertificate = (e) => {
    e.preventDefault();
    const patientObj = patients.find(p => p._id === certPatient);
    if (!patientObj) {
      showMsg('Please select a patient', 'danger');
      return;
    }
    setGeneratedCert({
      patient: patientObj.name,
      dob: new Date(patientObj.dob).toLocaleDateString(),
      type: certType,
      details: certDetails,
      date: new Date().toLocaleDateString()
    });
  };

  return (
    <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Generate Certificate</h2>
        <form onSubmit={handleGenerateCertificate}>
          <div className="form-group">
            <label className="form-label">Select Patient</label>
            <select
              className="form-select" required
              value={certPatient}
              onChange={(e) => setCertPatient(e.target.value)}
            >
              <option value="">-- Select Patient --</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Certificate Type</label>
            <select
              className="form-select"
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
            >
              <option value="Medical Fitness">Medical Fitness Certificate</option>
              <option value="Discharge Summary">Discharge Certificate</option>
              <option value="Birth Certificate">Birth Certificate</option>
              <option value="Death Certificate">Death Certificate</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Certificate Content / Clinical Details</label>
            <textarea
              className="form-textarea" rows="5" required
              placeholder="e.g. This is to certify that Mr. John Doe is physically fit to resume normal duties..."
              value={certDetails}
              onChange={(e) => setCertDetails(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            📜 Generate & Stamp Document
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Document Preview</h2>
        {generatedCert ? (
          <div className="glass-card" style={{
            background: '#fff', color: '#111827', padding: '2.5rem',
            borderRadius: '8px', border: '4px double #d1d5db',
            fontFamily: 'serif', position: 'relative'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{(import.meta.env.VITE_HOSPITAL_NAME || 'Voguemark Hospital').toUpperCase()} MEDICAL CENTER</h3>
              <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0', fontStyle: 'italic' }}>121 Health Care Lane, NY • Phone: 555-0100</p>
            </div>
            <h4 style={{ textAlign: 'center', fontSize: '1.25rem', textDecoration: 'underline', marginBottom: '1.5rem' }}>
              {generatedCert.type}
            </h4>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.8', marginBottom: '2.5rem', textAlign: 'justify' }}>
              Date: <b>{generatedCert.date}</b> <br /><br />
              This document serves as an official clinical declaration regarding patient <b>{generatedCert.patient}</b> (Date of Birth: {generatedCert.dob}).
              <br /><br />
              {generatedCert.details}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3rem' }}>
              <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                <div style={{ width: '80px', height: '80px', border: '3px solid rgba(220, 38, 38, 0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(220, 38, 38, 0.6)', fontWeight: 'bold', transform: 'rotate(-15deg)', marginBottom: '0.5rem' }}>
                  OFFICIAL STAMP
                </div>
                <span>{import.meta.env.VITE_HOSPITAL_NAME || 'Voguemark Hospital'} Authority</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', borderTop: '1px solid #111827', width: '150px', paddingTop: '0.25rem' }}>
                Authorized Signature
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
            Generate a certificate to view document draft and layout here.
          </div>
        )}
      </div>
    </div>
  );
}
