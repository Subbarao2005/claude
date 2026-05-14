const Razorpay = require('razorpay')
const crypto = require('crypto')
const Order = require('../models/Order')
const Payment = require('../models/Payment')

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and orderId are required'
      })
    }

    if (!process.env.RAZORPAY_KEY_ID || 
        !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured'
      })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })

    const amountInPaise = Math.round(
      Number(amount) * 100
    )

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId.toString().slice(-20),
      notes: {
        orderId: orderId.toString(),
        userId: req.user.id
      }
    })

    await Payment.create({
      orderId,
      userId: req.user.id,
      razorpayOrderId: razorpayOrder.id,
      amount: Number(amount),
      status: 'pending'
    })

    return res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID
    })
  } catch (err) {
    console.error('Create Razorpay order error:', err)
    return res.status(500).json({
      success: false,
      message: err.message || 'Payment initialization failed'
    })
  }
}

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId
    } = req.body

    if (!razorpayOrderId || !razorpayPaymentId || 
        !razorpaySignature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'All payment verification fields are required'
      })
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    const isValid = expectedSignature === razorpaySignature

    if (!isValid) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'failed' }
      )
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed'
      })
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      })
    }

    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'successful'
      }
    )

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'successful',
      orderStatus: 'Pending'
    })

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      orderId
    })
  } catch (err) {
    console.error('Verify payment error:', err)
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

module.exports = { createRazorpayOrder, verifyPayment }
