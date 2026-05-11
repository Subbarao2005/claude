const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── PRODUCTION PROXY HANDLING ──────────────────────────────────────────────
// Required for Render to correctly identify client IPs for rate limiting
app.set('trust proxy', 1);

// ─── SECURITY HEADERS (RAZORPAY COMPLIANT) ──────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://tds.razorpay.com"],
      imgSrc: ["'self'", "data:", "https://*.razorpay.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ─── CORS CONFIGURATION ──────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'https://claude-pi-lovat.vercel.app',
  'https://claude-l4uq3x6m2-subbarao-s-projects.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.endsWith('.vercel.app') || 
                     origin.includes('localhost');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors());

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  validate: { trustProxy: false } 
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    message: 'Too many login attempts. Please try again after 15 minutes.' 
  },
  validate: { trustProxy: false }
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

// ─── BODY PARSERS ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── DATA SANITIZATION ────────────────────────────────────────────────────────
app.use(mongoSanitize());
app.use(xss());

// ─── LOGGING ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Melcho API Running",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Melcho API v1 Base Route"
  });
});

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// ─── EMERGENCY ADMIN SEED ROUTE ──────────────────────────────────────────────
app.get('/api/admin-setup-emergency', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const Admin = require('./models/Admin');
    const email = 'admin@melcho.com';
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(200).json({ success: true, message: "Admin already exists!" });
    const hashedPassword = await bcrypt.hash('Admin@Melcho2024', 12);
    await Admin.create({ name: 'Melcho Admin', email, password: hashedPassword, role: 'admin' });
    res.status(201).json({ success: true, message: "Admin account created successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DATABASE CONNECTION ──────────────────────────────────────────────────────
const connectDB = require('./config/db');
connectDB();

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  console.error(`[ERROR] ${req.method} ${req.url} : ${err.message}`);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal server error' : err.message
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Melcho Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close(false, () => process.exit(0));
  });
});

module.exports = app;
