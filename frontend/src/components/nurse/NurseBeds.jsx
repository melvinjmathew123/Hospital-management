import React, { useState } from 'react';
import { API_URL } from '../../context/AuthContext';
import { BedIcon } from '../shared/Icons';

export default function NurseBeds({ beds, token, onRefresh, showMsg }) {
  const [selectedBed, setSelectedBed] = useState(null);
  const [bedStatusUpdate, setBedStatusUpdate] = useState('Available');

  const handleUpdateBedStatus = async (e) => {
    e.preventDefault();
    if (!selectedBed) return;
    try {
      const res = await fetch(`${API_URL}/hospital/beds/${selectedBed._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: bedStatusUpdate })
      });
      const data = await res.json();
      if (data.success) {
        showMsg(`Bed ${selectedBed.bedNumber} status updated successfully.`);
        setSelectedBed(null);
        if (onRefresh) onRefresh();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error updating bed', 'danger');
    }
  };

  const wardsMap = {};
  beds.forEach(bed => {
    const wName = bed.ward?.name || 'Unassigned Wards';
    if (!wardsMap[wName]) wardsMap[wName] = [];
    wardsMap[wName].push(bed);
  });

  return (
    <div className="fade-in grid-split" style={{ gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Interactive Ward Bed Layout</h2>
        {Object.keys(wardsMap).map(wardName => (
          <div key={wardName} style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.25rem' }}>
              {wardName}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
              {wardsMap[wardName].map(bed => {
                const isAvail = bed.status === 'Available';
                const isOccupied = bed.status === 'Occupied';
                const bg = isAvail ? '#f0fdf4' : isOccupied ? '#fef2f2' : '#fffbeb';
                const border = isAvail ? '#bbf7d0' : isOccupied ? '#fecaca' : '#fde68a';
                const color = isAvail ? '#15803d' : isOccupied ? '#b91c1c' : '#b45309';
                return (
                  <div
                    key={bed._id}
                    onClick={() => { setSelectedBed(bed); setBedStatusUpdate(bed.status); }}
                    className="glass-card"
                    style={{
                      background: bg, borderColor: border, color: color,
                      cursor: 'pointer', textAlign: 'center', padding: '1.25rem 0.75rem',
                      borderWidth: selectedBed?._id === bed._id ? '2px' : '1px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>
                      <BedIcon size={24} color={color} />
                    </div>
                    <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{bed.bedNumber}</p>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>{bed.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Bed Control Settings</h2>
        {selectedBed ? (
          <form onSubmit={handleUpdateBedStatus}>
            <div style={{ marginBottom: '1.5rem' }}>
              <p>Bed Selected: <b>{selectedBed.bedNumber}</b></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ward: {selectedBed.ward?.name}</p>
              {selectedBed.currentPatient && (
                <p style={{ marginTop: '0.5rem', color: 'var(--color-danger)' }}>Occupied by: {selectedBed.currentPatient.name}</p>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Set Maintenance Status</label>
              <select
                className="form-select"
                value={bedStatusUpdate}
                onChange={(e) => setBedStatusUpdate(e.target.value)}
              >
                <option value="Available">Available</option>
                <option value="Under Maintenance">Under Maintenance</option>
                {selectedBed.status === 'Occupied' && <option value="Occupied">Occupied</option>}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Save Changes</button>
              <button type="button" onClick={() => setSelectedBed(null)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Select a bed card from the ward grid to edit details or log maintenance.
          </div>
        )}
      </div>
    </div>
  );
}
