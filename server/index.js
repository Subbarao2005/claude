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

// 1. CORS — FIRST middleware
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
    
    // Log but still allow in development - you can restrict this in prod if desired
    return callback(null, true)
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: [
    'Content-Type','Authorization',
    'X-Requested-With','Accept','Origin'
  ]
}))
app.options('*', cors())

// 2. Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// 3. Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { 
    success: false, 
    message: 'Too many auth attempts. Try again in 15 minutes.' 
  }
})

app.use('/api', globalLimiter)
app.use('/api/auth', authLimiter)

// 4. Body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 5. Sanitization
app.use(mongoSanitize())
app.use(xss())

// 6. Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(
    process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
  ))
}

// 7. Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1
      ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime())
  })
})

// 8. Debug route
app.get('/api/debug', (req, res) => {
  res.status(200).json({
    status: 'running',
    mongoUri: process.env.MONGO_URI ? 'SET' : 'MISSING',
    jwtSecret: process.env.JWT_SECRET ? 'SET' : 'MISSING',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID 
      ? 'SET' : 'MISSING',
    razorpaySecret: process.env.RAZORPAY_KEY_SECRET 
      ? 'SET' : 'MISSING',
    nodeEnv: process.env.NODE_ENV,
    port: PORT
  })
})

// 9. Database
const connectDB = require('./config/db')
connectDB()

// 10. Routes
const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const paymentRoutes = require('./routes/paymentRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)

// 11. 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
})

// 12. Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  })
})

module.exports = app
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV}`)
  })
}
