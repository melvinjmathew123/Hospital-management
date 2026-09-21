import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function PatientBilling({ bills, patientProfile, user, token, onPaymentSuccess }) {
  // ── Payment modal state ──────────────────────────────────────────────────────
  const [paymentModalOpen, setPaymentModalOpen]           = useState(false);
  const [selectedBill, setSelectedBill]                   = useState(null);
  const [payAmount, setPayAmount]                         = useState('');
  const [isProcessing, setIsProcessing]                   = useState(false);
  const [paymentError, setPaymentError]                   = useState('');
  const [paymentSuccess, setPaymentSuccess]               = useState(false);

  // ── Simulation (demo) state ──────────────────────────────────────────────────
  const [simOrder, setSimOrder]                           = useState(null);
  const [simStatus, setSimStatus]                         = useState('idle'); // idle | processing | success | failed
  const [simError, setSimError]                           = useState('');

  // ── Receipt modal state ──────────────────────────────────────────────────────
  const [receiptModalOpen, setReceiptModalOpen]           = useState(false);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setPayAmount(bill.balanceAmount.toString());
    setPaymentError('');
    setPaymentSuccess(false);
    setSimOrder(null);
    setSimStatus('idle');
    setSimError('');
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedBill(null);
    setPayAmount('');
    setPaymentError('');
    setPaymentSuccess(false);
    setSimOrder(null);
    setSimStatus('idle');
    setSimError('');
  };

  const openReceiptModal  = (bill) => { setSelectedBillForReceipt(bill); setReceiptModalOpen(true); };
  const closeReceiptModal = ()     => { setReceiptModalOpen(false); setSelectedBillForReceipt(null); };

  // ── Step 1: Create order on backend, then launch the correct checkout ────────
  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;

    const amountNum = Number(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setPaymentError('Please enter a valid payment amount.');
      return;
    }
    if (amountNum > selectedBill.balanceAmount) {
      setPaymentError(`Amount cannot exceed the outstanding balance of ₹${selectedBill.balanceAmount}.`);
      return;
    }

    setIsProcessing(true);
    setPaymentError('');

    try {
      // ── 1a. Create order on the backend ──────────────────────────────────────
      const orderRes = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ billId: selectedBill._id, amount: amountNum }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order. Please try again.');
      }

      // ── 1b. Simulation mode — show demo sandbox UI ────────────────────────────
      if (orderData.is_simulated) {
        setSimOrder(orderData);
        setSimStatus('idle');
        setSimError('');
        setIsProcessing(false);
        return;
      }

      // ── 1c. Real Razorpay checkout ────────────────────────────────────────────
      if (!window.Razorpay) {
        throw new Error(
          'Razorpay SDK failed to load. Please check your internet connection and reload the page.'
        );
      }

      const options = {
        key:         orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        // Razorpay expects amount in PAISE (multiply rupees × 100)
        amount:      Math.round(orderData.amount * 100),
        currency:    orderData.currency || 'INR',
        name:        import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital',
        description: `Bill Payment — Invoice #${selectedBill._id.slice(-6)}`,
        image:       '/favicon.svg',
        order_id:    orderData.order_id,

        // ── Step 2: Handler called by Razorpay after the user pays ──────────────
        handler: async (response) => {
          try {
            setIsProcessing(true);
            const verifyRes = await fetch(`${API_URL}/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_signature:  response.razorpay_signature,
                billId:              selectedBill._id,
                amount:              amountNum,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setPaymentSuccess(true);
              setIsProcessing(false);
              if (onPaymentSuccess) await onPaymentSuccess();
              setTimeout(() => closePaymentModal(), 2800);
            } else {
              setPaymentError(
                verifyData.message || 'Signature verification failed. Payment was not recorded.'
              );
              setIsProcessing(false);
            }
          } catch (err) {
            setPaymentError('Connection error during payment verification. Contact support.');
            setIsProcessing(false);
          }
        },

        prefill: {
          name:    patientProfile?.name  || user?.name  || '',
          email:   patientProfile?.email || user?.email || '',
          contact: patientProfile?.phone || '',
        },

        notes: {
          billId:    selectedBill._id,
          hospital:  import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital',
        },

        theme: { color: '#06b6d4' },

        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setPaymentError('Payment was cancelled. You can try again.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setIsProcessing(false);
        setPaymentError(
          `Payment failed: ${response.error?.description || 'Unknown error'}. ` +
          `Error code: ${response.error?.code || 'N/A'}`
        );
      });
      rzp.open();
      setIsProcessing(false); // modal is open, user is interacting
    } catch (err) {
      setPaymentError(err.message || 'Error initiating payment. Please try again.');
      setIsProcessing(false);
    }
  };

  // ── Simulation: user clicks Authorize / Decline ──────────────────────────────
  const handleSimulateVerify = async (shouldSucceed) => {
    if (!simOrder) return;
    setSimStatus('processing');
    setSimError('');

    // Fake network delay for realism
    await new Promise((r) => setTimeout(r, 1500));

    if (!shouldSucceed) {
      setSimStatus('failed');
      setSimError('Mock payment declined by the simulated bank authorization server.');
      return;
    }

    try {
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 11)}`;

      const verifyRes = await fetch(`${API_URL}/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpay_payment_id: mockPaymentId,
          razorpay_order_id:   simOrder.order_id,
          razorpay_signature:  '',           // empty — controller skips sig check for mock orders
          billId:              selectedBill._id,
          amount:              simOrder.amount,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setSimStatus('success');
        if (onPaymentSuccess) await onPaymentSuccess();
        setTimeout(() => closePaymentModal(), 2800);
      } else {
        setSimStatus('failed');
        setSimError(verifyData.message || 'Mock payment verification rejected by server.');
      }
    } catch (err) {
      setSimStatus('failed');
      setSimError('Connection error during mock payment verification.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>My Bills &amp; Payments</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {bills.map((bill) => {
          const badgeClass =
            bill.status === 'Paid'
              ? 'badge-success'
              : bill.status === 'Partially Paid'
              ? 'badge-warning'
              : 'badge-danger';

          return (
            <div key={bill._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                  <span>Invoice Ref: #{bill._id.slice(-6)}</span>
                  <span className={`badge ${badgeClass}`}>{bill.status}</span>
                </div>

                {/* Services */}
                <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {bill.services?.map((serv, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                      <span>{serv.name}</span>
                      <span>₹{serv.cost} × {serv.quantity || 1}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Amount:</span>
                    <b>₹{bill.totalAmount}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                    <span>Amount Paid:</span>
                    <b>-₹{bill.paidAmount}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)', fontWeight: 'bold' }}>
                    <span>Outstanding Balance:</span>
                    <b>₹{bill.balanceAmount}</b>
                  </div>
                </div>

                {/* Payment History */}
                {bill.payments && bill.payments.length > 0 && (
                  <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--glass-border)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                      Payment History:
                    </span>
                    {bill.payments.map((p, pIdx) => (
                      <div key={pIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.1rem 0' }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {new Date(p.paymentDate).toLocaleDateString()} ({p.method})
                        </span>
                        <span style={{ fontWeight: 500, color: 'var(--color-success)' }}>+₹{p.amount}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Insurance */}
                {bill.insuranceDetails?.provider && (
                  <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '0.75rem' }}>
                    🛡️ Insurance: {bill.insuranceDetails.provider} ({bill.insuranceDetails.policyNumber}) • Claim:{' '}
                    <b>{bill.insuranceDetails.claimStatus}</b>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {bill.balanceAmount > 0 && (
                <button
                  onClick={() => openPaymentModal(bill)}
                  className="btn btn-primary"
                  style={{
                    width: '100%', marginTop: '1.5rem', padding: '0.65rem',
                    fontSize: '0.9rem', fontWeight: 600,
                  }}
                >
                  💳 Pay Now — ₹{bill.balanceAmount}
                </button>
              )}
              {bill.payments && bill.payments.length > 0 && (
                <button
                  onClick={() => openReceiptModal(bill)}
                  className="btn btn-secondary"
                  style={{
                    width: '100%', marginTop: bill.balanceAmount > 0 ? '0.5rem' : '1.5rem',
                    padding: '0.6rem', fontSize: '0.85rem',
                  }}
                >
                  📄 View &amp; Print Receipt
                </button>
              )}
            </div>
          );
        })}

        {bills.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No bills found.</p>
        )}
      </div>

      {/* ── Payment Modal ──────────────────────────────────────────────────────── */}
      {paymentModalOpen && selectedBill && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(3, 7, 18, 0.88)', backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1.5rem',
        }}>
          <div className="glass-panel fade-in" style={{
            maxWidth: '480px', width: '100%', padding: '2.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative glow */}
            <div style={{
              position: 'absolute', top: '-60px', right: '-60px',
              width: '180px', height: '180px', borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.12)', filter: 'blur(50px)', pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>

              {/* ── Success State ──────────────────────────────────────────────── */}
              {paymentSuccess ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)', border: '3px solid #10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', color: '#10b981', margin: '0 auto 1.5rem',
                  }}>✓</div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: '#34d399' }}>
                    Payment Successful!
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Your payment has been verified and your bill has been updated.
                  </p>
                </div>

              /* ── Simulation Mode State ──────────────────────────────────────── */
              ) : simOrder ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      🧪 Demo Sandbox Mode
                    </h3>
                    <button
                      onClick={closePaymentModal}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                    >×</button>
                  </div>

                  <div style={{
                    padding: '0.6rem 1rem', background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.25)', borderRadius: 'var(--radius-md)',
                    color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600,
                    marginBottom: '1.5rem', textAlign: 'center', letterSpacing: '0.04em',
                  }}>
                    ⚠️ SIMULATION MODE — No real money is charged
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    {[
                      ['Invoice Ref',  `#${selectedBill._id.slice(-6)}`],
                      ['Amount',       `₹${simOrder.amount}`],
                      ['Order ID',     simOrder.order_id],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
                        <code style={{ fontSize: '0.8rem', color: '#a5b4fc' }}>{value}</code>
                      </div>
                    ))}
                  </div>

                  {simStatus === 'idle' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Simulate the payment authorization flow:
                      </p>
                      <button
                        onClick={() => handleSimulateVerify(true)}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
                          padding: '0.75rem', border: 'none', color: '#fff',
                          borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
                        }}
                      >
                        ✔ Authorize Payment (Simulate Success)
                      </button>
                      <button
                        onClick={() => handleSimulateVerify(false)}
                        style={{
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
                          padding: '0.75rem', border: 'none', color: '#fff',
                          borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
                        }}
                      >
                        ✕ Decline Payment (Simulate Failure)
                      </button>
                    </div>
                  )}

                  {simStatus === 'processing' && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                      <div style={{
                        width: '44px', height: '44px',
                        border: '3px solid rgba(255,255,255,0.1)',
                        borderTop: '3px solid var(--color-primary)',
                        borderRadius: '50%', animation: 'spin 0.9s linear infinite',
                        margin: '0 auto 1.25rem',
                      }} />
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contacting mock bank server...</p>
                    </div>
                  )}

                  {simStatus === 'success' && (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'rgba(16,185,129,0.15)', border: '3px solid #10b981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', color: '#10b981', margin: '0 auto 1rem',
                      }}>✓</div>
                      <h4 style={{ color: '#34d399', fontWeight: 700, marginBottom: '0.5rem' }}>Transaction Successful!</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bill updated. Closing...</p>
                    </div>
                  )}

                  {simStatus === 'failed' && (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'rgba(239,68,68,0.15)', border: '3px solid #ef4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', color: '#ef4444', margin: '0 auto 1rem',
                      }}>✕</div>
                      <h4 style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.5rem' }}>Payment Failed</h4>
                      <p style={{ fontSize: '0.85rem', color: '#fca5a5', marginBottom: '1.25rem' }}>{simError}</p>
                      <button
                        onClick={() => setSimStatus('idle')}
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: '#fff', cursor: 'pointer' }}
                      >
                        ◀ Try Again
                      </button>
                    </div>
                  )}
                </div>

              /* ── Normal Payment Form ────────────────────────────────────────── */
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>💳 Secure Bill Payment</h3>
                    <button
                      onClick={closePaymentModal}
                      disabled={isProcessing}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                    >×</button>
                  </div>

                  {/* Bill summary */}
                  <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                    {[
                      ['Invoice Reference',  `#${selectedBill._id.slice(-6)}`],
                      ['Total Amount',       `₹${selectedBill.totalAmount}`],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                      <span style={{ color: 'var(--color-success)' }}>-₹{selectedBill.paidAmount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700, paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                      <span>Outstanding Balance:</span>
                      <span style={{ color: 'var(--color-danger)' }}>₹{selectedBill.balanceAmount}</span>
                    </div>
                  </div>

                  {/* Error */}
                  {paymentError && (
                    <div style={{
                      background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                      color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 500,
                    }}>
                      ⚠️ {paymentError}
                    </div>
                  )}

                  <form onSubmit={handlePayNow}>
                    {/* Payment type toggle */}
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Payment Amount</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                        {[
                          { label: 'Full Balance', value: selectedBill.balanceAmount.toString() },
                          { label: 'Custom Amount', value: '' },
                        ].map(({ label, value }) => {
                          const isActive =
                            label === 'Full Balance'
                              ? Number(payAmount) === selectedBill.balanceAmount
                              : Number(payAmount) !== selectedBill.balanceAmount;
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => setPayAmount(value)}
                              disabled={isProcessing}
                              style={{
                                background: isActive ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                                color: isActive ? '#fff' : 'var(--text-muted)',
                                padding: '0.6rem', borderRadius: 'var(--radius-md)',
                                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Amount input */}
                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Enter Amount (₹)</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>₹</span>
                        <input
                          type="number"
                          className="form-input"
                          required
                          min="1"
                          max={selectedBill.balanceAmount}
                          step="any"
                          style={{ paddingLeft: '2rem', width: '100%' }}
                          placeholder="0.00"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          disabled={isProcessing || Number(payAmount) === selectedBill.balanceAmount}
                        />
                      </div>
                    </div>

                    {/* Razorpay branding note */}
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1rem' }}>
                      🔒 Payments are processed securely via Razorpay. Card, UPI &amp; Netbanking accepted.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
                      <button
                        type="button"
                        onClick={closePaymentModal}
                        className="btn btn-secondary"
                        disabled={isProcessing}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isProcessing || !payAmount || Number(payAmount) <= 0}
                        style={{
                          background: 'linear-gradient(135deg, #06b6d4, #4f46e5)',
                          boxShadow: '0 4px 15px rgba(6,182,212,0.4)',
                        }}
                      >
                        {isProcessing ? '⏳ Connecting...' : `💳 Pay ₹${payAmount || '0'}`}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Receipt Modal ──────────────────────────────────────────────────────── */}
      {receiptModalOpen && selectedBillForReceipt && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(3,7,18,0.88)', backdropFilter: 'blur(14px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1050, padding: '1.5rem', overflowY: 'auto',
          }}
          className="no-print-backdrop"
        >
          <div
            style={{
              position: 'relative', maxWidth: '650px', width: '100%', maxHeight: '90vh',
              overflowY: 'auto', background: '#0c0f1d',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-lg)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}
            className="no-print-modal-container"
          >
            <style dangerouslySetInnerHTML={{ __html: `
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
                  fontSize: '1.1rem', fontWeight: 800, color: '#10b981',
                  transform: 'rotate(-15deg)', opacity: 0.85, zIndex: 10, userSelect: 'none',
                }}>
                  PAID IN FULL
                </div>
              )}

              {/* Receipt header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🏥 {import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital'}
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    12, Health City Road, Sector 5, India<br />
                    Phone: +91 11-4040-5050 | info@apollohms.com
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

              {/* Patient info */}
              <div className="glass-card" style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Billed To:</span>
                  <b style={{ fontSize: '1rem' }}>{selectedBillForReceipt.patient?.name}</b>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                    Gender: {selectedBillForReceipt.patient?.gender} • DOB: {new Date(selectedBillForReceipt.patient?.dob).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Contact:</span>
                  <span style={{ fontSize: '0.8rem', display: 'block' }}>{selectedBillForReceipt.patient?.phone}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{selectedBillForReceipt.patient?.email}</span>
                </div>
              </div>

              {/* Services table */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.25rem' }}>
                  Services Charged
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                      {['Description', 'Unit Cost', 'Qty', 'Subtotal'].map((h, i) => (
                        <th key={h} style={{ padding: '0.5rem 0', color: 'var(--text-muted)', textAlign: i > 0 ? 'right' : 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBillForReceipt.services?.map((serv, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '0.6rem 0' }}>{serv.name}</td>
                        <td style={{ padding: '0.6rem 0', textAlign: 'right' }}>₹{serv.cost}</td>
                        <td style={{ padding: '0.6rem 0', textAlign: 'right' }}>{serv.quantity || 1}</td>
                        <td style={{ padding: '0.6rem 0', textAlign: 'right' }}>₹{serv.cost * (serv.quantity || 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment audit */}
              {selectedBillForReceipt.payments && selectedBillForReceipt.payments.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.25rem' }}>
                    Payment History
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                        {['Date', 'Method', 'Reference / Notes', 'Amount'].map((h, i) => (
                          <th key={h} style={{ padding: '0.5rem 0', color: 'var(--text-muted)', textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                        ))}
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
                          <td style={{ padding: '0.6rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {p.remarks || 'N/A'}
                          </td>
                          <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>
                            +₹{p.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              <div style={{ borderTop: '2px solid var(--glass-border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '280px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Invoice:</span>
                    <b>₹{selectedBillForReceipt.totalAmount}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: 600 }}>
                    <span>Total Paid:</span>
                    <span>-₹{selectedBillForReceipt.paidAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)', fontWeight: 700, fontSize: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem' }}>
                    <span>Balance Due:</span>
                    <span>₹{selectedBillForReceipt.balanceAmount}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Thank you for choosing {import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital'}.
                This is a computer-generated receipt. For billing queries, contact the hospital billing desk.
              </div>
            </div>

            {/* Footer buttons */}
            <div
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1.25rem 2.5rem', background: '#090b14', borderTop: '1px solid var(--glass-border)' }}
              className="no-print"
            >
              <button onClick={closeReceiptModal} type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', cursor: 'pointer' }}>
                Close
              </button>
              <button
                onClick={() => window.print()}
                type="button"
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  boxShadow: '0 4px 15px rgba(6,182,212,0.4)',
                  padding: '0.6rem 1.5rem', fontWeight: 600, cursor: 'pointer',
                  border: 'none', color: '#fff', borderRadius: 'var(--radius-md)',
                }}
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
