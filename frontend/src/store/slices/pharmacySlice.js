import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from './authSlice';

export const fetchPharmacyData = createAsyncThunk(
  'pharmacy/fetchPharmacyData',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    if (!token) return rejectWithValue('Not authenticated');

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [resC, resI] = await Promise.all([
        fetch(`${API_URL}/clinical/consultations`, { headers }),
        fetch(`${API_URL}/pharmacy/inventory`, { headers })
      ]);

      const [dataC, dataI] = await Promise.all([resC.json(), resI.json()]);

      return {
        prescriptions: dataC.success ? dataC.consultations : [],
        inventory: dataI.success ? dataI.inventory : []
      };
    } catch (err) {
      return rejectWithValue('Failed to load pharmacy data');
    }
  }
);

const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState: {
    prescriptions: [],
    inventory: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPharmacyData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPharmacyData.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload.prescriptions;
        state.inventory = action.payload.inventory;
      })
      .addCase(fetchPharmacyData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default pharmacySlice.reducer;
