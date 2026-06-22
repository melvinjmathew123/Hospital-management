const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/auth');
const hospitalRoutes = require('./routes/hospital');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const clinicalRoutes = require('./routes/clinical');
const labRoutes = require('./routes/labs');
const pharmacyRoutes = require('./routes/pharmacy');
const billingRoutes = require('./routes/billing');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/billing', billingRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Hospital Management System API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
