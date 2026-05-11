const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ─── PRODUCTION PROXY HANDLING ──────────────────────────────────────────────
// Required for Render/Vercel/Heroku to correctly identify client IPs for rate limiting
app.set('trust proxy', 1)

// ─── SECURITY HEADERS ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// ─── CORS CONFIGURATION ──────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'https://claude-pi-lovat.vercel.app',
  'https://claude-l4uq3x6m2-subbarao-s-projects.vercel.app'
]

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true)
    
    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.endsWith('.vercel.app') || 
                     origin.includes('localhost');

    if (isAllowed) {
      callback(null, true)
    } else {
      console.error(`CORS blocked for origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}))
app.options('*', cors())

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
// Prevents brute-force and DDoS attacks
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  // Specifically for Render to avoid validation warnings
  validate: { trustProxy: false } 
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Stricter limit for auth routes
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    message: 'Too many login attempts. Please try again after 15 minutes.' 
  },
  validate: { trustProxy: false }
})

// Apply limiters
app.use('/api', globalLimiter)
app.use('/api/auth', authLimiter)

// ─── BODY PARSERS ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ─── DATA SANITIZATION ────────────────────────────────────────────────────────
app.use(mongoSanitize()) // Against NoSQL query injection
app.use(xss()) // Against XSS

// ─── LOGGING ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Root Health Route (Required for Render Health Checks)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Melcho API Running",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  })
})

// API Base Route (Fixes 404 when frontend checks connectivity)
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Melcho API v1 Base Route"
  })
})

// Legacy Health Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime())
  })
})

// API Debug Route
app.get('/api/debug', (req, res) => {
  res.status(200).json({
    status: 'running',
    mongoUri: process.env.MONGO_URI ? 'SET' : 'MISSING',
    jwtSecret: process.env.JWT_SECRET ? 'SET' : 'MISSING',
    nodeEnv: process.env.NODE_ENV,
    port: PORT
  })
})

// Import Route Handlers
const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const paymentRoutes = require('./routes/paymentRoutes')

// Mount Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)

// ─── EMERGENCY ADMIN SEED ROUTE ──────────────────────────────────────────────
// Visit this URL once to create the admin account in production
// URL: https://melcho-api.onrender.com/api/admin-setup-emergency
app.get('/api/admin-setup-emergency', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const Admin = require('./models/Admin');
    const email = 'admin@melcho.com';
    
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(200).json({ success: true, message: "Admin already exists!" });
    }

    const hashedPassword = await bcrypt.hash('Admin@Melcho2024', 12);
    await Admin.create({
      name: 'Melcho Admin',
      email: email,
      password: hashedPassword,
      role: 'admin'
    });

    res.status(201).json({ success: true, message: "Admin account created successfully! You can now login." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DATABASE CONNECTION ──────────────────────────────────────────────────────
const connectDB = require('./config/db')
connectDB()

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
})

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.status || 500
  console.error(`[ERROR] ${req.method} ${req.url} : ${err.message}`)
  if (process.env.NODE_ENV !== 'production') console.error(err.stack)

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message
  })
})

// ─── SERVER START & GRACEFUL SHUTDOWN ─────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`🚀 Melcho Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[CRITICAL] Unhandled Rejection: ${err.message}`)
  server.close(() => process.exit(1))
})

// Handle SIGTERM (e.g., from Render during redeploy)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('📦 Database connection closed.')
      process.exit(0)
    })
  })
})

module.exports = app
