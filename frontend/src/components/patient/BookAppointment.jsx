import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function BookAppointment({ doctors, patientProfile, token, onBookSuccess }) {
  const [bookForm, setBookForm] = useState({
    doctor: '',
    date: '',
    timeSlot: 'Morning',
    type: 'Online',
    reason: ''
  });
  const [bookMsg, setBookMsg] = useState({ text: '', type: '' });
  const [booking, setBooking] = useState(false);

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
        if (onBookSuccess) onBookSuccess();
      } else {
        showBookMsg(data.message || 'Failed to book appointment.', 'danger');
      }
    } catch (err) {
      showBookMsg('Server error. Please try again later.', 'danger');
    } finally {
      setBooking(false);
    }
  };

  return (
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
  );
}
