import React from 'react';

export default function PatientLabReports({ labOrders }) {
  const completedOrders = labOrders.filter(l => l.status === 'Completed');

  return (
    <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Laboratory Test Results</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {completedOrders.map((order) => (
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
        {completedOrders.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No completed laboratory results available.</p>
        )}
      </div>
    </div>
  );
}
