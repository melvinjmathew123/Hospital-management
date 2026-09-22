import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth, API_URL } from '../context/AuthContext';
import { fetchHospitalData } from '../store/slices/hospitalSlice';

import AlertMessage from '../components/shared/AlertMessage';
import AdminPatients from '../components/hospitalAdmin/AdminPatients';
import AdminBilling from '../components/hospitalAdmin/AdminBilling';
import AdminCertificates from '../components/hospitalAdmin/AdminCertificates';

export default function HospitalAdminDashboard() {
  const dispatch = useDispatch();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('patients');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const { patients, loading, error } = useSelector(state => state.hospital);

  // bills are fetched separately as they're not in hospitalSlice
  const [bills, setBills] = useState([]);

  const fetchBills = async () => {
    try {
      const res = await fetch(`${API_URL}/billing`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setBills(data.bills);
    } catch {
      showMsg('Failed to load billing data', 'danger');
    }
  };

  const loadData = () => {
    dispatch(fetchHospitalData());
    fetchBills();
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (error) setMsg({ text: error, type: 'danger' });
  }, [error]);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 5000);
  };

  const sidebarItems = [
    { id: 'patients', label: 'Patient Intake' },
    { id: 'billing', label: 'Billing & Ledger' },
    { id: 'certificates', label: 'Certificates & Documents' }
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      <AlertMessage msg={msg} />

      {activeTab === 'patients' && (
        <AdminPatients patients={patients} token={token} onRefresh={loadData} showMsg={showMsg} />
      )}
      {activeTab === 'billing' && (
        <AdminBilling bills={bills} token={token} onRefresh={loadData} showMsg={showMsg} />
      )}
      {activeTab === 'certificates' && (
        <AdminCertificates patients={patients} showMsg={showMsg} />
      )}
    </DashboardLayout>
  );
}
