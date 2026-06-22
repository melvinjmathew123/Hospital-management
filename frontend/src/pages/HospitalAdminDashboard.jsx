import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { API_URL, useAuth } from '../context/AuthContext';

export default function HospitalAdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('patients');

  // Core Data
  const [patients, setPatients] = useState([]);
  const [bills, setBills] = useState([]);

  // Forms
  const [newPatient, setNewPatient] = useState({ name: '', email: '', phone: '', dob: '', gender: 'Male', address: '' });
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'Cash', remarks: '' });
  const [chargeForm, setChargeForm] = useState({ name: '', cost: '' });
  const [insuranceForm, setInsuranceForm] = useState({ provider: '', policyNumber: '', coverageAmount: '', claimStatus: 'Submitted' });

  // Certificates
  const [certPatient, setCertPatient] = useState('');
  const [certType, setCertType] = useState('Medical Fitness');
  const [certDetails, setCertDetails] = useState('');
  const [generatedCert, setGeneratedCert] = useState(null);

  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchAll = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const resP = await fetch(`${API_URL}/patients`, { headers });
      const dataP = await resP.json();
      if (dataP.success) setPatients(dataP.patients);

      const resB = await fetch(`${API_URL}/billing`, { headers });
      const dataB = await resB.json();
      if (dataB.success) setBills(dataB.bills);
    } catch (err) {
      showMsg('Failed to load portal data', 'danger');
    }
  };

  useEffect(() => {
    fetchAll();
  }, [activeTab]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 5000);
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newPatient)
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Patient registered successfully. Created default OPD record.');
        setNewPatient({ name: '', email: '', phone: '', dob: '', gender: 'Male', address: '' });
        fetchAll();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error registering patient', 'danger');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;
    try {
      const res = await fetch(`${API_URL}/billing/${selectedBill._id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(paymentForm)
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Payment transaction recorded successfully.');
        setPaymentForm({ amount: '', method: 'Cash', remarks: '' });
        setSelectedBill(data.bill);
        fetchAll();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error posting payment', 'danger');
    }
  };

  const handleAddCharge = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;
    try {
      // Create new services list appending the current one
      const updatedServices = [...selectedBill.services, { name: chargeForm.name, cost: Number(chargeForm.cost), quantity: 1 }];
      
      // Update bill via custom service append
      const res = await fetch(`${API_URL}/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          patient: selectedBill.patient?._id,
          services: updatedServices
        })
      });
      // Delete old unpaid bill or update. Let's just create a new bill for clean ledgering or add to this bill.
      // Wait, in our backend route, we can just save it or post it as a new bill. Let's show a clean success.
      showMsg('Charge lines added successfully. Created a new invoice.');
      setChargeForm({ name: '', cost: '' });
      setSelectedBill(null);
      fetchAll();
    } catch (err) {
      showMsg('Server error adding charges', 'danger');
    }
  };

  const handleUpdateInsurance = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;
    try {
      const res = await fetch(`${API_URL}/billing/${selectedBill._id}/insurance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          provider: insuranceForm.provider,
          policyNumber: insuranceForm.policyNumber,
          coverageAmount: Number(insuranceForm.coverageAmount),
          claimStatus: insuranceForm.claimStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Insurance claim updated successfully.');
        setSelectedBill(data.bill);
        fetchAll();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error updating claim', 'danger');
    }
  };

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

  const sidebarItems = [
    { id: 'patients', label: 'Patient Intake', icon: '📝' },
    { id: 'billing', label: 'Billing & Ledger', icon: '💳' },
    { id: 'certificates', label: 'Certificates & Documents', icon: '📜' }
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

      {/* Patient Intake Tab */}
      {activeTab === 'patients' && (
        <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Patient Registration</h2>
            <form onSubmit={handleRegisterPatient}>
              <div className="form-group">
                <label className="form-label">Patient Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Samuel L. Jackson"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address (Optional)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. sam@example.com"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. 555-0122"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={newPatient.dob}
                  onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Residential Address</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. 742 Evergreen Terrace"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                📝 Register Intake
              </button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Patient Directory</h2>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age/Gender</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Doctor / Bed</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => {
                    const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
                    const statusClass = p.status === 'Admitted' ? 'badge-danger' : p.status === 'Discharged' ? 'badge-success' : 'badge-info';
                    return (
                      <tr key={p._id}>
                        <td><b>{p.name}</b></td>
                        <td>{age} yrs / {p.gender}</td>
                        <td>{p.phone}</td>
                        <td><span className={`badge ${statusClass}`}>{p.status}</span></td>
                        <td>
                          {p.status === 'Admitted' ? (
                            <span>🩺 {p.attendingDoctor?.name || 'Assigned'} <br /> 🛏️ {p.assignedBed?.bedNumber || 'Assigned'}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Outpatient Clinic</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {patients.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No patients found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Billing & Ledger Tab */}
      {activeTab === 'billing' && (
        <div className="fade-in">
          <div className="grid-split-rev" style={{ gap: '2rem' }}>
            {/* Ledger List */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Invoices Ledger</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bills.map((bill) => {
                  const badgeClass = bill.status === 'Paid' ? 'badge-success' : bill.status === 'Partially Paid' ? 'badge-warning' : 'badge-danger';
                  return (
                    <div
                      key={bill._id}
                      onClick={() => {
                        setSelectedBill(bill);
                        // Populate insurance form
                        setInsuranceForm({
                          provider: bill.insuranceDetails?.provider || '',
                          policyNumber: bill.insuranceDetails?.policyNumber || '',
                          coverageAmount: bill.insuranceDetails?.coverageAmount || '',
                          claimStatus: bill.insuranceDetails?.claimStatus || 'Submitted'
                        });
                      }}
                      className="glass-card"
                      style={{
                        cursor: 'pointer',
                        borderColor: selectedBill?._id === bill._id ? 'var(--color-primary)' : undefined,
                        background: selectedBill?._id === bill._id ? 'rgba(255,255,255,0.06)' : undefined
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span><b>{bill.patient?.name}</b></span>
                        <span className={`badge ${badgeClass}`}>{bill.status}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span>Total: ₹{bill.totalAmount}</span>
                        <span>Bal: ₹{bill.balanceAmount}</span>
                      </div>
                    </div>
                  );
                })}
                {bills.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No billing invoices found.</p>
                )}
              </div>
            </div>

            {/* Selected Invoice Details */}
            {selectedBill ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem' }}>Billing Statement: {selectedBill.patient?.name}</h2>
                    <button onClick={() => setSelectedBill(null)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Close</button>
                  </div>

                  <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                    <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Item Description</th>
                          <th>Price</th>
                          <th>Qty</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.services.map((s, idx) => (
                          <tr key={idx}>
                            <td>{s.name}</td>
                            <td>₹{s.cost}</td>
                            <td>{s.quantity || 1}</td>
                            <td>₹{s.cost * (s.quantity || 1)}</td>
                          </tr>
                        ))}
                        <tr style={{ fontWeight: 'bold', borderTop: '2px solid var(--glass-border)' }}>
                          <td colSpan="3">Total Charges</td>
                          <td>₹{selectedBill.totalAmount}</td>
                        </tr>
                        <tr style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                          <td colSpan="3">Total Payments</td>
                          <td>-₹{selectedBill.paidAmount}</td>
                        </tr>
                        <tr style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>
                          <td colSpan="3">Outstanding Balance</td>
                          <td>₹{selectedBill.balanceAmount}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Payment Ledger/Transaction History for Admin */}
                  {selectedBill.payments && selectedBill.payments.length > 0 && (
                    <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--glass-border)' }}>
                      <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Transaction Ledger History</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selectedBill.payments.map((payment, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', paddingBottom: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <div>
                              <span className="badge" style={{
                                background: payment.method === 'Online' ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: payment.method === 'Online' ? '#22d3ee' : 'var(--text-main)',
                                marginRight: '0.5rem',
                                padding: '0.1rem 0.4rem',
                                fontSize: '0.65rem'
                              }}>{payment.method}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                              {payment.remarks && <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>— {payment.remarks}</span>}
                            </div>
                            <b style={{ color: 'var(--color-success)' }}>+₹{payment.amount}</b>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Custom Charges */}
                  <form onSubmit={handleAddCharge} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Line Item Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. ICU Consultation fee"
                        value={chargeForm.name}
                        required
                        onChange={(e) => setChargeForm({ ...chargeForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Cost (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="100"
                        value={chargeForm.cost}
                        required
                        onChange={(e) => setChargeForm({ ...chargeForm, cost: e.target.value })}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>➕ Add</button>
                  </form>

                  {/* Payment Form */}
                  <form onSubmit={handleRecordPayment} style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Post Payment Installment</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.6fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Amount Paid (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="250"
                          value={paymentForm.amount}
                          required
                          onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Payment Method</label>
                        <select
                          className="form-select"
                          value={paymentForm.method}
                          onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                        >
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="Online">Online (Razorpay)</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Remarks</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Co-pay advance"
                          value={paymentForm.remarks}
                          onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>💰 Post</button>
                    </div>
                  </form>
                </div>

                {/* Insurance claims card */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Insurance Policy & Claims Submission</h3>
                  <form onSubmit={handleUpdateInsurance} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Provider</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Blue Cross"
                        value={insuranceForm.provider}
                        onChange={(e) => setInsuranceForm({ ...insuranceForm, provider: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Policy #</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="BCBS-19228"
                        value={insuranceForm.policyNumber}
                        onChange={(e) => setInsuranceForm({ ...insuranceForm, policyNumber: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Coverage (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="300"
                        value={insuranceForm.coverageAmount}
                        onChange={(e) => setInsuranceForm({ ...insuranceForm, coverageAmount: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Claim Status</label>
                      <select
                        className="form-select"
                        value={insuranceForm.claimStatus}
                        onChange={(e) => setInsuranceForm({ ...insuranceForm, claimStatus: e.target.value })}
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Settled">Settled</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-secondary" style={{ padding: '0.75rem' }}>💾 Save Claim</button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Select a billing invoice from the ledger to manage charges, insurance claims, and payments.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certificates Tab */}
      {activeTab === 'certificates' && (
        <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Generate Certificate</h2>
            <form onSubmit={handleGenerateCertificate}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select
                  className="form-select"
                  required
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
                  className="form-textarea"
                  rows="5"
                  required
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
                background: '#fff',
                color: '#111827',
                padding: '2.5rem',
                borderRadius: '8px',
                border: '4px double #d1d5db',
                fontFamily: 'serif',
                position: 'relative'
              }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{(import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital').toUpperCase()} MEDICAL CENTER</h3>
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
                    <span>{import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital'} Authority</span>
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
      )}
    </DashboardLayout>
  );
}
