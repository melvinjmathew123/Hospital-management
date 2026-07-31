import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';

export default function PharmacistPrescriptions({ prescriptions, inventory, token, onRefresh, showMsg, setActiveTab }) {
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const handleDispenseMedication = async (e) => {
    e.preventDefault();
    if (!selectedPrescription) return;

    const dispensedItems = [];
    let isStockValid = true;

    for (const med of selectedPrescription.medications) {
      const invDrug = inventory.find(i => i.drugName.toLowerCase().includes(med.name.toLowerCase()));
      if (!invDrug) {
        showMsg(`Medicine "${med.name}" is not registered in inventory. Please add it first.`, 'danger');
        isStockValid = false;
        break;
      }
      if (invDrug.stockLevel < 1) {
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
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error dispensing drugs', 'danger');
    }
  };

  return (
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
  );
}
