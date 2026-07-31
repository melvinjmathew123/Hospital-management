import React from 'react';

export default function LabWorkorders({ labOrders, user, handleClaimOrder, handleOpenResultsForm }) {
  return (
    <div className="glass-panel fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Active Lab Orders Queue</h2>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Order Date</th>
              <th>Patient</th>
              <th>Test Name</th>
              <th>Ordering Doctor</th>
              <th>Assigned Tech</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {labOrders.map((order) => {
              const badgeClass = order.status === 'Completed' ? 'badge-success' : order.status === 'Processing' ? 'badge-warning' : 'badge-danger';
              return (
                <tr key={order._id}>
                  <td>{new Date(order.dateOrdered).toLocaleDateString()}</td>
                  <td><b>{order.patient?.name}</b></td>
                  <td>{order.testName}</td>
                  <td>{order.doctor?.name}</td>
                  <td>{order.technician?.name || <i style={{ color: 'var(--text-muted)' }}>Unassigned</i>}</td>
                  <td><span className={`badge ${badgeClass}`}>{order.status}</span></td>
                  <td>
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => handleClaimOrder(order._id)}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Claim Task
                      </button>
                    )}
                    {order.status === 'Processing' && order.technician?._id === user._id && (
                      <button
                        onClick={() => handleOpenResultsForm(order)}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))' }}
                      >
                        🧪 Enter Values
                      </button>
                    )}
                    {order.status === 'Completed' && (
                      <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>Completed</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {labOrders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No lab test orders listed.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
