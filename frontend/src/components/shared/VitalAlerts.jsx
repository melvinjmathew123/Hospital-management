import React from 'react';

// ─── Vitals Health Analyzer ───────────────────────────────────────────────────
export function analyzeVitals(vitals) {
  const alerts = [];
  if (!vitals) return alerts;

  const temp = parseFloat(vitals.temperature);
  const pulse = parseInt(vitals.pulseRate, 10);
  const spo2 = parseInt(vitals.spO2, 10);
  const bpParts = (vitals.bloodPressure || '').split('/');
  const systolic = parseInt(bpParts[0], 10);
  const diastolic = parseInt(bpParts[1], 10);

  if (temp > 99.5) alerts.push({ label: 'Fever Detected', color: '#b91c1c', bg: '#fee2e2', border: '#fecaca', icon: '🔥' });
  else if (temp < 96.0) alerts.push({ label: 'Hypothermia Risk', color: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe', icon: '🧊' });

  if (!isNaN(systolic) && (systolic > 135 || (!isNaN(diastolic) && diastolic > 85)))
    alerts.push({ label: 'High Blood Pressure', color: '#b91c1c', bg: '#fee2e2', border: '#fecaca', icon: '❤️' });

  if (pulse > 100) alerts.push({ label: 'Tachycardia (Fast Pulse)', color: '#b45309', bg: '#fef3c7', border: '#fde68a', icon: '⚡' });
  else if (pulse < 60) alerts.push({ label: 'Bradycardia (Slow Pulse)', color: '#b45309', bg: '#fef3c7', border: '#fde68a', icon: '⚡' });

  if (spo2 < 95) alerts.push({ label: 'Low SpO2 (Hypoxia)', color: '#b91c1c', bg: '#fee2e2', border: '#fecaca', icon: '🫁' });

  return alerts;
}

// ─── Vitals Alert Badges Component ────────────────────────────────────────────
export default function VitalAlerts({ vitals }) {
  const alerts = analyzeVitals(vitals);
  if (alerts.length === 0) return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0',
      borderRadius: '9999px', padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 700
    }}>✅ Normal</span>
  );
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
      {alerts.map((a, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          background: a.bg, color: a.color, border: `1px solid ${a.border}`,
          borderRadius: '9999px', padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 700
        }}>{a.icon} {a.label}</span>
      ))}
    </div>
  );
}
