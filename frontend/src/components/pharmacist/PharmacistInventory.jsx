import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function PharmacistInventory({ inventory, token, onRefresh, showMsg }) {
  const [stockAdjustment, setStockAdjustment] = useState({ id: '', amount: '' });

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!stockAdjustment.id || !stockAdjustment.amount) return;
    try {
      const res = await fetch(`${API_URL}/pharmacy/inventory/${stockAdjustment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          stockLevel: Number(stockAdjustment.amount)
        })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Inventory stock level updated successfully.');
        setStockAdjustment({ id: '', amount: '' });
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error adjusting stock', 'danger');
    }
  };

  return (
    <div className="fade-in grid-split" style={{ gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Pharmacy Catalog Status</h2>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Drug Name</th>
                <th>Form</th>
                <th>Pricing</th>
                <th>Stock</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((drug) => {
                const isLow = drug.stockLevel <= drug.threshold;
                const isExpired = new Date(drug.expiryDate) < new Date();
                return (
                  <tr key={drug._id} onClick={() => setStockAdjustment({ id: drug._id, amount: drug.stockLevel })} style={{ cursor: 'pointer' }}>
                    <td><b>{drug.drugName}</b></td>
                    <td><span className="badge badge-info">{drug.dosageForm}</span></td>
                    <td>${drug.price}</td>
                    <td><b style={{ color: isLow ? 'var(--color-danger)' : 'var(--color-success)' }}>{drug.stockLevel}</b></td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(drug.expiryDate).toLocaleDateString()}</td>
                    <td>
                      {isExpired ? (
                        <span className="badge badge-danger">Expired</span>
                      ) : isLow ? (
                        <span className="badge badge-warning">Low Stock</span>
                      ) : (
                        <span className="badge badge-success">Good</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Restock Inventory</h2>
        {stockAdjustment.id ? (
          <form onSubmit={handleAdjustStock}>
            <div style={{ marginBottom: '1rem' }}>
              <p>Restocking Drug: <b>{inventory.find(i => i._id === stockAdjustment.id)?.drugName}</b></p>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Set New Stock Quantity</label>
              <input
                type="number" className="form-input" required
                value={stockAdjustment.amount}
                onChange={(e) => setStockAdjustment({ ...stockAdjustment, amount: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>💾 Update Stock</button>
              <button type="button" onClick={() => setStockAdjustment({ id: '', amount: '' })} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '3rem' }}>
            Select a drug row from the table to modify its inventory count.
          </p>
        )}
      </div>
    </div>
  );
}
