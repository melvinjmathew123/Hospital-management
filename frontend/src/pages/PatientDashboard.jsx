import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { fetchPatientDashboardData } from '../store/slices/patientSlice';
import { useState } from 'react';

import AlertMessage from '../components/shared/AlertMessage';
import PatientProfile from '../components/patient/PatientProfile';
import PatientAppointments from '../components/patient/PatientAppointments';
import BookAppointment from '../components/patient/BookAppointment';
import PatientLabReports from '../components/patient/PatientLabReports';
import PatientPrescriptions from '../components/patient/PatientPrescriptions';
import PatientBilling from '../components/patient/PatientBilling';

export default function PatientDashboard() {
  const dispatch = useDispatch();
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const {
    profile: patientProfile,
    appointments,
    labOrders,
    consultations,
    bills,
    doctors,
    loading,
    error
  } = useSelector(state => state.patient);

  const loadData = () => {
    dispatch(fetchPatientDashboardData());
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (error) setMsg({ text: error, type: 'danger' });
  }, [error]);

  const sidebarItems = [
    { id: 'profile', label: 'My Clinical File', icon: '📂' },
    { id: 'appointments', label: 'My Appointments', icon: '⏰' },
    { id: 'book', label: 'Book Appointment', icon: '📅' },
    { id: 'labs', label: 'Lab Reports', icon: '🧪' },
    { id: 'prescriptions', label: 'My Prescriptions', icon: '📋' },
    { id: 'billing', label: 'Bills & Payments', icon: '💳' }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        <h3>Loading your clinical portal file...</h3>
      </div>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      <AlertMessage msg={msg} />

      {activeTab === 'profile' && <PatientProfile patientProfile={patientProfile} />}
      {activeTab === 'appointments' && <PatientAppointments appointments={appointments} />}
      {activeTab === 'book' && (
        <BookAppointment
          doctors={doctors}
          patientProfile={patientProfile}
          token={token}
          onBookSuccess={loadData}
        />
      )}
      {activeTab === 'labs' && <PatientLabReports labOrders={labOrders} />}
      {activeTab === 'prescriptions' && <PatientPrescriptions consultations={consultations} />}
      {activeTab === 'billing' && (
        <PatientBilling
          bills={bills}
          patientProfile={patientProfile}
          user={user}
          token={token}
          onPaymentSuccess={loadData}
        />
      )}
    </DashboardLayout>
  );
}
