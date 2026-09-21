import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { fetchDoctorDashboardData } from '../store/slices/clinicalSlice';
import { API_URL } from '../store/slices/authSlice';

import AlertMessage from '../components/shared/AlertMessage';
import DoctorAppointments from '../components/doctor/DoctorAppointments';
import DoctorDirectory from '../components/doctor/DoctorDirectory';
import DoctorConsultation from '../components/doctor/DoctorConsultation';
import DoctorHistory from '../components/doctor/DoctorHistory';

export default function DoctorDashboard() {
  const dispatch = useDispatch();
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const { appointments, patients, historyLogs, loading, error } = useSelector(state => state.clinical);

  const loadData = () => {
    dispatch(fetchDoctorDashboardData());
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

  const handleStartConsultation = (appointment) => {
    setSelectedPatient(appointment.patient);
    setActiveTab('consultation');
    updateAppointmentStatus(appointment._id, 'In Progress');
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await fetch(`${API_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const sidebarItems = [
    { id: 'appointments', label: 'Appointments Queue' },
    { id: 'patients', label: 'Clinical Patient Records' },
    { id: 'consultation', label: 'Write Consultation' },
    { id: 'history', label: 'Consultation History' }
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab}>
      <AlertMessage msg={msg} />

      {activeTab === 'appointments' && (
        <DoctorAppointments appointments={appointments} onStartConsultation={handleStartConsultation} />
      )}
      {activeTab === 'patients' && (
        <DoctorDirectory patients={patients} selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} />
      )}
      {activeTab === 'consultation' && (
        <DoctorConsultation
          selectedPatient={selectedPatient}
          setSelectedPatient={setSelectedPatient}
          user={user}
          token={token}
          appointments={appointments}
          updateAppointmentStatus={updateAppointmentStatus}
          showMsg={showMsg}
          setActiveTab={setActiveTab}
        />
      )}
      {activeTab === 'history' && (
        <DoctorHistory historyLogs={historyLogs} />
      )}
    </DashboardLayout>
  );
}
