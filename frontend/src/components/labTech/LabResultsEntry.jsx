import React from 'react';
import { API_URL } from '../../context/AuthContext';

export default function LabResultsEntry({ selectedOrder, setSelectedOrder, params, setParams, remarks, setRemarks, token, onRefresh, showMsg, setActiveTab }) {
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
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error saving lab results', 'danger');
    }
  };

  return (
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
                  type="text" className="form-input" required placeholder="e.g. Hemoglobin"
                  value={p.parameter} onChange={(e) => updateParamRow(idx, 'parameter', e.target.value)}
                />
                <input
                  type="text" className="form-input" required placeholder="e.g. 14.2"
                  value={p.value} onChange={(e) => updateParamRow(idx, 'value', e.target.value)}
                />
                <input
                  type="text" className="form-input" placeholder="e.g. 13.5 - 17.5"
                  value={p.normalRange} onChange={(e) => updateParamRow(idx, 'normalRange', e.target.value)}
                />
                <input
                  type="text" className="form-input" placeholder="e.g. g/dL"
                  value={p.unit} onChange={(e) => updateParamRow(idx, 'unit', e.target.value)}
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
              className="form-textarea" rows="3"
              placeholder="e.g. All values fall within standard normal thresholds..."
              value={remarks} onChange={(e) => setRemarks(e.target.value)}
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
  );
}
