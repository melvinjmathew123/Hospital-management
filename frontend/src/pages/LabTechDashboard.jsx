import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { fetchLabOrders } from '../store/slices/clinicalSlice';
import { API_URL } from '../store/slices/authSlice';

import AlertMessage from '../components/shared/AlertMessage';
import LabWorkorders from '../components/labTech/LabWorkorders';
import LabResultsEntry from '../components/labTech/LabResultsEntry';

export default function LabTechDashboard() {
  const dispatch = useDispatch();
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [params, setParams] = useState([{ parameter: '', value: '', normalRange: '', unit: '' }]);
  const [remarks, setRemarks] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const { labOrders, loading, error } = useSelector(state => state.clinical);

  const loadData = () => {
    dispatch(fetchLabOrders());
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

  const handleClaimOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/labs/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ technician: user._id, status: 'Processing' })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('Lab workorder claimed. Moved to Processing.');
        loadData();
      } else {
        showMsg(data.message, 'danger');
      }
    } catch (err) {
      showMsg('Server error claiming order', 'danger');
    }
  };

  const handleOpenResultsForm = (order) => {
    setSelectedOrder(order);
    setRemarks('');
    if (order.testName.includes('CBC') || order.testName.includes('Blood')) {
      setParams([
        { parameter: 'Hemoglobin', value: '', normalRange: '13.5 - 17.5', unit: 'g/dL' },
        { parameter: 'White Blood Cell (WBC)', value: '', normalRange: '4,500 - 11,000', unit: 'mcL' },
        { parameter: 'Platelets', value: '', normalRange: '150,000 - 450,000', unit: 'mcL' }
      ]);
    } else if (order.testName.includes('Lipid')) {
      setParams([
        { parameter: 'Total Cholesterol', value: '', normalRange: '< 200', unit: 'mg/dL' },
        { parameter: 'Triglycerides', value: '', normalRange: '< 150', unit: 'mg/dL' },
        { parameter: 'HDL (Good) Cholesterol', value: '', normalRange: '> 40', unit: 'mg/dL' },
        { parameter: 'LDL (Bad) Cholesterol', value: '', normalRange: '< 100', unit: 'mg/dL' }
      ]);
    } else {
      setParams([{ parameter: 'Primary Value', value: '', normalRange: 'Normal', unit: '' }]);
    }
    setActiveTab('enter_results');
  };

  const sidebarItems = [
    { id: 'orders', label: 'Lab Workorders', icon: '🧪' },
    { id: 'enter_results', label: 'Report Test Results', icon: '📝' }
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      <AlertMessage msg={msg} />

      {activeTab === 'orders' && (
        <LabWorkorders
          labOrders={labOrders} user={user}
          handleClaimOrder={handleClaimOrder} handleOpenResultsForm={handleOpenResultsForm}
        />
      )}
      {activeTab === 'enter_results' && (
        <LabResultsEntry
          selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder}
          params={params} setParams={setParams}
          remarks={remarks} setRemarks={setRemarks}
          token={token} onRefresh={loadData} showMsg={showMsg} setActiveTab={setActiveTab}
        />
      )}
    </DashboardLayout>
  );
}
