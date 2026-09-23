import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../context/AuthContext';

const SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night'];
const SLOT_ICONS = { Morning: '🌅', Afternoon: '☀️', Evening: '🌆', Night: '🌙' };
const MAX_PER_SLOT = 10;

export default function BookAppointment({ doctors, patientProfile, token, onBookSuccess }) {
  const [bookForm, setBookForm] = useState({
    doctor: '',
    date: '',
    timeSlot: 'Morning',
    type: 'Online',
    reason: ''
  });
  const [bookMsg, setBookMsg]     = useState({ text: '', type: '' });
  const [booking, setBooking]     = useState(false);
  const [availability, setAvailability] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const showBookMsg = (text, type = 'success') => {
    setBookMsg({ text, type });
    setTimeout(() => setBookMsg({ text: '', type: '' }), 5000);
  };

  // Fetch slot availability whenever doctor or date changes
  const fetchAvailability = useCallback(async (doctorId, date) => {
    if (!doctorId || !date) { setAvailability(null); return; }
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `${API_URL}/appointments/availability?doctor=${doctorId}&date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setAvailability(data.availability);
    } catch {
      setAvailability(null);
    } finally {
      setLoadingSlots(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAvailability(bookForm.doctor, bookForm.date);
  }, [bookForm.doctor, bookForm.date, fetchAvailability]);

  // Auto-select first available slot when availability loads
  useEffect(() => {
    if (!availability) return;
    const currentSlotFull = availability[bookForm.timeSlot]?.full;
    if (currentSlotFull) {
      const firstOpen = SLOTS.find(s => !availability[s]?.full);
      if (firstOpen) setBookForm(f => ({ ...f, timeSlot: firstOpen }));
    }
  }, [availability]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!patientProfile) return;
    if (!bookForm.doctor || !bookForm.date || !bookForm.reason) {
      showBookMsg('Please fill in all required fields.', 'danger');
      return;
    }
    if (availability?.[bookForm.timeSlot]?.full) {
      showBookMsg(`The ${bookForm.timeSlot} slot is fully booked. Please choose another slot.`, 'danger');
      return;
    }
    setBooking(true);
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
        showBookMsg(
          `🎉 Appointment booked! You are token #${data.slotNumber} in the ${bookForm.timeSlot} slot. ${data.remainingSlots} slots remaining.`
        );
        setBookForm({ doctor: '', date: '', timeSlot: 'Morning', type: 'Online', reason: '' });
        setAvailability(null);
        if (onBookSuccess) onBookSuccess();
      } else {
        showBookMsg(data.message || 'Failed to book appointment.', 'danger');
      }
    } catch {
      showBookMsg('Server error. Please try again later.', 'danger');
    } finally {
      setBooking(false);
    }
  };

  const getSlotColor = (slot) => {
    if (!availability) return { bar: '#374151', text: 'var(--text-muted)' };
    const { booked, full } = availability[slot] || {};
    if (full) return { bar: '#ef4444', text: '#f87171' };
    if (booked >= MAX_PER_SLOT * 0.7) return { bar: '#f59e0b', text: '#fbbf24' };
    return { bar: '#10b981', text: '#34d399' };
  };

  return (
    <div className="fade-in grid-2-col" style={{ gap: '2rem' }}>
      {/* Booking Form */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>📅 Book an Appointment</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
          Schedule a consultation with any available Voguemark doctor. Each time slot holds up to {MAX_PER_SLOT} patients.
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
          {/* Doctor */}
          <div className="form-group">
            <label className="form-label">Select Doctor *</label>
            <select
              className="form-select" required value={bookForm.doctor}
              onChange={(e) => setBookForm({ ...bookForm, doctor: e.target.value, timeSlot: 'Morning' })}
            >
              <option value="">-- Choose a Doctor --</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>
                  {d.name} {d.department ? `(${d.department})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Preferred Date *</label>
            <input
              type="date" className="form-input" required
              min={new Date().toISOString().split('T')[0]}
              value={bookForm.date}
              onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
            />
          </div>

          {/* Slot availability grid */}
          {bookForm.doctor && bookForm.date && (
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                Time Slot *
                {loadingSlots && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>loading...</span>}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {SLOTS.map((slot) => {
                  const info = availability?.[slot];
                  const isFull = info?.full;
                  const isSelected = bookForm.timeSlot === slot;
                  const colors = getSlotColor(slot);
                  const pct = info ? (info.booked / MAX_PER_SLOT) * 100 : 0;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isFull}
                      onClick={() => !isFull && setBookForm({ ...bookForm, timeSlot: slot })}
                      style={{
                        padding: '0.875rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected
                          ? '2px solid var(--color-primary)'
                          : isFull
                          ? '1px solid rgba(239,68,68,0.25)'
                          : '1px solid var(--glass-border)',
                        background: isSelected
                          ? 'rgba(6,182,212,0.12)'
                          : isFull
                          ? 'rgba(239,68,68,0.04)'
                          : 'rgba(255,255,255,0.03)',
                        cursor: isFull ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        opacity: isFull ? 0.6 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {SLOT_ICONS[slot]} {slot}
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: colors.text }}>
                          {isFull ? 'FULL' : info ? `${info.booked}/${MAX_PER_SLOT}` : '--/--'}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: colors.bar,
                          borderRadius: '2px',
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        {isFull ? 'No slots available' : info ? `${info.available} slot${info.available !== 1 ? 's' : ''} left` : 'Select doctor & date'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Simple slot select when no doctor/date chosen yet */}
          {(!bookForm.doctor || !bookForm.date) && (
            <div className="form-group">
              <label className="form-label">Time Slot *</label>
              <select
                className="form-select" value={bookForm.timeSlot}
                onChange={(e) => setBookForm({ ...bookForm, timeSlot: e.target.value })}
              >
                {SLOTS.map(s => <option key={s} value={s}>{SLOT_ICONS[s]} {s}</option>)}
              </select>
            </div>
          )}

          {/* Appointment Type */}
          <div className="form-group">
            <label className="form-label">Appointment Type *</label>
            <select
              className="form-select" value={bookForm.type}
              onChange={(e) => setBookForm({ ...bookForm, type: e.target.value })}
            >
              <option value="Online">💻 Online</option>
              <option value="Walk-in">🏥 Walk-in</option>
            </select>
          </div>

          {/* Reason */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Reason for Visit *</label>
            <textarea
              className="form-textarea" rows="3" required
              placeholder="e.g. Persistent cough and fever for 3 days..."
              value={bookForm.reason}
              onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
            />
          </div>

          <button
            type="submit" className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem' }}
            disabled={booking || (availability?.[bookForm.timeSlot]?.full)}
          >
            {booking ? '⏳ Booking...' : '📅 Confirm Appointment'}
          </button>
        </form>
      </div>

      {/* Info Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>How to Book</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { step: '01', title: 'Choose Your Doctor', desc: 'Select from our team of certified Voguemark specialists.' },
              { step: '02', title: 'Pick a Date', desc: 'Choose a date and see live slot availability per session.' },
              { step: '03', title: 'Select a Time Slot', desc: `Each slot holds up to ${MAX_PER_SLOT} patients. Green = open, Red = full.` },
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

        {/* Slot legend */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Slot Status Legend</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { color: '#10b981', label: 'Available — plenty of slots open' },
              { color: '#f59e0b', label: 'Filling up — 70%+ booked' },
              { color: '#ef4444', label: 'Full — no more bookings accepted' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '3px solid var(--color-primary)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            <b style={{ color: 'var(--color-primary)' }}>ℹ️ Note:</b> Each time slot accepts a maximum of <b>{MAX_PER_SLOT} patients</b>.
            Your token number within the slot will be shown after booking.
            Online consultations are conducted via the Voguemark patient portal.
          </p>
        </div>
      </div>
    </div>
  );
}
