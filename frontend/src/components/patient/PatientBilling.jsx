import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function PatientBilling({ bills, patientProfile, user, token, onPaymentSuccess }) {
  // Payment integration state variables
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Sandbox simulation states
  const [simulationOrder, setSimulationOrder] = useState(null);
  const [simulationStatus, setSimulationStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'failed'
  const [simulationError, setSimulationError] = useState('');

  // Receipt modal states
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedBillForReceipt, setSelectedBillForReceipt] = useState(null);

  const openPaymentModal = (bill) => {
    setSelectedBillForPayment(bill);
    setPayAmount(bill.balanceAmount.toString());
    setPaymentError('');
    setPaymentSuccess(false);
    setSimulationOrder(null);
    setSimulationStatus('idle');
    setSimulationError('');
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedBillForPayment(null);
    setPayAmount('');
    setPaymentError('');
    setPaymentSuccess(false);
    setSimulationOrder(null);
    setSimulationStatus('idle');
    setSimulationError('');
  };

  const openReceiptModal = (bill) => {
    setSelectedBillForReceipt(bill);
    setReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setReceiptModalOpen(false);
    setSelectedBillForReceipt(null);
  };

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    if (!selectedBillForPayment) return;
    
    const amountNum = Number(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setPaymentError('Please enter a valid payment amount.');
      return;
    }

    if (amountNum > selectedBillForPayment.balanceAmount) {
      setPaymentError(`Amount cannot exceed the outstanding balance of ₹${selectedBillForPayment.balanceAmount}.`);
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError('');

    try {
      const orderRes = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          billId: selectedBillForPayment._id,
          amount: amountNum
        })
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      if (orderData.is_simulated || !window.Razorpay) {
        setSimulationOrder(orderData);
        setSimulationStatus('idle');
        setSimulationError('');
        setIsProcessingPayment(false);
        return;
      }

      const options = {
        key: orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100,
        currency: orderData.currency || 'INR',
        name: import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital',
        description: `Payment for Invoice Ref: ${selectedBillForPayment._id.slice(-6)}`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            setIsProcessingPayment(true);
            const verifyRes = await fetch(`${API_URL}/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                billId: selectedBillForPayment._id,
                amount: amountNum
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setPaymentSuccess(true);
              setIsProcessingPayment(false);
              if (onPaymentSuccess) await onPaymentSuccess();
              setTimeout(() => {
                closePaymentModal();
              }, 2500);
            } else {
              setPaymentError(verifyData.message || 'Signature verification failed. Payment not recorded.');
              setIsProcessingPayment(false);
            }
          } catch (err) {
            setPaymentError('Connection error during payment verification.');
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: patientProfile?.name || user?.name || '',
          email: patientProfile?.email || user?.email || '',
          contact: patientProfile?.phone || ''
        },
        theme: {
          color: '#06b6d4'
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPaymentError(err.message || 'Error initiating payment transaction.');
      setIsProcessingPayment(false);
    }
  };

  const handleSimulateVerify = async (success) => {
    if (!simulationOrder) return;
    setSimulationStatus('processing');
    setSimulationError('');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (!success) {
      setSimulationStatus('failed');
      setSimulationError('Mock payment transaction declined by bank server authorization.');
      return;
    }

    try {
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 11)}`;
      const mockSignature = `mock_sig_${Math.random().toString(36).substring(2, 11)}`;

      const verifyRes = await fetch(`${API_URL}/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_payment_id: mockPaymentId,
          razorpay_order_id: simulationOrder.order_id,
          razorpay_signature: mockSignature,
          billId: selectedBillForPayment._id,
          amount: simulationOrder.amount
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setSimulationStatus('success');
        if (onPaymentSuccess) await onPaymentSuccess();
        setTimeout(() => {
          closePaymentModal();
        }, 2500);
      } else {
        setSimulationStatus('failed');
        setSimulationError(verifyData.message || 'Mock signature verification rejected.');
      }
    } catch (err) {
      setSimulationStatus('failed');
      setSimulationError('Connection error during mock validation request.');
    }
  };

  return (
    <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>My Ledger Accounts & Receipts</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {bills.map((bill) => {
          const badgeClass = bill.status === 'Paid' ? 'badge-success' : bill.status === 'Partially Paid' ? 'badge-warning' : 'badge-danger';
          return (
            <div key={bill._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                  <span>Invoice Ref: {bill._id.slice(-6)}</span>
                  <span className={`badge ${badgeClass}`}>{bill.status}</span>
                </div>

                <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {bill.services?.map((serv, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                      <span>{serv.name}</span>
                      <span>₹{serv.cost} x {serv.quantity || 1}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Invoice cost:</span>
                    <b>₹{bill.totalAmount}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                    <span>Amount Cleared:</span>
                    <b>-₹{bill.paidAmount}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)', fontWeight: 'bold' }}>
                    <span>Outstanding Balance:</span>
                    <b>₹{bill.balanceAmount}</b>
                  </div>
                </div>

                {bill.payments && bill.payments.length > 0 && (
                  <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--glass-border)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Payment History:</span>
                    {bill.payments.map((p, pIdx) => (
                      <div key={pIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.1rem 0' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(p.paymentDate).toLocaleDateString()} ({p.method})</span>
                        <span style={{ fontWeight: 500, color: 'var(--color-success)' }}>+₹{p.amount}</span>
                      </div>
                    ))}
                  </div>
                )}

                {bill.insuranceDetails?.provider && (
                  <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '0.75rem' }}>
                    🛡️ Insurance: {bill.insuranceDetails.provider} ({bill.insuranceDetails.policyNumber}) • Claim: <b>{bill.insuranceDetails.claimStatus}</b>
                  </div>
                )}
              </div>

              {bill.balanceAmount > 0 && (
                <button
                  onClick={() => openPaymentModal(bill)}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '1.5rem',
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                  }}
                >
                  💳 Pay Online Now
                </button>
              )}
              {bill.payments && bill.payments.length > 0 && (
                <button
                  onClick={() => openReceiptModal(bill)}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    marginTop: bill.balanceAmount > 0 ? '0.5rem' : '1.5rem',
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  📄 View & Print Receipt
                </button>
              )}
            </div>
          );
        })}
        {bills.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No active ledger statements found.</p>
        )}
      </div>

      {/* Premium Razorpay Payment Modal */}
      {paymentModalOpen && selectedBillForPayment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1.5rem'
        }}>
          <div className="glass-panel fade-in" style={{
            maxWidth: '480px', width: '100%', padding: '2.5rem',
            border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: '-50px', right: '-50px',
              width: '150px', height: '150px', borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.15)', filter: 'blur(40px)', zIndex: 0
            }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              {paymentSuccess ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)', border: '3px solid #10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', color: '#10b981', margin: '0 auto 1.5rem auto'
                  }}>
                    ✓
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: '#34d399' }}>Payment Verified!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Thank you. Your transaction has been recorded, and the ledger has been successfully updated.</p>
                </div>
              ) : simulationOrder ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>🛡️ Razorpay Sandbox</h3>
                    <button onClick={closePaymentModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', padding: '0.2rem' }}>&times;</button>
                  </div>

                  <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: 'var(--radius-md)', color: '#22d3ee', fontSize: '0.75rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>
                    ⚠️ TEST SANDBOX SIMULATION MODE
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Bill Reference:</span>
                      <b>#{selectedBillForPayment._id.slice(-6)}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Amount Billed:</span>
                      <span style={{ fontWeight: 'bold' }}>₹{simulationOrder.amount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                      <code style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>{simulationOrder.order_id}</code>
                    </div>
                  </div>

                  {simulationStatus === 'idle' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.5rem' }}>
                        Simulate the client authorization flow below to update the hospital's ledger:
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSimulateVerify(true)}
                        className="btn btn-primary"
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                          padding: '0.75rem', border: 'none', color: '#fff',
                          borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        ✔️ Authorize Payment (Simulate Success)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateVerify(false)}
                        className="btn btn-secondary"
                        style={{
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: '#fff', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                          padding: '0.75rem', border: 'none',
                          borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        ❌ Decline Payment (Simulate Failure)
                      </button>
                    </div>
                  )}

                  {simulationStatus === 'processing' && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                      <div className="spinner" style={{
                        width: '40px', height: '40px',
                        border: '3px solid rgba(255,255,255,0.1)',
                        borderTop: '3px solid var(--color-primary)',
                        borderRadius: '50%', animation: 'spin 1s linear infinite',
                        margin: '0 auto 1.5rem auto'
                      }}></div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Contacting mock bank server...</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>Verifying transaction cryptos...</p>
                    </div>
                  )}

                  {simulationStatus === 'success' && (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.15)', border: '3px solid #10b981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', color: '#10b981', margin: '0 auto 1rem auto'
                      }}>
                        ✓
                      </div>
                      <h4 style={{ color: '#34d399', fontWeight: 'bold', marginBottom: '0.5rem' }}>Transaction Successful!</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ledger is updated in real-time. Closing checkout...</p>
                    </div>
                  )}

                  {simulationStatus === 'failed' && (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'rgba(239, 68, 68, 0.15)', border: '3px solid #ef4444',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', color: '#ef4444', margin: '0 auto 1rem auto'
                      }}>
                        ✕
                      </div>
                      <h4 style={{ color: '#f87171', fontWeight: 'bold', marginBottom: '0.5rem' }}>Payment Failed</h4>
                      <p style={{ fontSize: '0.85rem', color: '#fca5a5', marginBottom: '1.5rem' }}>{simulationError}</p>
                      <button
                        type="button"
                        onClick={() => setSimulationStatus('idle')}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                      >
                        ◀ Try Again
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Secure Bill Payment</h3>
                    <button onClick={closePaymentModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', padding: '0.2rem' }} disabled={isProcessingPayment}>&times;</button>
                  </div>

                  <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Invoice Reference:</span>
                      <b>#{selectedBillForPayment._id.slice(-6)}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                      <span>₹{selectedBillForPayment.totalAmount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Amount Cleared:</span>
                      <span style={{ color: 'var(--color-success)' }}>-₹{selectedBillForPayment.paidAmount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                      <span>Outstanding Balance:</span>
                      <span style={{ color: 'var(--color-danger)' }}>₹{selectedBillForPayment.balanceAmount}</span>
                    </div>
                  </div>

                  {paymentError && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 500
                    }}>
                      ⚠️ {paymentError}
                    </div>
                  )}

                  <form onSubmit={handleRazorpayPayment}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Payment Type</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                        <button
                          type="button"
                          onClick={() => setPayAmount(selectedBillForPayment.balanceAmount.toString())}
                          style={{
                            background: Number(payAmount) === selectedBillForPayment.balanceAmount ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${Number(payAmount) === selectedBillForPayment.balanceAmount ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                            color: Number(payAmount) === selectedBillForPayment.balanceAmount ? '#fff' : 'var(--text-muted)',
                            padding: '0.6rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                          }}
                          disabled={isProcessingPayment}
                        >
                          Full Balance
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayAmount('')}
                          style={{
                            background: Number(payAmount) !== selectedBillForPayment.balanceAmount ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${Number(payAmount) !== selectedBillForPayment.balanceAmount ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                            color: Number(payAmount) !== selectedBillForPayment.balanceAmount ? '#fff' : 'var(--text-muted)',
                            padding: '0.6rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                          }}
                          disabled={isProcessingPayment}
                        >
                          Custom Amount
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Enter Amount (₹)</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>₹</span>
                        <input
                          type="number" className="form-input" required min="1" max={selectedBillForPayment.balanceAmount} step="any"
                          style={{ paddingLeft: '2rem', width: '100%' }} placeholder="0.00" value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          disabled={isProcessingPayment || Number(payAmount) === selectedBillForPayment.balanceAmount}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
                      <button type="button" onClick={closePaymentModal} className="btn btn-secondary" disabled={isProcessingPayment}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #06b6d4, #4f46e5)', boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)' }} disabled={isProcessingPayment}>
                        {isProcessingPayment ? '⏳ Connecting...' : `💳 Pay ₹${payAmount || '0'}`}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
                              background: p.method === 'Online' ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255,255,255,0.05)',
                              color: p.method === 'Online' ? '#22d3ee' : '#fff',
                              padding: '0.1rem 0.4rem', fontSize: '0.7rem', borderRadius: '3px'
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
                Thank you for choosing {import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital'}. This is a computer generated system receipt. For any questions regarding your medical claims, contact customer billing service.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1.5rem 2.5rem', background: '#090b14', borderTop: '1px solid var(--glass-border)' }} className="no-print">
              <button onClick={closeReceiptModal} type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', cursor: 'pointer' }}>Close</button>
              <button
                onClick={() => window.print()} type="button" className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
                  padding: '0.6rem 1.5rem', fontWeight: 600, cursor: 'pointer', border: 'none', color: '#fff', borderRadius: 'var(--radius-md)'
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
