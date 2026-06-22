import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { API_URL, useAuth } from '../context/AuthContext';

export default function PharmacistDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('prescriptions');

  // Core Data
  const [prescriptions, setPrescriptions] = useState([]);
  const [inventory, setInventory] = useState([]);

  // Forms
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [newDrug, setNewDrug] = useState({ drugName: '', dosageForm: 'Tablet', stockLevel: '', expiryDate: '', price: '', threshold: '10' });
  const [stockAdjustment, setStockAdjustment] = useState({ id: '', amount: '' });

  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchAll = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Get all consultations/prescriptions
      const resC = await fetch(`${API_URL}/clinical/consultations`, { headers });
      const dataC = await resC.json();
      if (dataC.success) {
        setPrescriptions(dataC.consultations);
      }

      // Get pharmacy inventory
      const resI = await fetch(`${API_URL}/pharmacy/inventory`, { headers });
      const dataI = await resI.json();
      if (dataI.success) {
        setInventory(dataI.inventory);
      }

    } catch (err) {
      showMsg('Failed to load pharmacy logs', 'danger');
    }
  };

  useEffect(() => {
    fetchAll();
  }, [activeTab]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 5000);
  };

  const handleDispenseMedication = async (e) => {
    e.preventDefault();
    if (!selectedPrescription) return;

    // Build the list of items to dispense. We match drugs from inventory by name.
    const dispensedItems = [];
    let isStockValid = true;

    for (const med of selectedPrescription.medications) {
      const invDrug = inventory.find(i => i.drugName.toLowerCase().includes(med.name.toLowerCase()));
      if (!invDrug) {
        showMsg(`Medicine "${med.name}" is not registered in inventory. Please add it first.`, 'danger');
        isStockValid = false;
        break;
      }
      if (invDrug.stockLevel < 1) { // Assume quantity of 1 for demo or extract days
        showMsg(`Insufficient inventory stock for "${invDrug.drugName}".`, 'danger');
        isStockValid = false;
        break;
      }
      dispensedItems.push({
        drugId: invDrug._id,
        quantity: 1
      });
    }

    if (!isStockValid) return;

    try {
      const res = await fetch(`${API_URL}/pharmacy/dispense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          patientId: selectedPrescription.patient?._id,
          consultationId: selectedPrescription._id,
          dispensedItems
        })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Prescription successfully dispensed. Stock level updated and cost posted to patient ledger.');
        setSelectedPrescription(null);
        setActiveTab('prescriptions');
        fetchAll();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error dispensing drugs', 'danger');
    }
  };

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
        fetchAll();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error saving drug', 'danger');
    }
  };

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
        fetchAll();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error adjusting stock', 'danger');
    }
  };

  const sidebarItems = [
    { id: 'prescriptions', label: 'Prescription Queue', icon: '📋' },
    { id: 'inventory', label: 'Drug Inventory catalog', icon: '💊' },
    { id: 'add_drug', label: 'Catalog Intake', icon: '➕' }
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

      {/* Prescriptions Queue Tab */}
      {activeTab === 'prescriptions' && (
        <div className="fade-in grid-split-rev" style={{ gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Active Prescriptions Queue</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {prescriptions.map((pres) => (
                <div
                  key={pres._id}
                  onClick={() => setSelectedPrescription(pres)}
                  className="glass-card"
                  style={{
                    cursor: 'pointer',
                    borderColor: selectedPrescription?._id === pres._id ? 'var(--color-primary)' : undefined,
                    background: selectedPrescription?._id === pres._id ? 'rgba(255,255,255,0.06)' : undefined
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{pres.patient?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Diagnosed: {pres.diagnosis} <br />
                    🩺 Prescribed By: {pres.doctor?.name}
                  </div>
                </div>
              ))}
              {prescriptions.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No active prescriptions in queue.</p>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Dispense Verification Panel</h2>
            {selectedPrescription ? (
              <form onSubmit={handleDispenseMedication}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <p>Patient File: <b>{selectedPrescription.patient?.name}</b></p>
                  <p>Diagnosis: <b>{selectedPrescription.diagnosis}</b></p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Attending Physician: {selectedPrescription.doctor?.name}</p>
                </div>

                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Prescribed Line Items:</h3>
                  {selectedPrescription.medications?.map((med, i) => {
                    const invItem = inventory.find(inv => inv.drugName.toLowerCase().includes(med.name.toLowerCase()));
                    const stock = invItem ? invItem.stockLevel : 0;
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <div>
                          <span><b>{med.name}</b> - {med.dosage}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructions: {med.frequency} for {med.duration}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.85rem' }}>Stock: <b style={{ color: stock > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{stock} available</b></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                    💊 Dispense & Post Charges
                  </button>
                  <button type="button" onClick={() => setSelectedPrescription(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)' }}>
                Select a prescription from the queue to process drug inventory dispensing.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drug Inventory catalog Tab */}
      {activeTab === 'inventory' && (
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
                    type="number"
                    className="form-input"
                    required
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
      )}

      {/* Catalog Intake Tab */}
      {activeTab === 'add_drug' && (
        <div className="glass-panel fade-in" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>Add Drug to Catalogue</h2>
          <form onSubmit={handleAddNewDrug}>
            <div className="form-group">
              <label className="form-label">Drug / Chemical Name</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Advil Liqui-Gels 200mg"
                value={newDrug.drugName}
                onChange={(e) => setNewDrug({ ...newDrug, drugName: e.target.value })}
              />
            </div>
            <div className="grid-2-col" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Dosage Form</label>
                <select
                  className="form-select"
                  value={newDrug.dosageForm}
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
                  type="number"
                  step="0.01"
                  className="form-input"
                  required
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
                  type="number"
                  className="form-input"
                  required
                  placeholder="100"
                  value={newDrug.stockLevel}
                  onChange={(e) => setNewDrug({ ...newDrug, stockLevel: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Low Stock Threshold Warning</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  value={newDrug.threshold}
                  onChange={(e) => setNewDrug({ ...newDrug, threshold: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Lot Expiration Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={newDrug.expiryDate}
                onChange={(e) => setNewDrug({ ...newDrug, expiryDate: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              ➕ Save Drug to Registry
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
