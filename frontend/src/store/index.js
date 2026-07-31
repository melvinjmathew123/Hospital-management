import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import patientReducer from './slices/patientSlice';
import hospitalReducer from './slices/hospitalSlice';
import clinicalReducer from './slices/clinicalSlice';
import pharmacyReducer from './slices/pharmacySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patient: patientReducer,
    hospital: hospitalReducer,
    clinical: clinicalReducer,
    pharmacy: pharmacyReducer,
  },
});

export default store;
