import React from 'react';
import { CheckCircleIcon, AlertCircleIcon } from './Icons';

export default function AlertMessage({ msg }) {
  if (!msg || !msg.text) return null;

  const isDanger = msg.type === 'danger';

  return (
    <div
      style={{
        background: isDanger ? '#fef2f2' : '#f0fdf4',
        border: isDanger ? '1px solid #fecaca' : '1px solid #bbf7d0',
        color: isDanger ? '#b91c1c' : '#15803d',
        padding: '0.75rem 1.15rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '1.25rem',
        fontWeight: 500,
        fontSize: '0.88rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem'
      }}
    >
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {isDanger ? (
          <AlertCircleIcon size={18} color="#b91c1c" />
        ) : (
          <CheckCircleIcon size={18} color="#15803d" />
        )}
      </div>
      <div>{msg.text}</div>
    </div>
  );
}
