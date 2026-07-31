import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from './authSlice';

export const fetchHospitalData = createAsyncThunk(
  'hospital/fetchHospitalData',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [resD, resW, resB, resU, resP] = await Promise.all([
        fetch(`${API_URL}/hospital/departments`, { headers }),
        fetch(`${API_URL}/hospital/wards`, { headers }),
        fetch(`${API_URL}/hospital/beds`, { headers }),
        fetch(`${API_URL}/auth/users`, { headers }),
        fetch(`${API_URL}/patients`, { headers })
      ]);

      const [dataD, dataW, dataB, dataU, dataP] = await Promise.all([
        resD.json(), resW.json(), resB.json(), resU.json(), resP.json()
      ]);

      return {
        departments: dataD.success ? dataD.departments : [],
        wards: dataW.success ? dataW.wards : [],
        beds: dataB.success ? dataB.beds : [],
        users: dataU.success ? dataU.users : [],
        patients: dataP.success ? dataP.patients : []
      };
    } catch (err) {
      return rejectWithValue('Failed to load hospital infrastructure data');
    }
  }
);

const hospitalSlice = createSlice({
  name: 'hospital',
  initialState: {
    departments: [],
    wards: [],
    beds: [],
    users: [],
    patients: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHospitalData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHospitalData.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload.departments;
        state.wards = action.payload.wards;
        state.beds = action.payload.beds;
        state.users = action.payload.users;
        state.patients = action.payload.patients;
      })
      .addCase(fetchHospitalData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error loading hospital data';
      });
  }
});

export default hospitalSlice.reducer;
