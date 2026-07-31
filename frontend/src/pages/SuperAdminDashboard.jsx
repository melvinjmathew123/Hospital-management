import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { fetchHospitalData } from '../store/slices/hospitalSlice';

import AlertMessage from '../components/shared/AlertMessage';
import SuperAdminOverview from '../components/superAdmin/SuperAdminOverview';
import SuperAdminDepartments from '../components/superAdmin/SuperAdminDepartments';
import SuperAdminWards from '../components/superAdmin/SuperAdminWards';
import SuperAdminBeds from '../components/superAdmin/SuperAdminBeds';
import SuperAdminUsers from '../components/superAdmin/SuperAdminUsers';

export default function SuperAdminDashboard() {
  const dispatch = useDispatch();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const { departments, wards, beds, users, loading, error } = useSelector(state => state.hospital);

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
    { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
    { id: 'departments', label: 'Departments', icon: '🏢' },
    { id: 'wards', label: 'Wards', icon: '🛏️' },
    { id: 'beds', label: 'Beds & Rooms', icon: '🏨' },
    { id: 'users', label: 'User Directory', icon: '👥' }
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      <AlertMessage msg={msg} />

      {activeTab === 'overview' && (
        <SuperAdminOverview departments={departments} wards={wards} beds={beds} users={users} />
      )}
      {activeTab === 'departments' && (
        <SuperAdminDepartments departments={departments} token={token} onRefresh={loadData} showMsg={showMsg} />
      )}
      {activeTab === 'wards' && (
        <SuperAdminWards wards={wards} departments={departments} token={token} onRefresh={loadData} showMsg={showMsg} />
      )}
      {activeTab === 'beds' && (
        <SuperAdminBeds beds={beds} wards={wards} token={token} onRefresh={loadData} showMsg={showMsg} />
      )}
      {activeTab === 'users' && (
        <SuperAdminUsers users={users} token={token} onRefresh={loadData} showMsg={showMsg} />
      )}
    </DashboardLayout>
  );
}
