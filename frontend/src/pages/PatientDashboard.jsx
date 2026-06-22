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

  if (temp > 99.5) alerts.push({ label: 'Fever Detected', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: '🔥' });
  else if (temp < 96.0) alerts.push({ label: 'Hypothermia Risk', color: '#60a5fa', bg: 'rgba(59,130,246,0.15)', icon: '🧊' });

  if (!isNaN(systolic) && (systolic > 135 || (!isNaN(diastolic) && diastolic > 85)))
    alerts.push({ label: 'High Blood Pressure', color: '#f87171', bg: 'rgba(239,68,68,0.12)', icon: '❤️' });

  if (pulse > 100) alerts.push({ label: 'Tachycardia (Fast Pulse)', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', icon: '⚡' });
  else if (pulse < 60) alerts.push({ label: 'Bradycardia (Slow Pulse)', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', icon: '⚡' });

  if (spo2 < 95) alerts.push({ label: 'Low SpO2 (Hypoxia)', color: '#f87171', bg: 'rgba(239,68,68,0.15)', icon: '🫁' });

  return alerts;
}

// ─── Vitals Alert Badges Component ────────────────────────────────────────────
function VitalAlerts({ vitals }) {
  const alerts = analyzeVitals(vitals);
  if (alerts.length === 0) return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      background: 'rgba(16,185,129,0.15)', color: '#34d399',
      borderRadius: '9999px', padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 700
    }}>✅ Normal</span>
  );
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
      {alerts.map((a, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          background: a.bg, color: a.color, border: `1px solid ${a.color}40`,
          borderRadius: '9999px', padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 700
        }}>{a.icon} {a.label}</span>
      ))}
    </div>
  );
}

export default function PatientDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Patient profile reference
  const [patientProfile, setPatientProfile] = useState(null);

  // Lists
  const [appointments, setAppointments] = useState([]);
  const [labOrders, setLabOrders] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [bills, setBills] = useState([]);

  // Doctors list for appointment booking
  const [doctors, setDoctors] = useState([]);

  // Appointment booking form
  const [bookForm, setBookForm] = useState({
    doctor: '',
    date: '',
    timeSlot: 'Morning',
    type: 'Online',
    reason: ''
  });
  const [bookMsg, setBookMsg] = useState({ text: '', type: '' });
  const [booking, setBooking] = useState(false);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Payment integration state variables
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const openPaymentModal = (bill) => {
    setSelectedBillForPayment(bill);
    setPayAmount(bill.balanceAmount.toString());
    setPaymentError('');
    setPaymentSuccess(false);
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedBillForPayment(null);
    setPayAmount('');
    setPaymentError('');
    setPaymentSuccess(false);
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
      // 1. Create Order on Backend
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

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100, // in paise
        currency: orderData.currency || 'INR',
        name: import.meta.env.VITE_HOSPITAL_NAME || 'Apollo Hospital',
        description: `Payment for Invoice Ref: ${selectedBillForPayment._id.slice(-6)}`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            setIsProcessingPayment(true);
            // 3. Verify Payment on Backend
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
              // Refresh bills list
              await fetchPatientData();
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

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // 1. Fetch patient profile using logged in user's email
      const resP = await fetch(`${API_URL}/patients`, { headers });
      const dataP = await resP.json();
      
      if (dataP.success) {
        const foundProfile = dataP.patients.find(p => p.email === user.email);
        if (foundProfile) {
          setPatientProfile(foundProfile);
          const pId = foundProfile._id;

          // 2. Fetch appointments
          const resA = await fetch(`${API_URL}/appointments?patient=${pId}`, { headers });
          const dataA = await resA.json();
          if (dataA.success) setAppointments(dataA.appointments);

          // 3. Fetch Lab Orders
          const resL = await fetch(`${API_URL}/labs?patient=${pId}`, { headers });
          const dataL = await resL.json();
          if (dataL.success) setLabOrders(dataL.labOrders);

          // 4. Fetch Consultations
          const resC = await fetch(`${API_URL}/clinical/consultations?patient=${pId}`, { headers });
          const dataC = await resC.json();
          if (dataC.success) setConsultations(dataC.consultations);

          // 5. Fetch Billing
          const resB = await fetch(`${API_URL}/billing?patient=${pId}`, { headers });
          const dataB = await resB.json();
          if (dataB.success) setBills(dataB.bills);
        } else {
          setMsg({ text: 'Patient profile matching your account email was not found.', type: 'danger' });
        }
      }

      // 6. Fetch Doctors list
      const resD = await fetch(`${API_URL}/auth/users?role=Doctor`, { headers });
      const dataD = await resD.json();
      if (dataD.success) setDoctors(dataD.users);

    } catch (err) {
      setMsg({ text: 'Failed to retrieve patient portal records', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [activeTab]);

  const showBookMsg = (text, type = 'success') => {
    setBookMsg({ text, type });
    setTimeout(() => setBookMsg({ text: '', type: '' }), 5000);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!patientProfile) return;
    if (!bookForm.doctor || !bookForm.date || !bookForm.reason) {
      showBookMsg('Please fill in all required fields.', 'danger');
      return;
    }
    setBooking(true);
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          patient: patientProfile._id,
          doctor: bookForm.doctor,
          date: bookForm.date,
          timeSlot: bookForm.timeSlot,
          type: bookForm.type,
          reason: bookForm.reason
        })
      });
      const data = await res.json();
      if (data.success) {
        showBookMsg('🎉 Appointment booked successfully! Check your appointments tab.');
        setBookForm({ doctor: '', date: '', timeSlot: 'Morning', type: 'Online', reason: '' });
        fetchPatientData();
      } else {
        showBookMsg(data.message || 'Failed to book appointment.', 'danger');
      }
    } catch (err) {
      showBookMsg('Server error. Please try again later.', 'danger');
    } finally {
      setBooking(false);
    }
  };

  const sidebarItems = [
    { id: 'profile', label: 'My Clinical File', icon: '📂' },
    { id: 'appointments', label: 'My Appointments', icon: '⏰' },
    { id: 'book', label: 'Book Appointment', icon: '📅' },
    { id: 'labs', label: 'Lab Reports', icon: '🧪' },
    { id: 'prescriptions', label: 'My Prescriptions', icon: '📋' },
    { id: 'billing', label: 'Bills & Payments', icon: '💳' }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <h3>Loading your clinical portal file...</h3>
      </div>
    );
  }

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

      {/* Patient Profile Tab */}
      {activeTab === 'profile' && patientProfile && (
        <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
          {/* Card Info */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1rem auto' }}>
                👩
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{patientProfile.name}</h2>
              <span className="badge badge-success">{patientProfile.status}</span>
            </div>

            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p>📞 Phone: <b>{patientProfile.phone}</b></p>
              <p>✉️ Email: <b>{patientProfile.email}</b></p>
              <p>🎂 DOB: <b>{new Date(patientProfile.dob).toLocaleDateString()}</b></p>
              <p>⚧️ Gender: <b>{patientProfile.gender}</b></p>
              <p>📍 Address: <b>{patientProfile.address}</b></p>
              {patientProfile.status === 'Admitted' && (
                <div className="glass-card" style={{ marginTop: '1rem', borderLeft: '3px solid var(--color-danger)' }}>
                  <p>🛏️ Assigned Bed: <b>{patientProfile.assignedBed?.bedNumber}</b></p>
                  <p>🩺 Attending: <b>{patientProfile.attendingDoctor?.name}</b></p>
                </div>
              )}
            </div>
          </div>

          {/* Vitals History & Diagnoses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Recent Vital Logs</h3>
              <div className="table-container">
                <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Temp (°F)</th>
                      <th>BP</th>
                      <th>Pulse</th>
                      <th>SpO2</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientProfile.vitals?.map((v, idx) => (
                      <tr key={idx}>
                        <td>{new Date(v.timestamp).toLocaleDateString()}</td>
                        <td>{v.temperature}°F</td>
                        <td>{v.bloodPressure}</td>
                        <td>{v.pulseRate} bpm</td>
                        <td>{v.spO2}%</td>
                        <td><VitalAlerts vitals={v} /></td>
                      </tr>
                    ))}
                    {(!patientProfile.vitals || patientProfile.vitals.length === 0) && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No vitals charted yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Medical Diagnosis Records</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {patientProfile.medicalHistory?.map((h, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <b>{h.condition}</b>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(h.diagnosedDate).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{h.notes}</p>
                  </div>
                ))}
                {(!patientProfile.medicalHistory || patientProfile.medicalHistory.length === 0) && (
                  <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No previous diagnoses logged.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>My Appointment Schedule</h2>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Attending Doctor</th>
                  <th>Location / Department</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => {
                  const badgeClass = appt.status === 'Completed' ? 'badge-success' : appt.status === 'Cancelled' ? 'badge-danger' : 'badge-info';
                  return (
                    <tr key={appt._id}>
                      <td><b>{new Date(appt.date).toLocaleDateString()}</b></td>
                      <td>{appt.timeSlot}</td>
                      <td>{appt.doctor?.name}</td>
                      <td>{appt.doctor?.department || 'Outpatient Clinic'}</td>
                      <td><span className="badge badge-info">{appt.type}</span></td>
                      <td><span className={`badge ${badgeClass}`}>{appt.status}</span></td>
                    </tr>
                  );
                })}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No appointments scheduled.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Appointment Tab */}
      {activeTab === 'book' && (
        <div className="fade-in grid-2-col" style={{ gap: '2rem' }}>
          {/* Booking Form */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>📅 Book an Appointment</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
              Schedule a consultation with any available Apollo doctor online or walk-in.
            </p>

            {bookMsg.text && (
              <div style={{
                background: bookMsg.type === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                border: bookMsg.type === 'danger' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)',
                color: bookMsg.type === 'danger' ? '#fca5a5' : '#34d399',
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem', fontWeight: 500, fontSize: '0.9rem'
              }}>{bookMsg.text}</div>
            )}

            <form onSubmit={handleBookAppointment}>
              <div className="form-group">
                <label className="form-label">Select Doctor *</label>
                <select
                  className="form-select"
                  required
                  value={bookForm.doctor}
                  onChange={(e) => setBookForm({ ...bookForm, doctor: e.target.value })}
                >
                  <option value="">-- Choose a Doctor --</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.name} {d.department ? `(${d.department})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Date *</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookForm.date}
                  onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                />
              </div>

              <div className="grid-2-col" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Time Slot *</label>
                  <select
                    className="form-select"
                    value={bookForm.timeSlot}
                    onChange={(e) => setBookForm({ ...bookForm, timeSlot: e.target.value })}
                  >
                    <option value="Morning">🌅 Morning</option>
                    <option value="Afternoon">☀️ Afternoon</option>
                    <option value="Evening">🌆 Evening</option>
                    <option value="Night">🌙 Night</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Appointment Type *</label>
                  <select
                    className="form-select"
                    value={bookForm.type}
                    onChange={(e) => setBookForm({ ...bookForm, type: e.target.value })}
                  >
                    <option value="Online">💻 Online</option>
                    <option value="Walk-in">🏥 Walk-in</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label">Reason for Visit *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  required
                  placeholder="e.g. Persistent cough and fever for 3 days..."
                  value={bookForm.reason}
                  onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.875rem' }}
                disabled={booking}
              >
                {booking ? '⏳ Booking...' : '📅 Confirm Appointment'}
              </button>
            </form>
          </div>

          {/* How it Works Info Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>How to Book</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { step: '01', title: 'Choose Your Doctor', desc: 'Select from our team of certified Apollo specialists.' },
                  { step: '02', title: 'Pick a Date & Time', desc: 'Select a preferred date and an available time slot.' },
                  { step: '03', title: 'Select Visit Type', desc: 'Choose between an online video consult or an in-person walk-in.' },
                  { step: '04', title: 'Describe Symptoms', desc: 'Briefly describe your symptoms to help your doctor prepare.' }
                ].map((item) => (
                  <div key={item.step} className="glass-card" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
                    <div style={{
                      minWidth: '36px', height: '36px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: '0.75rem', color: '#fff'
                    }}>{item.step}</div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '3px solid var(--color-primary)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                <b style={{ color: 'var(--color-primary)' }}>ℹ️ Note:</b> Appointments are subject to doctor availability.
                If your requested slot is already taken, you'll receive a notification to pick another.
                Online consultations are conducted via the Apollo patient portal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lab Reports Tab */}
      {activeTab === 'labs' && (
        <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Laboratory Test Results</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {labOrders.filter(l => l.status === 'Completed').map((order) => (
              <div key={order._id} className="glass-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{order.testName}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(order.dateCompleted).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {order.resultDetails?.map((res, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <span>{res.parameter}</span>
                      <span><b>{res.value}</b> {res.unit} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({res.normalRange})</span></span>
                    </div>
                  ))}
                </div>
                {order.remarks && (
                  <p style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', fontStyle: 'italic' }}>
                    Remarks: {order.remarks}
                  </p>
                )}
              </div>
            ))}
            {labOrders.filter(l => l.status === 'Completed').length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No completed laboratory results available.</p>
            )}
          </div>
        </div>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>My Prescribed Medications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {consultations.map((consult) => (
              <div key={consult._id} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                  <span>Diagnosis: <b>{consult.diagnosis}</b></span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: {new Date(consult.date).toLocaleDateString()} by {consult.doctor?.name}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {consult.medications?.map((med, i) => (
                    <div key={i} className="glass-card" style={{ background: 'rgba(255,255,255,0.01)', padding: '0.75rem' }}>
                      <h4 style={{ color: 'var(--color-primary)', fontSize: '0.95rem' }}>💊 {med.name}</h4>
                      <p style={{ fontSize: '0.85rem' }}>Dosage: {med.dosage}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Freq: {med.frequency}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Duration: {med.duration}</p>
                    </div>
                  ))}
                </div>

                {consult.treatmentPlan && (
                  <p style={{ fontSize: '0.85rem', marginTop: '1rem', color: 'var(--text-muted)' }}>
                    <b>Instructions:</b> {consult.treatmentPlan}
                  </p>
                )}
              </div>
            ))}
            {consultations.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No historical prescription reports available.</p>
            )}
          </div>
        </div>
      )}

      {/* Billing Ledger Tab */}
      {activeTab === 'billing' && (
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
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(3, 7, 18, 0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1.5rem'
            }}>
              <div className="glass-panel fade-in" style={{
                maxWidth: '480px',
                width: '100%',
                padding: '2.5rem',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Background Accent Gradients */}
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.15)',
                  filter: 'blur(40px)',
                  zIndex: 0
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {paymentSuccess ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                      <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '3px solid #10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        color: '#10b981',
                        margin: '0 auto 1.5rem auto',
                        animation: 'spinSuccess 0.5s ease-out'
                      }}>
                        ✓
                      </div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: '#34d399' }}>Payment Verified!</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Thank you. Your transaction has been recorded, and the ledger has been successfully updated.</p>
                      
                      <style>{`
                        @keyframes spinSuccess {
                          0% { transform: scale(0.6) rotate(-45deg); opacity: 0; }
                          100% { transform: scale(1) rotate(0); opacity: 1; }
                        }
                      `}</style>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Secure Bill Payment</h3>
                        <button
                          onClick={closePaymentModal}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0.2rem'
                          }}
                          disabled={isProcessingPayment}
                        >
                          &times;
                        </button>
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
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#fca5a5',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          marginBottom: '1.25rem',
                          fontSize: '0.85rem',
                          fontWeight: 500
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
                                padding: '0.6rem',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'var(--transition-smooth)'
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
                                padding: '0.6rem',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'var(--transition-smooth)'
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
                            <span style={{
                              position: 'absolute',
                              left: '1rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: 'var(--text-muted)',
                              fontWeight: 'bold'
                            }}>₹</span>
                            <input
                              type="number"
                              className="form-input"
                              required
                              min="1"
                              max={selectedBillForPayment.balanceAmount}
                              step="any"
                              style={{ paddingLeft: '2rem', width: '100%' }}
                              placeholder="0.00"
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                              disabled={isProcessingPayment || Number(payAmount) === selectedBillForPayment.balanceAmount}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
                          <button
                            type="button"
                            onClick={closePaymentModal}
                            className="btn btn-secondary"
                            disabled={isProcessingPayment}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                              background: 'linear-gradient(135deg, #06b6d4, #4f46e5)',
                              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
                            }}
                            disabled={isProcessingPayment}
                          >
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
        </div>
      )}
    </DashboardLayout>
  );
}
