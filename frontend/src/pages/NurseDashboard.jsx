import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { fetchHospitalData } from '../store/slices/hospitalSlice';
import { API_URL } from '../store/slices/authSlice';

import AlertMessage from '../components/shared/AlertMessage';
import NurseBeds from '../components/nurse/NurseBeds';
import NurseAdmissions from '../components/nurse/NurseAdmissions';
import NurseVitals from '../components/nurse/NurseVitals';

export default function NurseDashboard() {
  const dispatch = useDispatch();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('beds');
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Nurse only needs beds, patients, and doctors from hospital slice
  const { beds, patients, users: allUsers, loading, error } = useSelector(state => state.hospital);

  // Filter doctors from the full users list
  const doctors = allUsers.filter(u => u.role === 'Doctor');

  const loadData = () => {
    dispatch(fetchHospitalData());
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
    { id: 'beds', label: 'Beds Grid Matrix' },
    { id: 'admissions', label: 'Ward Admissions' },
    { id: 'vitals', label: 'Log Patient Vitals' }
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      <AlertMessage msg={msg} />

      {activeTab === 'beds' && (
        <NurseBeds beds={beds} token={token} onRefresh={loadData} showMsg={showMsg} />
      )}
      {activeTab === 'admissions' && (
        <NurseAdmissions patients={patients} beds={beds} doctors={doctors} token={token} onRefresh={loadData} showMsg={showMsg} />
      )}
      {activeTab === 'vitals' && (
        <NurseVitals patients={patients} token={token} onRefresh={loadData} showMsg={showMsg} />
      )}
    </DashboardLayout>
  );
}
