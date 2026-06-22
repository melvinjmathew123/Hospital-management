import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { API_URL, useAuth } from '../context/AuthContext';

export default function LabTechDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  // Core Data
  const [labOrders, setLabOrders] = useState([]);
  
  // Selections & Forms
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [params, setParams] = useState([{ parameter: '', value: '', normalRange: '', unit: '' }]);
  const [remarks, setRemarks] = useState('');

  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchOrders = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`${API_URL}/labs`, { headers });
      const data = await res.json();
      if (data.success) {
        setLabOrders(data.labOrders);
      }
    } catch (err) {
      showMsg('Failed to load lab workorders', 'danger');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 5000);
  };

  const handleClaimOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/labs/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          technician: user._id,
          status: 'Processing'
        })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Lab workorder claimed. Moved to Processing.');
        fetchOrders();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error claiming order', 'danger');
    }
  };

  const handleOpenResultsForm = (order) => {
    setSelectedOrder(order);
    setRemarks('');
    // Prefill some default rows based on common tests
    if (order.testName.includes('CBC') || order.testName.includes('Blood')) {
      setParams([
        { parameter: 'Hemoglobin', value: '', normalRange: '13.5 - 17.5', unit: 'g/dL' },
        { parameter: 'White Blood Cell (WBC)', value: '', normalRange: '4,500 - 11,000', unit: 'mcL' },
        { parameter: 'Platelets', value: '', normalRange: '150,000 - 450,000', unit: 'mcL' }
      ]);
    } else if (order.testName.includes('Lipid')) {
      setParams([
        { parameter: 'Total Cholesterol', value: '', normalRange: '< 200', unit: 'mg/dL' },
        { parameter: 'Triglycerides', value: '', normalRange: '< 150', unit: 'mg/dL' },
        { parameter: 'HDL (Good) Cholesterol', value: '', normalRange: '> 40', unit: 'mg/dL' },
        { parameter: 'LDL (Bad) Cholesterol', value: '', normalRange: '< 100', unit: 'mg/dL' }
      ]);
    } else {
      setParams([{ parameter: 'Primary Value', value: '', normalRange: 'Normal', unit: '' }]);
    }
    setActiveTab('enter_results');
  };

  const addParamRow = () => {
    setParams([...params, { parameter: '', value: '', normalRange: '', unit: '' }]);
  };

  const updateParamRow = (idx, field, val) => {
    const updated = params.map((p, i) => {
      if (i === idx) return { ...p, [field]: val };
      return p;
    });
    setParams(updated);
  };

  const handleSubmitResults = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const res = await fetch(`${API_URL}/labs/${selectedOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          status: 'Completed',
          resultDetails: params,
          remarks
        })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Lab test results authorized and uploaded. Reports compiled.');
        setSelectedOrder(null);
        setActiveTab('orders');
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error saving lab results', 'danger');
    }
  };

  const sidebarItems = [
    { id: 'orders', label: 'Lab Workorders', icon: '🧪' },
    { id: 'enter_results', label: 'Report Test Results', icon: '📝' }
  ];

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

      {/* Lab Workorders Tab */}
      {activeTab === 'orders' && (
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
      )}

      {/* Enter Test Results Tab */}
      {activeTab === 'enter_results' && (
        <div className="fade-in">
          {selectedOrder ? (
            <form onSubmit={handleSubmitResults} className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Laboratory Report Entry: {selectedOrder.testName}</h2>
                <span className="badge badge-info">Patient: {selectedOrder.patient?.name}</span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                <div className="lab-param-row lab-param-header" style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                  <span>Parameter / Analyte</span>
                  <span>Value Measured</span>
                  <span>Reference Range</span>
                  <span>Unit</span>
                </div>

                {params.map((p, idx) => (
                  <div key={idx} className="lab-param-row" style={{ alignItems: 'center', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Hemoglobin"
                      value={p.parameter}
                      onChange={(e) => updateParamRow(idx, 'parameter', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. 14.2"
                      value={p.value}
                      onChange={(e) => updateParamRow(idx, 'value', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 13.5 - 17.5"
                      value={p.normalRange}
                      onChange={(e) => updateParamRow(idx, 'normalRange', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. g/dL"
                      value={p.unit}
                      onChange={(e) => updateParamRow(idx, 'unit', e.target.value)}
                    />
                  </div>
                ))}

                <button type="button" onClick={addParamRow} className="btn btn-secondary" style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                  ➕ Add Parameter Row
                </button>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Technician Remarks / Interpretation</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g. All values fall within standard normal thresholds..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                  💾 Authorize & Complete Report
                </button>
                <button type="button" onClick={() => { setSelectedOrder(null); setActiveTab('orders'); }} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', height: '200px' }}>
              Select a claimed order from the queue to compile test results.
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
