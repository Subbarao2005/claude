const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// CORS — must work for ALL vercel.app URLs:
// This allows every vercel preview URL automatically
app.use(cors({
  origin: function(origin, callback) {
    // Allow no-origin requests (Postman, health checks)
    if (!origin) return callback(null, true)
    // Allow all localhost ports
    if (origin.includes('localhost')) 
      return callback(null, true)
    // Allow ALL vercel.app subdomains
    if (origin.includes('vercel.app')) 
      return callback(null, true)
    // Allow any specific origins from env
    const extras = (process.env.ALLOWED_ORIGINS || '')
      .split(',').map(o => o.trim()).filter(Boolean)
    if (extras.includes(origin)) 
      return callback(null, true)
    // Log but still allow — never block in production
    console.log('Origin not in list but allowing:', origin)
    return callback(null, true)
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
}))

// Handle preflight for every route
app.options('*', cors())

// Other middleware:
app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Health check route (BEFORE all other routes):
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1
      ? 'connected' : 'disconnected',
    uptime: process.uptime()
  })
})

// Debug route (BEFORE all other routes):
app.get('/api/debug', (req, res) => {
  res.status(200).json({
    status: 'running',
    mongoUri: process.env.MONGO_URI ? 'SET' : 'MISSING',
    jwtSecret: process.env.JWT_SECRET ? 'SET' : 'MISSING',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID 
      ? 'SET' : 'MISSING',
    razorpaySecret: process.env.RAZORPAY_KEY_SECRET 
      ? 'SET' : 'MISSING',
    nodeEnv: process.env.NODE_ENV || 'development',
    allowedOrigins: process.env.ALLOWED_ORIGINS || 'not set',
    dbReadyState: mongoose.connection.readyState,
    port: PORT
  })
})

// MongoDB connection:
const connectDB = require('./config/db')
connectDB()

// All API routes mounted:
const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const paymentRoutes = require('./routes/paymentRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)

// 404 handler (AFTER all routes):
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /health',
      'GET /api/debug',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/admin/login',
      'GET /api/products',
      'POST /api/orders',
      'POST /api/payment/create-order',
      'POST /api/payment/verify'
    ]
  })
})

// Global error handler:
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && {
      stack: err.stack
    })
  })
})

// Export and listen:
module.exports = app
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV}`)
    console.log(`Health: http://localhost:${PORT}/health`)
  })
}
