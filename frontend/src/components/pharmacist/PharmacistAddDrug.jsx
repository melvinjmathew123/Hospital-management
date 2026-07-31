import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function PharmacistAddDrug({ token, onRefresh, showMsg }) {
  const [newDrug, setNewDrug] = useState({ drugName: '', dosageForm: 'Tablet', stockLevel: '', expiryDate: '', price: '', threshold: '10' });

  const handleAddNewDrug = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/pharmacy/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newDrug)
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Drug added to catalog successfully.');
        setNewDrug({ drugName: '', dosageForm: 'Tablet', stockLevel: '', expiryDate: '', price: '', threshold: '10' });
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error saving drug', 'danger');
    }
  };

  return (
    <div className="glass-panel fade-in" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>Add Drug to Catalogue</h2>
      <form onSubmit={handleAddNewDrug}>
        <div className="form-group">
          <label className="form-label">Drug / Chemical Name</label>
          <input
            type="text" className="form-input" required
            placeholder="e.g. Advil Liqui-Gels 200mg"
            value={newDrug.drugName}
            onChange={(e) => setNewDrug({ ...newDrug, drugName: e.target.value })}
          />
        </div>
        <div className="grid-2-col" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Dosage Form</label>
            <select
              className="form-select" value={newDrug.dosageForm}
              onChange={(e) => setNewDrug({ ...newDrug, dosageForm: e.target.value })}
            >
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Ointment">Ointment</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Unit Price ($)</label>
            <input
              type="number" step="0.01" className="form-input" required
              placeholder="3.50"
              value={newDrug.price}
              onChange={(e) => setNewDrug({ ...newDrug, price: e.target.value })}
            />
          </div>
        </div>
        <div className="grid-2-col" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Initial Stock Level</label>
            <input
              type="number" className="form-input" required
              placeholder="100"
              value={newDrug.stockLevel}
              onChange={(e) => setNewDrug({ ...newDrug, stockLevel: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Low Stock Threshold Warning</label>
            <input
              type="number" className="form-input" required
              value={newDrug.threshold}
              onChange={(e) => setNewDrug({ ...newDrug, threshold: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label">Lot Expiration Date</label>
          <input
            type="date" className="form-input" required
            value={newDrug.expiryDate}
            onChange={(e) => setNewDrug({ ...newDrug, expiryDate: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          ➕ Save Drug to Registry
        </button>
      </form>
    </div>
  );
}
