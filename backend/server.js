const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const http      = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const socketManager = require('./utils/socketManager');

// Route files
const authRoutes     = require('./routes/auth');
const hospitalRoutes = require('./routes/hospital');
const patientRoutes  = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const clinicalRoutes = require('./routes/clinical');
const labRoutes      = require('./routes/labs');
const pharmacyRoutes = require('./routes/pharmacy');
const billingRoutes  = require('./routes/billing');
const paymentRoutes  = require('./routes/payment');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
const hardcodedOrigins = [
  'https://hospital-management-wk23.vercel.app',
  'https://hospital-management-2q91.vercel.app',
  'https://voguemark.shop',
  'https://www.voguemark.shop',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
];

const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : [];

const allowedOrigins = [...new Set([...hardcodedOrigins, ...envOrigins])];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^https:\/\/([a-z0-9-]+\.)?voguemark\.shop$/.test(origin)) return callback(null, true);
    if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return callback(null, true);
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    console.warn(`CORS blocked: ${origin}`);
    return callback(new Error(`CORS blocked: origin ${origin} not allowed`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Mount routers
app.use('/api/auth',        authRoutes);
app.use('/api/hospital',    hospitalRoutes);
app.use('/api/patients',    patientRoutes);
app.use('/api/appointments',appointmentRoutes);
app.use('/api/clinical',    clinicalRoutes);
app.use('/api/labs',        labRoutes);
app.use('/api/pharmacy',    pharmacyRoutes);
app.use('/api/billing',     billingRoutes);
app.use('/api/payment',     paymentRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Hospital Management System API is running...');
});

// ─── HTTP server + Socket.io ──────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    credentials: true,
  },
});

// Initialise the socket manager with the io instance
socketManager.init(io);

io.on('connection', (socket) => {
  // Client sends its userId immediately after connecting so we can map it
  socket.on('register', (userId) => {
    if (userId) {
      socketManager.registerSocket(userId, socket.id);
      console.log(`[Socket] User ${userId} connected → socket ${socket.id}`);
    }
  });

  socket.on('disconnect', () => {
    socketManager.unregisterSocket(socket.id);
    console.log(`[Socket] Socket ${socket.id} disconnected`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
