import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from './authSlice';

export const fetchDoctorDashboardData = createAsyncThunk(
  'clinical/fetchDoctorDashboardData',
  async (_, { getState, rejectWithValue }) => {
    const { token, user } = getState().auth;
    if (!token || !user) return rejectWithValue('Not authenticated');

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [resA, resP, resC] = await Promise.all([
        fetch(`${API_URL}/appointments?doctor=${user._id}`, { headers }),
        fetch(`${API_URL}/patients`, { headers }),
        fetch(`${API_URL}/clinical/consultations?doctor=${user._id}`, { headers })
      ]);

      const [dataA, dataP, dataC] = await Promise.all([
        resA.json(), resP.json(), resC.json()
      ]);

      return {
        appointments: dataA.success ? dataA.appointments : [],
        patients: dataP.success ? dataP.patients : [],
        historyLogs: dataC.success ? dataC.consultations : []
      };
    } catch (err) {
      return rejectWithValue('Failed to load doctor dashboard data');
    }
  }
);

export const fetchLabOrders = createAsyncThunk(
  'clinical/fetchLabOrders',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`${API_URL}/labs`, { headers });
      const data = await res.json();
      if (data.success) {
        return data.labOrders;
      } else {
        return rejectWithValue(data.message || 'Failed to fetch lab orders');
      }
    } catch (err) {
      return rejectWithValue('Failed to fetch lab orders');
    }
  }
);

const clinicalSlice = createSlice({
  name: 'clinical',
  initialState: {
    appointments: [],
    patients: [],
    historyLogs: [],
    labOrders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchDoctorDashboardData
      .addCase(fetchDoctorDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.appointments;
        state.patients = action.payload.patients;
        state.historyLogs = action.payload.historyLogs;
      })
      .addCase(fetchDoctorDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchLabOrders
      .addCase(fetchLabOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLabOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.labOrders = action.payload;
      })
      .addCase(fetchLabOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default clinicalSlice.reducer;
