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
const paymentRoutes = require('./routes/payment');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
// CLIENT_URL env var = comma-separated list of extra allowed origins (set on Render)
const hardcodedOrigins = [
  'https://hospital-management-wk23.vercel.app',
  'https://hospital-management-2q91.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
];

const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : [];

const allowedOrigins = [...new Set([...hardcodedOrigins, ...envOrigins])];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow no-origin requests (curl, Postman, mobile)
      if (!origin) return callback(null, true);

      // Allow exact-match origins
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Allow ANY *.vercel.app preview URL
      if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return callback(null, true);

      // Allow localhost on any port
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);

      console.warn(`CORS blocked: ${origin}`);
      return callback(new Error(`CORS blocked: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinical', clinicalRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Hospital Management System API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
