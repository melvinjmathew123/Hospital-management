import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function AdminBilling({ bills, token, onRefresh, showMsg }) {
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'Cash', remarks: '' });
  const [chargeForm, setChargeForm] = useState({ name: '', cost: '' });
  const [insuranceForm, setInsuranceForm] = useState({ provider: '', policyNumber: '', coverageAmount: '', claimStatus: 'Submitted' });

  // Receipt Modal States
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState(null);

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
        if (onRefresh) onRefresh();
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
      const updatedServices = [...selectedBill.services, { name: chargeForm.name, cost: Number(chargeForm.cost), quantity: 1 }];
      await fetch(`${API_URL}/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          patient: selectedBill.patient?._id,
          services: updatedServices
        })
      });
      showMsg('Charge lines added successfully. Created a new invoice.');
      setChargeForm({ name: '', cost: '' });
      setSelectedBill(null);
      if (onRefresh) onRefresh();
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
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error updating claim', 'danger');
    }
  };

  return (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Billing Statement: {selectedBill.patient?.name}</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {selectedBill.payments && selectedBill.payments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBillForReceipt(selectedBill);
                        setReceiptModalOpen(true);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      📄 Receipt
                    </button>
                  )}
                  <button onClick={() => setSelectedBill(null)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Close</button>
                </div>
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

              {/* Transaction History */}
              {selectedBill.payments && selectedBill.payments.length > 0 && (
                <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--glass-border)' }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Transaction Ledger History</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedBill.payments.map((payment, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', paddingBottom: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <div>
                          <span className="badge" style={{
                            background: payment.method === 'Online' ? '#f0fdfa' : '#f1f5f9',
                            color: payment.method === 'Online' ? '#0f766e' : '#334155',
                            border: payment.method === 'Online' ? '1px solid #99f6e4' : '1px solid #cbd5e1',
                            marginRight: '0.5rem', padding: '0.15rem 0.45rem', fontSize: '0.68rem', fontWeight: 600
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
                    type="text" className="form-input" placeholder="e.g. ICU Consultation fee"
                    value={chargeForm.name} required
                    onChange={(e) => setChargeForm({ ...chargeForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Cost (₹)</label>
                  <input
                    type="number" className="form-input" placeholder="100"
                    value={chargeForm.cost} required
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
                      type="number" className="form-input" placeholder="250"
                      value={paymentForm.amount} required
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Payment Method</label>
                    <select
                      className="form-select" value={paymentForm.method}
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
                      type="text" className="form-input" placeholder="e.g. Co-pay advance"
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>💰 Post</button>
                </div>
              </form>
            </div>

            {/* Insurance Claims Card */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Insurance Policy & Claims Submission</h3>
              <form onSubmit={handleUpdateInsurance} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Provider</label>
                  <input
                    type="text" className="form-input" placeholder="Blue Cross"
                    value={insuranceForm.provider}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, provider: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Policy #</label>
                  <input
                    type="text" className="form-input" placeholder="BCBS-19228"
                    value={insuranceForm.policyNumber}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, policyNumber: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Coverage (₹)</label>
                  <input
                    type="number" className="form-input" placeholder="300"
                    value={insuranceForm.coverageAmount}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, coverageAmount: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Claim Status</label>
                  <select
                    className="form-select" value={insuranceForm.claimStatus}
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

      {/* Printable Receipt Modal */}
      {receiptModalOpen && selectedBillForReceipt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1050, padding: '1.5rem', overflowY: 'auto'
        }} className="no-print-backdrop">
          <div style={{
            position: 'relative', maxWidth: '650px', width: '100%', maxHeight: '90vh',
            overflowY: 'auto', background: '#0c0f1d', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-lg)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
          }} className="no-print-modal-container">
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body * { visibility: hidden; }
                #printable-receipt-modal, #printable-receipt-modal * { visibility: visible; }
                #printable-receipt-modal {
                  position: absolute; left: 0; top: 0; width: 100%;
                  padding: 2.5cm !important; margin: 0 !important;
                  border: none !important; box-shadow: none !important;
                  background: #fff !important; color: #000 !important;
                  font-family: 'Inter', sans-serif !important;
                }
                #printable-receipt-modal table { width: 100% !important; border-collapse: collapse !important; }
                #printable-receipt-modal th, #printable-receipt-modal td { border-bottom: 1px solid #ddd !important; color: #000 !important; padding: 0.75rem !important; }
                .no-print { display: none !important; }
                .receipt-stamp { border-color: #059669 !important; color: #059669 !important; }
              }
            `}} />

            <div id="printable-receipt-modal" style={{ padding: '2.5rem', color: 'var(--text-main)', background: '#0e1227', position: 'relative' }}>
              {selectedBillForReceipt.balanceAmount === 0 && (
                <div className="receipt-stamp" style={{
                  position: 'absolute', right: '3rem', bottom: '8rem',
                  width: '130px', height: '130px', border: '4px dashed #10b981',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', fontWeight: 800, color: '#10b981',
                  transform: 'rotate(-15deg)', opacity: 0.85, zIndex: 10, userSelect: 'none'
                }}>
                  PAID IN FULL
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🏥 {import.meta.env.VITE_HOSPITAL_NAME || 'Voguemark Hospital'}
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    12, Health City Road, Sector 5, India<br />
                    Phone: +91 11-4040-5050 | info@voguemark.shop
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>PAYMENT RECEIPT</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <b>Receipt No:</b> REC-{selectedBillForReceipt._id.slice(-6)}<br />
                    <b>Date:</b> {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Billed To:</span>
                  <b style={{ fontSize: '1rem' }}>{selectedBillForReceipt.patient?.name}</b>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                    Gender: {selectedBillForReceipt.patient?.gender} • DOB: {new Date(selectedBillForReceipt.patient?.dob).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Patient Portal Contact:</span>
                  <span style={{ fontSize: '0.8rem', display: 'block' }}>{selectedBillForReceipt.patient?.phone}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{selectedBillForReceipt.patient?.email}</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.25rem' }}>Services Charge Statement</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                      <th style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Description</th>
                      <th style={{ padding: '0.5rem 0', textAlign: 'right', color: 'var(--text-muted)' }}>Cost</th>
                      <th style={{ padding: '0.5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Qty</th>
                      <th style={{ padding: '0.5rem 0', textAlign: 'right', color: 'var(--text-muted)' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBillForReceipt.services?.map((serv, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '0.6rem 0' }}>{serv.name}</td>
                        <td style={{ padding: '0.6rem 0', textAlign: 'right' }}>₹{serv.cost}</td>
                        <td style={{ padding: '0.6rem 0', textAlign: 'center' }}>{serv.quantity || 1}</td>
                        <td style={{ padding: '0.6rem 0', textAlign: 'right' }}>₹{serv.cost * (serv.quantity || 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedBillForReceipt.payments && selectedBillForReceipt.payments.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.25rem' }}>Payment Audit Ledger</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                        <th style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Payment Date</th>
                        <th style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Method</th>
                        <th style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Transaction Reference / Notes</th>
                        <th style={{ padding: '0.5rem 0', textAlign: 'right', color: 'var(--text-muted)' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBillForReceipt.payments.map((p, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '0.6rem 0' }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                          <td style={{ padding: '0.6rem 0' }}>
                            <span style={{
                              background: p.method === 'Online' ? '#f0fdfa' : '#f1f5f9',
                              color: p.method === 'Online' ? '#0f766e' : '#334155',
                              border: p.method === 'Online' ? '1px solid #99f6e4' : '1px solid #cbd5e1',
                              padding: '0.15rem 0.45rem', fontSize: '0.7rem', borderRadius: '4px', fontWeight: 600
                            }}>{p.method}</span>
                          </td>
                          <td style={{ padding: '0.6rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.remarks || 'No remarks recorded'}</td>
                          <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>+₹{p.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ borderTop: '2px solid var(--glass-border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '280px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Invoice Charges:</span>
                    <b>₹{selectedBillForReceipt.totalAmount}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: 600 }}>
                    <span>Total Payments Credited:</span>
                    <span>-₹{selectedBillForReceipt.paidAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)', fontWeight: 700, fontSize: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>
                    <span>Remaining Balance:</span>
                    <span>₹{selectedBillForReceipt.balanceAmount}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Thank you for choosing {import.meta.env.VITE_HOSPITAL_NAME || 'Voguemark Hospital'}. This is a computer generated system receipt. For any questions regarding your medical claims, contact customer billing service.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1.25rem 2.5rem', background: '#f8fafc', borderTop: '1px solid var(--border-main)' }} className="no-print">
              <button onClick={() => setReceiptModalOpen(false)} type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', cursor: 'pointer' }}>Close</button>
              <button
                onClick={() => window.print()} type="button" className="btn btn-primary"
                style={{ padding: '0.6rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}
              >
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
