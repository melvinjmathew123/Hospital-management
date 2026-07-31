import React from 'react';

export default function AlertMessage({ msg }) {
  if (!msg || !msg.text) return null;

  const isDanger = msg.type === 'danger';

  return (
    <div
      style={{
        background: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
        border: isDanger ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
        color: isDanger ? '#fca5a5' : '#34d399',
        padding: '0.75rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        fontWeight: 500,
      }}
    >
      {msg.text}
    </div>
  );
}
