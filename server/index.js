const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

dotenv.config();

const app = express();
app.use(compression()); // Compress all responses
const PORT = process.env.PORT || 5000;

// ─── PRODUCTION PROXY HANDLING ──────────────────────────────────────────────
// Required for Render to correctly identify client IPs for rate limiting
app.set('trust proxy', 1);

// ─── SECURITY HEADERS (RAZORPAY COMPLIANT) ──────────────────────────────────
// ─── SECURITY HEADERS (RAZORPAY COMPLIANT) ──────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP temporarily to debug connectivity
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ─── CORS CONFIGURATION ──────────────────────────────────────────────────────
app.use(cors({
  origin: true, // Allow all origins temporarily for debugging
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

app.get('/api/product-seed-emergency', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = [
      { title: "Bubble Waffle With Triple Chocolate", price: 199, category: "Bubble Waffle", description: "Icecream with three types of chocolate", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=400" },
      { title: "Croissant With Lotus Biscoff", price: 199, category: "Croissants", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=400" },
      { title: "Hot Chocolate", price: 99, category: "Melt-In Moments", image: "https://images.unsplash.com/photo-1544787210-2213d420436f?auto=format&fit=crop&q=80&w=400" }
    ];
    await Product.deleteMany({});
    const result = await Product.insertMany(products);
    res.status(201).json({ success: true, message: `Seeded ${result.length} products successfully!` });
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
