import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from './authSlice';

export const fetchPatientDashboardData = createAsyncThunk(
  'patient/fetchPatientDashboardData',
  async (_, { getState, rejectWithValue }) => {
    const { token, user } = getState().auth;
    if (!token || !user) return rejectWithValue('Not authenticated');

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch patient profile
      const resP = await fetch(`${API_URL}/patients`, { headers });
      const dataP = await resP.json();

      let profile = null;
      let appointments = [];
      let labOrders = [];
      let consultations = [];
      let bills = [];

      if (dataP.success) {
        profile = dataP.patients.find(p => p.email === user.email) || null;
        if (profile) {
          const pId = profile._id;
          const [resA, resL, resC, resB] = await Promise.all([
            fetch(`${API_URL}/appointments?patient=${pId}`, { headers }),
            fetch(`${API_URL}/labs?patient=${pId}`, { headers }),
            fetch(`${API_URL}/clinical/consultations?patient=${pId}`, { headers }),
            fetch(`${API_URL}/billing?patient=${pId}`, { headers })
          ]);

          const [dataA, dataL, dataC, dataB] = await Promise.all([
            resA.json(), resL.json(), resC.json(), resB.json()
          ]);

          if (dataA.success) appointments = dataA.appointments;
          if (dataL.success) labOrders = dataL.labOrders;
          if (dataC.success) consultations = dataC.consultations;
          if (dataB.success) bills = dataB.bills;
        }
      }

      // Fetch Doctors list
      const resD = await fetch(`${API_URL}/auth/users?role=Doctor`, { headers });
      const dataD = await resD.json();
      const doctors = dataD.success ? dataD.users : [];

      return { profile, appointments, labOrders, consultations, bills, doctors };
    } catch (err) {
      return rejectWithValue('Failed to load patient records');
    }
  }
);

const patientSlice = createSlice({
  name: 'patient',
  initialState: {
    profile: null,
    appointments: [],
    labOrders: [],
    consultations: [],
    bills: [],
    doctors: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPatientData(state) {
      state.profile = null;
      state.appointments = [];
      state.labOrders = [];
      state.consultations = [];
      state.bills = [];
      state.doctors = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.appointments = action.payload.appointments;
        state.labOrders = action.payload.labOrders;
        state.consultations = action.payload.consultations;
        state.bills = action.payload.bills;
        state.doctors = action.payload.doctors;
      })
      .addCase(fetchPatientDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load patient data';
      });
  }
});

export const { clearPatientData } = patientSlice.actions;
export default patientSlice.reducer;
