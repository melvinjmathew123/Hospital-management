import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { fetchPharmacyData } from '../store/slices/pharmacySlice';

import AlertMessage from '../components/shared/AlertMessage';
import PharmacistPrescriptions from '../components/pharmacist/PharmacistPrescriptions';
import PharmacistInventory from '../components/pharmacist/PharmacistInventory';
import PharmacistAddDrug from '../components/pharmacist/PharmacistAddDrug';

export default function PharmacistDashboard() {
  const dispatch = useDispatch();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const { prescriptions, inventory, loading, error } = useSelector(state => state.pharmacy);

  const loadData = () => {
    dispatch(fetchPharmacyData());
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (error) showMsg(error, 'danger');
  }, [error]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 5000);
  };

  const sidebarItems = [
    { id: 'prescriptions', label: 'Prescription Queue' },
    { id: 'inventory', label: 'Drug Inventory Catalog' },
    { id: 'add_drug', label: 'Catalog Intake' }
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      <AlertMessage msg={msg} />

      {activeTab === 'prescriptions' && (
        <PharmacistPrescriptions
          prescriptions={prescriptions} inventory={inventory}
          token={token} onRefresh={loadData} showMsg={showMsg} setActiveTab={setActiveTab}
        />
      )}
      {activeTab === 'inventory' && (
        <PharmacistInventory inventory={inventory} token={token} onRefresh={loadData} showMsg={showMsg} />
      )}
      {activeTab === 'add_drug' && (
        <PharmacistAddDrug token={token} onRefresh={loadData} showMsg={showMsg} />
      )}
    </DashboardLayout>
  );
}
